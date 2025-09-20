import { getCarById } from "@/actions/list-cars";

export async function generateMetaData({ params }) {
  const { id } = await params;
  const result = await getCarById(id);

  if (!result.success) {
    return {
      title: "Car Not Found | CarZone",
      description: "The requested car is not found",
    };
  }

  const car = result.data;

  return {
    title: `${car.year} ${car.make} ${car.model} | CarZone`,
    description: car.description.substring(0, 160),
    openGraph: {
      images: car.images?.[0] ? [car.images[0]] : [],
    },
  };
}

export default async function CarPage({ params }) {
  const { id } = await params;
  const result = await getCarById(id);

  return <div>CarPage : {id}</div>;
}
