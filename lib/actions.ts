"use server";

import { revalidatePath } from "next/cache";
import { neonAuth } from "@neondatabase/auth/next/server";
import { put, del } from "@vercel/blob";
import { prisma } from "@/lib/prisma";
import type { Photo, Restaurant, Review } from "@prisma/client";

async function requireUser() {
  const { user } = await neonAuth();
  return user ?? null;
}

export async function createRestaurant(formData: FormData) {
  const user = await requireUser();
  if (!user) {
    return { error: "Unauthorized" };
  }

  const name = formData.get("name") as string;
  const countryCode = formData.get("country_code") as string;
  const countryName = formData.get("country_name") as string;
  const city = (formData.get("city") as string) || null;
  const cuisineTags = (formData.get("cuisine_tags") as string) || "";
  const visitDate = (formData.get("visit_date") as string) || null;
  const rating = formData.get("rating")
    ? parseInt(formData.get("rating") as string, 10)
    : null;
  const review = (formData.get("review") as string) || null;

  if (!name || !countryCode || !countryName) {
    return { error: "Name and country are required" };
  }

  const tags = cuisineTags
    ? cuisineTags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean)
    : [];

  const restaurant = await prisma.restaurant.create({
    data: {
      userId: user.id,
      name,
      countryCode,
      countryName,
      city,
      cuisineTags: tags,
      visitDate: visitDate ? new Date(visitDate) : null,
      rating,
    },
  });

  if (review) {
    await prisma.review.create({
      data: {
        restaurantId: restaurant.id,
        userId: user.id,
        content: review,
      },
    });
  }

  await prisma.countriesVisited.upsert({
    where: {
      userId_countryCode: {
        userId: user.id,
        countryCode,
      },
    },
    update: {
      visitCount: { increment: 1 },
      countryName,
    },
    create: {
      userId: user.id,
      countryCode,
      countryName,
      visitCount: 1,
    },
  });

  revalidatePath("/dashboard");
  return { success: true, restaurantId: restaurant.id };
}

export async function updateRestaurant(formData: FormData) {
  const user = await requireUser();
  if (!user) {
    return { error: "Unauthorized" };
  }

  const id = formData.get("id") as string;
  const name = formData.get("name") as string;
  const city = (formData.get("city") as string) || null;
  const cuisineTags = (formData.get("cuisine_tags") as string) || "";
  const visitDate = (formData.get("visit_date") as string) || null;
  const rating = formData.get("rating")
    ? parseInt(formData.get("rating") as string, 10)
    : null;

  const tags = cuisineTags
    ? cuisineTags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean)
    : [];

  await prisma.restaurant.updateMany({
    where: {
      id,
      userId: user.id,
    },
    data: {
      name,
      city,
      cuisineTags: tags,
      visitDate: visitDate ? new Date(visitDate) : null,
      rating,
    },
  });

  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteRestaurant(id: string) {
  const user = await requireUser();
  if (!user) {
    return { error: "Unauthorized" };
  }

  const restaurant = await prisma.restaurant.findFirst({
    where: {
      id,
      userId: user.id,
    },
    select: {
      id: true,
      countryCode: true,
    },
  });

  if (!restaurant) {
    return { error: "Restaurant not found" };
  }

  const photos = await prisma.photo.findMany({
    where: {
      restaurantId: id,
      userId: user.id,
    },
    select: {
      storageUrl: true,
    },
  });

  for (const photo of photos) {
    try {
      await del(photo.storageUrl);
    } catch {
      // Ignore blob deletion failures
    }
  }

  await prisma.$transaction([
    prisma.photo.deleteMany({
      where: { restaurantId: id },
    }),
    prisma.review.deleteMany({
      where: { restaurantId: id },
    }),
    prisma.restaurant.deleteMany({
      where: { id, userId: user.id },
    }),
    prisma.countriesVisited.updateMany({
      where: {
        userId: user.id,
        countryCode: restaurant.countryCode,
      },
      data: {
        visitCount: { decrement: 1 },
      },
    }),
  ]);

  revalidatePath("/dashboard");
  return { success: true };
}

export async function saveReview(formData: FormData) {
  const user = await requireUser();
  if (!user) {
    return { error: "Unauthorized" };
  }

  const restaurantId = formData.get("restaurant_id") as string;
  const content = formData.get("content") as string;

  await prisma.review.upsert({
    where: {
      restaurantId_userId: {
        restaurantId,
        userId: user.id,
      },
    },
    update: {
      content,
    },
    create: {
      restaurantId,
      userId: user.id,
      content,
    },
  });

  revalidatePath("/dashboard");
  return { success: true };
}

