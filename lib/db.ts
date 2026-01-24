import { neon } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

export const sql = neon(process.env.DATABASE_URL);

// Types for our database entities
export interface User {
  id: string;
  email: string;
  name: string | null;
  created_at: string;
}

export interface Restaurant {
  id: string;
  user_id: string;
  name: string;
  country_code: string;
  country_name: string;
  city: string | null;
  latitude: number | null;
  longitude: number | null;
  cuisine_tags: string[];
  visit_date: string | null;
  rating: number | null;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  restaurant_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface Photo {
  id: string;
  restaurant_id: string;
  user_id: string;
  storage_url: string;
  caption: string | null;
  uploaded_at: string;
}

export interface CountryVisit {
  country_code: string;
  country_name: string;
  visit_count: number;
}
