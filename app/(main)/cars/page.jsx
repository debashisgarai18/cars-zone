import { getCarFilters } from "@/actions/list-cars";
import CarFilters from "./_components/car-filters";
import CarListing from "./_components/car-listing";

export const metadata = {
  title: "Cars",
  description: "Browse and search for cars",
};

export default async function CarsPage() {
  const filtersData = await getCarFilters();

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-6xl mb-4 gradient-title">Browse Cars</h1>
      <div className="flex flex-col lg:flex-row gap-8">
        {/* filters */}
        <div className="w-full lg:w-80 flex-shrink-0">
          <CarFilters filters={filtersData.data} />
        </div>
        {/* list cars */}
        <div className="flex-1">
          <CarListing />
        </div>
      </div>
    </div>
  );
}
