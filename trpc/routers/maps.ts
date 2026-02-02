import { z } from "zod";

import { env } from "@/env/server";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";

const googleMapsAutofillSchema = z.object({
  name: z.string(),
  address: z.string().nullable(),
  latitude: z.string().nullable(),
  longitude: z.string().nullable(),
  website: z.string().nullable(),
  rating: z.number().nullable(),
  city: z.string().nullable(),
  countryCode: z.string().nullable(),
  countryName: z.string().nullable(),
  placeId: z.string().nullable(),
});

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

export const mapsRouter = createTRPCRouter({
  resolveGoogleMapsLink: protectedProcedure
    .input(z.object({ link: z.string() }))
    .output(
      z.union([
        z.object({ data: googleMapsAutofillSchema }),
        z.object({ error: z.string() }),
      ]),
    )
    .mutation(async ({ input }) => {
      if (!env.GOOGLE_MAPS_API_KEY) {
        return { error: "Google Maps API key is not configured." };
      }

      if (!input.link.trim()) {
        return { error: "Paste a Google Maps link to continue." };
      }

      const finalUrl = await resolveFinalUrl(input.link);
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
    }),
});
