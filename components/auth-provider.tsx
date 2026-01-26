"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { NeonAuthUIProvider } from "@neondatabase/auth/react";
import { authClient } from "@/lib/auth/client";
import Link from "next/link";

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter();

  return (
    <NeonAuthUIProvider
      authClient={authClient}
      navigate={router.push as any}
      replace={router.replace as any}
      onSessionChange={() => router.refresh()}
      Link={Link as any}
    >
      {children}
    </NeonAuthUIProvider>
  );
}
