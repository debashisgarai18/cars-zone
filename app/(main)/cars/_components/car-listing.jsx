"use client";

import { getCarList } from "@/actions/list-cars";
import useFetch from "@/hooks/use-fetch";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import CarListingLoading from "./car-listing-loading";
import { Info } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CarCard } from "@/components/car-card";

export default function CarListing() {
  const searchParam = useSearchParams();
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 6;

  const search = searchParam.get("search") || "";
  const make = searchParam.get("make") || "";
  const bodyType = searchParam.get("bodyType") || "";
  const fuelType = searchParam.get("fuelType") || "";
  const transmission = searchParam.get("transmission") || "";
  const minPrice = searchParam.get("minPrice") || 0;
  const maxPrice = searchParam.get("maxPrice") || Number.MAX_SAFE_INTEGER;
  const sortBy = searchParam.get("sortBy") || "newest";
  const page = parseInt(searchParam.get("page") || "1");

  const { loading, fn: fetchCars, data: result, error } = useFetch(getCarList);

  useEffect(() => {
    fetchCars({
      search,
      make,
      bodyType,
      fuelType,
      transmission,
      minPrice,
      maxPrice,
      sortBy,
      page,
      limit,
    });
  }, [
    search,
    make,
    bodyType,
    fuelType,
    transmission,
    minPrice,
    maxPrice,
    sortBy,
    page,
    limit,
  ]);

  if (loading && !result) {
    return <CarListingLoading />;
  }

  if (error || (!result && !result?.success)) {
    <Alert variant=" destructive">
      <Info className="h-4 w-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>
        Failed to load cars! Please try again later.
      </AlertDescription>
    </Alert>;
  }

  if (!result || !result?.data) {
    return null;
  }

  const { data: cars, pagination } = result;

  if (cars.length === 0) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center text-center p-8 border rounded-lg bg-gray-50">
        <div className="bg-gray-100 p-4 rounded-full mb-4">
          <Info className="w-8 h-8 text-gray-500" />
        </div>
        <h3 className="text-lg font-medium mb-2">No cars found</h3>
        <p className="text-gray-500 mb-6 max-w-md">
          We couldn't find any cars matching your search criteria. Try adjusting
          your filters or search term.
        </p>
        <Button variant="outline" asChild>
          <Link href="/cars">Clear all filters</Link>
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <p className="text-gray-600">
          Showing{" "}
          <span className="font-medium">
            {(page - 1) * limit + 1} -{" "}
            {Math.min(page * limit, pagination.total)}
          </span>{" "}
          of <span className="font-medium">{pagination.total}</span> cars
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cars.map((car) => (
          <CarCard key={car.id} car={car} />
        ))}
      </div>
    </div>
  );
}
