"use server";

import { revalidatePath } from "next/cache";
import { neonAuth } from "@neondatabase/auth/next/server";
import { put, del } from "@vercel/blob";
import { env } from "@/env/server";
import { prisma } from "@/lib/prisma";
import { Prisma, type Photo, type Restaurant, type Review } from "@prisma/client";

async function requireUser() {
  const { user } = await neonAuth();
  return user ?? null;
}

interface GoogleMapsAutofillResult {
  name: string;
  address: string | null;
  latitude: string | null;
  longitude: string | null;
  website: string | null;
  rating: number | null;
  city: string | null;
  countryCode: string | null;
  countryName: string | null;
  placeId: string | null;
}

function ensureUrl(rawLink: string): string {
  const trimmed = rawLink.trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

async function resolveFinalUrl(rawLink: string): Promise<string> {
  const url = ensureUrl(rawLink);
  if (!url) return "";

  try {
    const response = await fetch(url, { redirect: "follow", cache: "no-store" });
    return response.url || url;
  } catch {
    return url;
  }
}

function extractPlaceIdFromUrl(url: URL): string | null {
  const direct = url.searchParams.get("place_id");
  if (direct) return direct;

  const queryPlaceId = url.searchParams.get("query_place_id");
  if (queryPlaceId) return queryPlaceId;

  const q = url.searchParams.get("q") || "";
  if (q.startsWith("place_id:")) {
    return q.replace("place_id:", "").trim();
  }

  return null;
}

function extractLatLng(url: URL): { lat: string; lng: string } | null {
  const pathMatch = url.href.match(/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/);
  if (pathMatch) {
    return { lat: pathMatch[1], lng: pathMatch[2] };
  }

  const query =
    url.searchParams.get("q") ||
    url.searchParams.get("query") ||
    url.searchParams.get("ll");
  if (!query) return null;

  const queryMatch = query.match(/(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)/);
  if (queryMatch) {
    return { lat: queryMatch[1], lng: queryMatch[2] };
  }

  return null;
}

function extractQueryText(url: URL): string | null {
  const query = url.searchParams.get("query") || url.searchParams.get("q");
  if (!query) return null;
  if (query.match(/(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)/)) {
    return null;
  }
  if (query.startsWith("place_id:")) return null;
  return query;
}

function extractPlaceNameFromPath(url: URL): string | null {
  const placeMatch = url.pathname.match(/\/maps\/place\/([^/]+)/);
  const fallbackMatch = url.pathname.match(/\/place\/([^/]+)/);
  const rawSegment = placeMatch?.[1] || fallbackMatch?.[1];
  if (!rawSegment) return null;

  const cleaned = rawSegment.split("@")[0];
  if (!cleaned) return null;

  const normalized = cleaned.replace(/\+/g, " ");
  try {
    return decodeURIComponent(normalized).trim();
  } catch {
    return normalized.trim();
  }
}

function pickAddressComponent(
  components: Array<{ long_name: string; short_name: string; types: string[] }>,
  type: string,
): { long_name: string; short_name: string } | null {
  const match = components.find((component) => component.types.includes(type));
  return match
    ? { long_name: match.long_name, short_name: match.short_name }
    : null;
}

function resolveCity(
  components: Array<{ long_name: string; short_name: string; types: string[] }>,
): string | null {
  return (
    pickAddressComponent(components, "locality")?.long_name ||
    pickAddressComponent(components, "postal_town")?.long_name ||
    pickAddressComponent(components, "administrative_area_level_2")?.long_name ||
    pickAddressComponent(components, "administrative_area_level_1")?.long_name ||
    null
  );
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    throw new Error("Google Maps request failed");
  }
  return response.json() as Promise<T>;
}

async function findPlaceIdByNearbySearch(
  query: string,
  latLng: { lat: string; lng: string },
): Promise<string | null> {
  const nearbyUrl = new URL(
    "https://maps.googleapis.com/maps/api/place/nearbysearch/json",
  );
  nearbyUrl.searchParams.set("keyword", query);
  nearbyUrl.searchParams.set("location", `${latLng.lat},${latLng.lng}`);
  nearbyUrl.searchParams.set("radius", "150");
  nearbyUrl.searchParams.set("key", env.GOOGLE_MAPS_API_KEY);

  const nearbyResponse = await fetchJson<{
    status: string;
    results: Array<{ place_id: string }>;
  }>(nearbyUrl.toString());

  if (nearbyResponse.status !== "OK" || nearbyResponse.results.length === 0) {
    return null;
  }

  return nearbyResponse.results[0].place_id;
}

async function findPlaceIdByTextSearch(
  query: string,
  latLng?: { lat: string; lng: string },
): Promise<string | null> {
  const findPlaceUrl = new URL(
    "https://maps.googleapis.com/maps/api/place/findplacefromtext/json",
  );
  findPlaceUrl.searchParams.set("input", query);
  findPlaceUrl.searchParams.set("inputtype", "textquery");
  findPlaceUrl.searchParams.set("fields", "place_id");
  if (latLng) {
    findPlaceUrl.searchParams.set(
      "locationbias",
      `point:${latLng.lat},${latLng.lng}`,
    );
  }
  findPlaceUrl.searchParams.set("key", env.GOOGLE_MAPS_API_KEY);

  const findPlaceResponse = await fetchJson<{
    status: string;
    candidates: Array<{ place_id: string }>;
  }>(findPlaceUrl.toString());

  if (
    findPlaceResponse.status !== "OK" ||
    findPlaceResponse.candidates.length === 0
  ) {
    return null;
  }

  return findPlaceResponse.candidates[0].place_id;
}

