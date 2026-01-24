import { getRestaurantWithDetails } from "@/lib/actions";
import { notFound } from "next/navigation";
import { RestaurantDetail } from "@/components/restaurant-detail";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function RestaurantPage({ params }: PageProps) {
  const { id } = await params;
  const data = await getRestaurantWithDetails(id);

  if (!data) {
    notFound();
  }

  return <RestaurantDetail data={data} />;
}
