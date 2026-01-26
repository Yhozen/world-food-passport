import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    DATABASE_URL: z.url(),
    NEON_AUTH_BASE_URL: z.url(),
    BLOB_READ_WRITE_TOKEN: z.string(),
  },

  experimental__runtimeEnv: process.env,
});
