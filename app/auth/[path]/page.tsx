import { AuthView } from "@neondatabase/auth/react";

interface AuthPageProps {
  params: Promise<{ path: string }>;
}

export default async function AuthPage({ params }: AuthPageProps) {
  const { path } = await params;

  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-6">
      <AuthView path={path} />
    </main>
  );
}
