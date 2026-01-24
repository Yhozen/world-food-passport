"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { sql, type Restaurant, type Review, type Photo } from "./db";
import { getSession, createSession, destroySession } from "./auth";
import { put, del } from "@vercel/blob";
import bcrypt from "bcryptjs";

// Auth actions
export async function signUp(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const name = formData.get("name") as string;

  if (!email || !password) {
    return { error: "Email and password are required" };
  }

  // Check if user exists
  const existing = await sql`SELECT id FROM users WHERE email = ${email}`;
  if (existing.length > 0) {
    return { error: "User already exists" };
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create user
  const result = await sql`
    INSERT INTO users (email, password_hash, name)
    VALUES (${email}, ${hashedPassword}, ${name || null})
    RETURNING id, email, name
  `;

  const user = result[0];

  // Create session
  await createSession({
    userId: user.id,
    email: user.email,
    name: user.name,
  });

  redirect("/dashboard");
}

export async function signIn(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email and password are required" };
  }

  // Find user
  const result =
    await sql`SELECT id, email, name, password_hash FROM users WHERE email = ${email}`;
  if (result.length === 0) {
    return { error: "Invalid credentials" };
  }

  const user = result[0];

  // Verify password
  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    return { error: "Invalid credentials" };
  }

  // Create session
  await createSession({
    userId: user.id,
    email: user.email,
    name: user.name,
  });

  redirect("/dashboard");
}

export async function signOut() {
  await destroySession();
  redirect("/");
}

// Restaurant actions
export async function createRestaurant(formData: FormData) {
  const session = await getSession();
  if (!session) {
    return { error: "Unauthorized" };
  }

  const name = formData.get("name") as string;
  const countryCode = formData.get("country_code") as string;
  const countryName = formData.get("country_name") as string;
  const city = (formData.get("city") as string) || null;
  const cuisineTags = formData.get("cuisine_tags") as string;
  const visitDate = (formData.get("visit_date") as string) || null;
  const rating = formData.get("rating")
    ? parseInt(formData.get("rating") as string)
    : null;
  const review = (formData.get("review") as string) || null;

  if (!name || !countryCode || !countryName) {
    return { error: "Name and country are required" };
  }

  const tags = cuisineTags
    ? cuisineTags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
    : [];

  // Create restaurant
  const restaurantResult = await sql`
    INSERT INTO restaurants (user_id, name, country_code, country_name, city, cuisine_tags, visit_date, rating)
    VALUES (${session.userId}, ${name}, ${countryCode}, ${countryName}, ${city}, ${tags}, ${visitDate}, ${rating})
    RETURNING id
  `;

  const restaurantId = restaurantResult[0].id;

  // Create review if provided
  if (review) {
    await sql`
      INSERT INTO reviews (restaurant_id, user_id, content)
      VALUES (${restaurantId}, ${session.userId}, ${review})
    `;
  }

  // Update country visit count
  await sql`
    INSERT INTO countries_visited (user_id, country_code, country_name, visit_count)
    VALUES (${session.userId}, ${countryCode}, ${countryName}, 1)
    ON CONFLICT (user_id, country_code) 
    DO UPDATE SET visit_count = countries_visited.visit_count + 1, updated_at = NOW()
  `;

  revalidatePath("/dashboard");
  return { success: true, restaurantId };
}