export async function resolveGoogleMapsLink(link: string): Promise<
  | { data: GoogleMapsAutofillResult; error?: undefined }
  | { data?: undefined; error: string }
> {
  if (!env.GOOGLE_MAPS_API_KEY) {
    return { error: "Google Maps API key is not configured." };
  }

  if (!link.trim()) {
    return { error: "Paste a Google Maps link to continue." };
  }

  const finalUrl = await resolveFinalUrl(link);
  if (!finalUrl) return { error: "Invalid Google Maps link." };

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(finalUrl);
  } catch {
    return { error: "Invalid Google Maps link." };
  }

  const placeIdFromUrl = extractPlaceIdFromUrl(parsedUrl);
  const latLng = extractLatLng(parsedUrl);
  const queryText = extractQueryText(parsedUrl);
  const placeName = extractPlaceNameFromPath(parsedUrl);

  let placeId = placeIdFromUrl;

  if (!placeId && placeName && latLng) {
    placeId = await findPlaceIdByNearbySearch(placeName, latLng);
  }

  if (!placeId && placeName) {
    placeId = await findPlaceIdByTextSearch(placeName, latLng || undefined);
  }

  if (!placeId && queryText) {
    placeId = await findPlaceIdByTextSearch(queryText, latLng || undefined);
  }

  if (!placeId && latLng) {
    const geocodeUrl = new URL(
      "https://maps.googleapis.com/maps/api/geocode/json",
    );
    geocodeUrl.searchParams.set("latlng", `${latLng.lat},${latLng.lng}`);
    geocodeUrl.searchParams.set("key", env.GOOGLE_MAPS_API_KEY);

    const geocodeResponse = await fetchJson<{
      status: string;
      results: Array<{ place_id: string }>;
    }>(geocodeUrl.toString());

    if (geocodeResponse.status !== "OK" || geocodeResponse.results.length === 0) {
      return { error: "Unable to resolve this location from the link." };
    }

    placeId = geocodeResponse.results[0].place_id;
  }

  if (!placeId) {
    return { error: "Unable to extract a place from this link." };
  }

  const detailsUrl = new URL(
    "https://maps.googleapis.com/maps/api/place/details/json",
  );
  detailsUrl.searchParams.set("place_id", placeId);
  detailsUrl.searchParams.set(
    "fields",
    "name,formatted_address,geometry,website,rating,address_components,place_id",
  );
  detailsUrl.searchParams.set("key", env.GOOGLE_MAPS_API_KEY);

  const detailsResponse = await fetchJson<{
    status: string;
    result?: {
      name?: string;
      formatted_address?: string;
      geometry?: { location?: { lat?: number; lng?: number } };
      website?: string;
      rating?: number;
      address_components?: Array<{
        long_name: string;
        short_name: string;
        types: string[];
      }>;
      place_id?: string;
    };
  }>(detailsUrl.toString());

  if (detailsResponse.status !== "OK" || !detailsResponse.result) {
    return { error: "Unable to load place details from Google." };
  }

  const components = detailsResponse.result.address_components || [];
  const country = pickAddressComponent(components, "country");

  return {
    data: {
      name: detailsResponse.result.name || "",
      address: detailsResponse.result.formatted_address || null,
      latitude:
        detailsResponse.result.geometry?.location?.lat !== undefined
          ? detailsResponse.result.geometry.location.lat.toString()
          : null,
      longitude:
        detailsResponse.result.geometry?.location?.lng !== undefined
          ? detailsResponse.result.geometry.location.lng.toString()
          : null,
      website: detailsResponse.result.website || null,
      rating:
        typeof detailsResponse.result.rating === "number"
          ? detailsResponse.result.rating
          : null,
      city: resolveCity(components),
      countryCode: country?.short_name || null,
      countryName: country?.long_name || null,
      placeId: detailsResponse.result.place_id || placeId,
    },
  };
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
  const address = (formData.get("address") as string) || null;
  const website = (formData.get("website") as string) || null;
  const googleMapsUrl = (formData.get("google_maps_url") as string) || null;
  const latitude = (formData.get("latitude") as string) || null;
  const longitude = (formData.get("longitude") as string) || null;
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
      address,
      website,
      googleMapsUrl,
      latitude: latitude ? new Prisma.Decimal(latitude) : null,
      longitude: longitude ? new Prisma.Decimal(longitude) : null,
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
    `world-food-passport/${user.id}/${restaurantId}/${Date.now()}-${file.name}`,
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

export async function getCountryVisits(): Promise<Record<string, number>> {
  const user = await requireUser();
  if (!user) return {};

  const result = await prisma.countriesVisited.findMany({
    where: { userId: user.id },
    select: { countryCode: true, visitCount: true },
  });

  return Object.fromEntries(
    result.map((row) => [row.countryCode, row.visitCount]),
  );
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
