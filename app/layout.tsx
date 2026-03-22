import type { Metadata } from "next";

import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { AuthProvider } from "@/components/auth-provider";
import { DM_Sans } from "next/font/google";
import { TRPCReactProvider } from "@/trpc/client";

const dmSans = DM_Sans({
	subsets: ["latin"],
	weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
	title: "World Food Passport",
	description: "World Food Passport",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body className={`${dmSans.className} font-sans antialiased`}>
				<AuthProvider>
					<TRPCReactProvider>{children}</TRPCReactProvider>
				</AuthProvider>
				<Analytics />
			</body>
		</html>
	);
}