export async function updateRestaurant(formData: FormData) {
  const session = await getSession();
  if (!session) {
    return { error: "Unauthorized" };
  }

  const id = formData.get("id") as string;
  const name = formData.get("name") as string;
  const city = (formData.get("city") as string) || null;
  const cuisineTags = formData.get("cuisine_tags") as string;
  const visitDate = (formData.get("visit_date") as string) || null;
  const rating = formData.get("rating")
    ? parseInt(formData.get("rating") as string)
    : null;

  const tags = cuisineTags
    ? cuisineTags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
    : [];

  await sql`
    UPDATE restaurants 
    SET name = ${name}, city = ${city}, cuisine_tags = ${tags}, visit_date = ${visitDate}, rating = ${rating}, updated_at = NOW()
    WHERE id = ${id} AND user_id = ${session.userId}
  `;

  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteRestaurant(id: string) {
  const session = await getSession();
  if (!session) {
    return { error: "Unauthorized" };
  }

  // Get restaurant to update country count
  const restaurant = await sql`
    SELECT country_code FROM restaurants WHERE id = ${id} AND user_id = ${session.userId}
  `;

  if (restaurant.length === 0) {
    return { error: "Restaurant not found" };
  }

  // Delete photos from blob storage
  const photos = await sql`
    SELECT storage_url FROM photos WHERE restaurant_id = ${id} AND user_id = ${session.userId}
  `;

  for (const photo of photos) {
    try {
      await del(photo.storage_url);
    } catch {
      // Continue even if blob deletion fails
    }
  }

  // Delete photos, reviews, then restaurant
  await sql`DELETE FROM photos WHERE restaurant_id = ${id}`;
  await sql`DELETE FROM reviews WHERE restaurant_id = ${id}`;
  await sql`DELETE FROM restaurants WHERE id = ${id} AND user_id = ${session.userId}`;

  // Update country visit count
  await sql`
    UPDATE countries_visited 
    SET visit_count = visit_count - 1, updated_at = NOW()
    WHERE user_id = ${session.userId} AND country_code = ${restaurant[0].country_code}
  `;

  revalidatePath("/dashboard");
  return { success: true };
}

// Review actions
export async function saveReview(formData: FormData) {
  const session = await getSession();
  if (!session) {
    return { error: "Unauthorized" };
  }

  const restaurantId = formData.get("restaurant_id") as string;
  const content = formData.get("content") as string;

  // Check if review exists
  const existing = await sql`
    SELECT id FROM reviews WHERE restaurant_id = ${restaurantId} AND user_id = ${session.userId}
  `;

  if (existing.length > 0) {
    await sql`
      UPDATE reviews 
      SET content = ${content}, updated_at = NOW()
      WHERE restaurant_id = ${restaurantId} AND user_id = ${session.userId}
    `;
  } else {
    await sql`
      INSERT INTO reviews (restaurant_id, user_id, content)
      VALUES (${restaurantId}, ${session.userId}, ${content})
    `;
  }

  revalidatePath("/dashboard");
  return { success: true };
}

// Photo actions
export async function uploadPhoto(formData: FormData) {
  const session = await getSession();
  if (!session) {
    return { error: "Unauthorized" };
  }

  const restaurantId = formData.get("restaurant_id") as string;
  const file = formData.get("file") as File;
  const caption = (formData.get("caption") as string) || null;

  if (!file || !restaurantId) {
    return { error: "File and restaurant ID are required" };
  }

  // Upload to Vercel Blob
  const blob = await put(`food-passport/${session.userId}/${Date.now()}-${file.name}`, file, {
    access: "public",
  });

  // Save photo record
  await sql`
    INSERT INTO photos (restaurant_id, user_id, storage_url, caption)
    VALUES (${restaurantId}, ${session.userId}, ${blob.url}, ${caption})
  `;

  revalidatePath("/dashboard");
  return { success: true, url: blob.url };
}

export async function deletePhoto(id: string) {
  const session = await getSession();
  if (!session) {
    return { error: "Unauthorized" };
  }

  // Get photo URL to delete from blob
  const photo = await sql`
    SELECT storage_url FROM photos WHERE id = ${id} AND user_id = ${session.userId}
  `;

  if (photo.length > 0) {
    try {
      await del(photo[0].storage_url);
    } catch {
      // Continue even if blob deletion fails
    }
  }

  await sql`DELETE FROM photos WHERE id = ${id} AND user_id = ${session.userId}`;

  revalidatePath("/dashboard");
  return { success: true };
}

// Query functions
export async function getUserRestaurants(): Promise<Restaurant[]> {
  const session = await getSession();
  if (!session) return [];

  const result = await sql`
    SELECT * FROM restaurants 
    WHERE user_id = ${session.userId}
    ORDER BY created_at DESC
  `;

  return result as Restaurant[];
}

export async function getRestaurantsByCountry(
  countryCode: string
): Promise<Restaurant[]> {
  const session = await getSession();
  if (!session) return [];

  const result = await sql`
    SELECT * FROM restaurants 
    WHERE user_id = ${session.userId} AND country_code = ${countryCode}
    ORDER BY visit_date DESC NULLS LAST, created_at DESC
  `;

  return result as Restaurant[];
}

export async function getRestaurantWithDetails(id: string): Promise<{
  restaurant: Restaurant;
  review: Review | null;
  photos: Photo[];
} | null> {
  const session = await getSession();
  if (!session) return null;

  const restaurantResult = await sql`
    SELECT * FROM restaurants WHERE id = ${id} AND user_id = ${session.userId}
  `;

  if (restaurantResult.length === 0) return null;

  const reviewResult = await sql`
    SELECT * FROM reviews WHERE restaurant_id = ${id} AND user_id = ${session.userId}
  `;

  const photosResult = await sql`
    SELECT * FROM photos WHERE restaurant_id = ${id} AND user_id = ${session.userId}
    ORDER BY uploaded_at DESC
  `;

  return {
    restaurant: restaurantResult[0] as Restaurant,
    review: reviewResult.length > 0 ? (reviewResult[0] as Review) : null,
    photos: photosResult as Photo[],
  };
}

export async function getCountryVisits(): Promise<Map<string, number>> {
  const session = await getSession();
  if (!session) return new Map();

  const result = await sql`
    SELECT country_code, visit_count FROM countries_visited
    WHERE user_id = ${session.userId}
  `;

  return new Map(result.map((r) => [r.country_code, r.visit_count]));
}

export async function getUserStats(): Promise<{
  totalCountries: number;
  totalRestaurants: number;
  totalPhotos: number;
  cuisineBreakdown: { cuisine: string; count: number }[];
  recentVisits: Restaurant[];
}> {
  const session = await getSession();
  if (!session) {
    return {
      totalCountries: 0,
      totalRestaurants: 0,
      totalPhotos: 0,
      cuisineBreakdown: [],
      recentVisits: [],
    };
  }

  const countriesResult = await sql`
    SELECT COUNT(*) as count FROM countries_visited 
    WHERE user_id = ${session.userId} AND visit_count > 0
  `;

  const restaurantsResult = await sql`
    SELECT COUNT(*) as count FROM restaurants WHERE user_id = ${session.userId}
  `;

  const photosResult = await sql`
    SELECT COUNT(*) as count FROM photos WHERE user_id = ${session.userId}
  `;

  const cuisineResult = await sql`
    SELECT unnest(cuisine_tags) as cuisine, COUNT(*) as count
    FROM restaurants
    WHERE user_id = ${session.userId}
    GROUP BY cuisine
    ORDER BY count DESC
    LIMIT 10
  `;

  const recentResult = await sql`
    SELECT * FROM restaurants 
    WHERE user_id = ${session.userId}
    ORDER BY created_at DESC
    LIMIT 5
  `;

  return {
    totalCountries: parseInt(countriesResult[0].count),
    totalRestaurants: parseInt(restaurantsResult[0].count),
    totalPhotos: parseInt(photosResult[0].count),
    cuisineBreakdown: cuisineResult.map((r) => ({
      cuisine: r.cuisine,
      count: parseInt(r.count),
    })),
    recentVisits: recentResult as Restaurant[],
  };
}