export async function uploadPhoto(formData: FormData) {
  const user = await requireUser();
  if (!user) {
    return { error: "Unauthorized" };
  }

  const restaurantId = formData.get("restaurant_id") as string;
  const file = formData.get("file") as File;
  const caption = (formData.get("caption") as string) || null;

  if (!file || !restaurantId) {
    return { error: "File and restaurant ID are required" };
  }

  const blob = await put(
    `food-passport/${user.id}/${restaurantId}/${Date.now()}-${file.name}`,
    file,
    {
      access: "public",
    },
  );

  await prisma.photo.create({
    data: {
      restaurantId,
      userId: user.id,
      storageUrl: blob.url,
      caption,
    },
  });

  revalidatePath("/dashboard");
  return { success: true, url: blob.url };
}

export async function deletePhoto(id: string) {
  const user = await requireUser();
  if (!user) {
    return { error: "Unauthorized" };
  }

  const photo = await prisma.photo.findFirst({
    where: {
      id,
      userId: user.id,
    },
  });

  if (photo) {
    try {
      await del(photo.storageUrl);
    } catch {
      // Ignore blob deletion failures
    }
  }

  await prisma.photo.deleteMany({
    where: {
      id,
      userId: user.id,
    },
  });

  revalidatePath("/dashboard");
  return { success: true };
}

export async function getUserRestaurants(): Promise<Restaurant[]> {
  const user = await requireUser();
  if (!user) return [];

  return prisma.restaurant.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });
}

export async function getRestaurantsByCountry(
  countryCode: string,
): Promise<Restaurant[]> {
  const user = await requireUser();
  if (!user) return [];

  return prisma.restaurant.findMany({
    where: {
      userId: user.id,
      countryCode,
    },
    orderBy: [{ visitDate: "desc" }, { createdAt: "desc" }],
  });
}

export async function getRestaurantWithDetails(id: string): Promise<{
  restaurant: Restaurant;
  review: Review | null;
  photos: Photo[];
} | null> {
  const user = await requireUser();
  if (!user) return null;

  const restaurant = await prisma.restaurant.findFirst({
    where: {
      id,
      userId: user.id,
    },
  });

  if (!restaurant) return null;

  const [review, photos] = await Promise.all([
    prisma.review.findFirst({
      where: {
        restaurantId: id,
        userId: user.id,
      },
    }),
    prisma.photo.findMany({
      where: {
        restaurantId: id,
        userId: user.id,
      },
      orderBy: { uploadedAt: "desc" },
    }),
  ]);

  return {
    restaurant,
    review,
    photos,
  };
}

export async function getCountryVisits(): Promise<Map<string, number>> {
  const user = await requireUser();
  if (!user) return new Map();

  const result = await prisma.countriesVisited.findMany({
    where: { userId: user.id },
    select: { countryCode: true, visitCount: true },
  });

  return new Map(result.map((row) => [row.countryCode, row.visitCount]));
}

export async function getUserStats(): Promise<{
  totalCountries: number;
  totalRestaurants: number;
  totalPhotos: number;
  cuisineBreakdown: { cuisine: string; count: number }[];
  recentVisits: Restaurant[];
}> {
  const user = await requireUser();
  if (!user) {
    return {
      totalCountries: 0,
      totalRestaurants: 0,
      totalPhotos: 0,
      cuisineBreakdown: [],
      recentVisits: [],
    };
  }

  const [
    totalCountries,
    totalRestaurants,
    totalPhotos,
    cuisineRows,
    recentVisits,
  ] = await Promise.all([
    prisma.countriesVisited.count({
      where: {
        userId: user.id,
        visitCount: { gt: 0 },
      },
    }),
    prisma.restaurant.count({
      where: { userId: user.id },
    }),
    prisma.photo.count({
      where: { userId: user.id },
    }),
    prisma.restaurant.findMany({
      where: { userId: user.id },
      select: { cuisineTags: true },
    }),
    prisma.restaurant.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  const cuisineMap = new Map<string, number>();
  for (const row of cuisineRows) {
    for (const tag of row.cuisineTags) {
      cuisineMap.set(tag, (cuisineMap.get(tag) ?? 0) + 1);
    }
  }

  const cuisineBreakdown = Array.from(cuisineMap.entries())
    .map(([cuisine, count]) => ({ cuisine, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return {
    totalCountries,
    totalRestaurants,
    totalPhotos,
    cuisineBreakdown,
    recentVisits,
  };
}
