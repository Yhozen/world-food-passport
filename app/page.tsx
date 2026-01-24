import React from "react"
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Globe, Lock, Camera, MapPin, Utensils } from "lucide-react";

export default async function LandingPage() {
  const session = await getSession();
  if (session) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Neon glow effects */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/20 blur-[120px] pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-accent/10 blur-[100px] pointer-events-none -translate-x-1/2 -translate-y-1/2" />

        <div className="container mx-auto px-4 py-20 relative z-10">
          <nav className="flex items-center justify-between mb-20">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary border-4 border-black flex items-center justify-center shadow-[4px_4px_0px_0px_#000]">
                <Utensils className="w-6 h-6 text-black" />
              </div>
              <span className="text-2xl font-bold uppercase tracking-tight">
                Food Passport
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/sign-in"
                className="px-6 py-3 border-4 border-black bg-background text-foreground font-bold uppercase tracking-wide shadow-[4px_4px_0px_0px_#000] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className="px-6 py-3 border-4 border-black bg-primary text-black font-bold uppercase tracking-wide shadow-[4px_4px_0px_0px_#000] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
              >
                Get Started
              </Link>
            </div>
          </nav>

          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-7xl font-bold uppercase tracking-tight mb-6 leading-tight text-balance">
              Your Private
              <span className="block text-primary drop-shadow-[0_0_20px_rgba(191,255,0,0.5)]">
                Culinary Journey
              </span>
              Awaits
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
              Track every restaurant you visit around the world. Build your
              personal food map. Keep your reviews private.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
              <Link
                href="/sign-up"
                className="px-10 py-5 border-4 border-black bg-primary text-black font-bold text-xl uppercase tracking-wide shadow-[6px_6px_0px_0px_#000] hover:translate-x-1 hover:translate-y-1 hover:shadow-[2px_2px_0px_0px_#000] transition-all"
              >
                Start Your Passport
              </Link>
              <div className="flex items-center gap-2 text-accent">
                <Lock className="w-5 h-5" />
                <span className="font-mono text-sm uppercase">
                  100% Private
                </span>
              </div>
            </div>

            {/* Preview Map */}
            <div className="relative border-4 border-black bg-card p-8 shadow-[8px_8px_0px_0px_#000]">
              <div className="absolute -top-4 left-8 px-4 py-1 bg-accent text-black font-bold text-sm uppercase border-4 border-black">
                Preview
              </div>
              <div className="grid grid-cols-6 gap-2 mb-6">
                {[
                  { code: "JP", visits: 8, color: "bg-primary" },
                  { code: "IT", visits: 5, color: "bg-secondary" },
                  { code: "FR", visits: 3, color: "bg-secondary" },
                  { code: "TH", visits: 2, color: "bg-accent" },
                  { code: "MX", visits: 1, color: "bg-accent" },
                  { code: "ES", visits: 0, color: "bg-muted" },
                ].map((country) => (
                  <div
                    key={country.code}
                    className={`aspect-square ${country.color} border-4 border-black flex items-center justify-center font-bold text-black text-lg shadow-[3px_3px_0px_0px_#000]`}
                  >
                    {country.code}
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-center gap-6 text-sm font-mono">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-accent border-2 border-black" />
                  <span>1-2 visits</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-secondary border-2 border-black" />
                  <span>3-5 visits</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-primary border-2 border-black" />
                  <span>6+ visits</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-card border-t-4 border-black">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-bold uppercase text-center mb-16">
            How It Works
          </h2>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <FeatureCard
              icon={<Globe className="w-10 h-10" />}
              title="Explore The Map"
              description="Click any country on your world map to see restaurants you've visited there. Watch your map light up with every new destination."
              color="bg-primary"
            />
            <FeatureCard
              icon={<Camera className="w-10 h-10" />}
              title="Log Your Visits"
              description="Add restaurants with photos, ratings, and detailed notes. Capture the memories of every meal."
              color="bg-secondary"
            />
            <FeatureCard
              icon={<Lock className="w-10 h-10" />}
              title="Keep It Private"
              description="Your reviews are yours alone. No social sharing, no public profiles. Just your personal food journal."
              color="bg-accent"
            />
          </div>
        </div>
      </section>

      {/* Privacy Section */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto border-4 border-black bg-card p-12 shadow-[8px_8px_0px_0px_#000] relative">
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 px-6 py-2 bg-accent text-black font-bold uppercase border-4 border-black flex items-center gap-2">
              <Lock className="w-5 h-5" />
              <span>Private By Design</span>
            </div>

            <div className="text-center pt-4">
              <h3 className="text-3xl font-bold uppercase mb-6">
                Your Reviews, Your Eyes Only
              </h3>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                Unlike other food apps, Food Passport is built for{" "}
                <span className="text-foreground font-bold">you</span>, not for
                followers. Write honest reviews without worrying about what
                others think. Rate that overrated restaurant one star. Gush
                about your secret gem. It&apos;s all between you and your
                passport.
              </p>

              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-4 border-4 border-black bg-muted">
                  <div className="text-3xl font-bold text-primary mb-1">0</div>
                  <div className="text-sm font-mono uppercase">
                    Social Features
                  </div>
                </div>
                <div className="p-4 border-4 border-black bg-muted">
                  <div className="text-3xl font-bold text-secondary mb-1">0</div>
                  <div className="text-sm font-mono uppercase">
                    Public Profiles
                  </div>
                </div>
                <div className="p-4 border-4 border-black bg-muted">
                  <div className="text-3xl font-bold text-accent mb-1">100%</div>
                  <div className="text-sm font-mono uppercase">Your Data</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-primary border-t-4 border-black">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold uppercase text-black mb-6">
            Start Your Food Journey
          </h2>
          <p className="text-xl text-black/70 mb-10 max-w-xl mx-auto">
            Join food lovers who track their culinary adventures privately.
          </p>
          <Link
            href="/sign-up"
            className="inline-block px-12 py-5 border-4 border-black bg-black text-primary font-bold text-xl uppercase tracking-wide shadow-[6px_6px_0px_0px_rgba(0,0,0,0.3)] hover:translate-x-1 hover:translate-y-1 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)] transition-all"
          >
            Create Free Account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-background border-t-4 border-black">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Utensils className="w-5 h-5 text-primary" />
              <span className="font-bold uppercase">Food Passport</span>
            </div>
            <p className="text-sm text-muted-foreground font-mono">
              Your private culinary journal
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}) {
  return (
    <div className="border-4 border-black bg-background p-8 shadow-[6px_6px_0px_0px_#000] hover:-translate-y-1 transition-transform">
      <div
        className={`w-16 h-16 ${color} border-4 border-black flex items-center justify-center mb-6 shadow-[3px_3px_0px_0px_#000] text-black`}
      >
        {icon}
      </div>
      <h3 className="text-xl font-bold uppercase mb-3">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}
