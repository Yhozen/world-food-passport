import { getQueryClient, trpc } from "@/trpc/server";
import { notFound } from "next/navigation";
import { RestaurantDetail } from "@/components/restaurant-detail";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function RestaurantPage({ params }: PageProps) {
  const { id } = await params;
  const queryClient = getQueryClient();
  const data = await queryClient.fetchQuery(
    trpc.restaurants.getWithDetails.queryOptions({ id }),
  );

  if (!data) {
    notFound();
  }

  return <RestaurantDetail data={data} />;
}
