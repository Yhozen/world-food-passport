import { cookies } from "next/headers";

// Simple session-based auth using a secure cookie
// In production, you'd use a proper auth solution like Neon Auth

export interface Session {
  userId: string;
  email: string;
  name: string | null;
}

const SESSION_COOKIE = "food_passport_session";

export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE);

  if (!sessionCookie?.value) {
    return null;
  }

  try {
    const session = JSON.parse(
      Buffer.from(sessionCookie.value, "base64").toString()
    );
    return session as Session;
  } catch {
    return null;
  }
}

export async function createSession(session: Session): Promise<void> {
  const cookieStore = await cookies();
  const sessionValue = Buffer.from(JSON.stringify(session)).toString("base64");

  cookieStore.set(SESSION_COOKIE, sessionValue, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: "/",
  });
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}
