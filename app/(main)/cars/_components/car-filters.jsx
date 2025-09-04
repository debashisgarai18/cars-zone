"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Filter } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import CarFilterControls from "./car-filter-controls";

export default function CarFilters({ filters }) {
  const router = useRouter();
  const pathName = usePathname();
  const searchParam = useSearchParams();

  const currMake = searchParam.get("make") || "";
  const currBodyType = searchParam.get("bodyType") || "";
  const currFuelType = searchParam.get("fuelType") || "";
  const currTransmission = searchParam.get("transmission") || "";
  const currMinPrice = searchParam.get("minPrice")
    ? parseInt(searchParam.get("minPrice"))
    : filters.priceRange.min;
  const currMaxPrice = searchParam.get("maxPrice")
    ? parseInt(searchParam.get("maxPrice"))
    : filters.priceRange.max;
  const currSortBy = searchParam.get("sortBy") || "newest";

  const [make, setMake] = useState(currMake);
  const [bodyType, setBodyType] = useState(currBodyType);
  const [fuelType, setFuelType] = useState(currFuelType);
  const [transmission, setTransmission] = useState(currTransmission);
  const [priceRange, setPriceRange] = useState([currMinPrice, currMaxPrice]);
  const [sortBy, setSortBy] = useState(currSortBy);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  useEffect(() => {
    setMake(currMake),
      setBodyType(currBodyType),
      setFuelType(currFuelType),
      setTransmission(currTransmission),
      setPriceRange([currMinPrice, currMaxPrice]),
      setSortBy(currSortBy);
  }, [
    currMake,
    currBodyType,
    currFuelType,
    currTransmission,
    currMinPrice,
    currMaxPrice,
    currSortBy,
  ]);

  const activeFilterCount = [
    make,
    bodyType,
    fuelType,
    transmission,
    currMinPrice > filters.priceRange.min ||
      currMaxPrice < filters.priceRange.max,
  ].filter(Boolean).length;

  const currentFilters = {
    make,
    bodyType,
    fuelType,
    transmission,
    priceRangeMin: filters.priceRange.min,
    priceRangeMax: filters.priceRange.max,
  };

  return (
    <div>
      {/* mobile */}
      <div className="lg:hidden mb-4">
        <div className="flex items-center">
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button
                className="cursor-pointer flex items-center gap-2"
                variant="outline"
              >
                <Filter className="h-4 w-4" /> Filters
                {activeFilterCount > 0 && (
                  <Badge className="ml-1 h-5 w-5 rounded-full p-0 flex items-center justify-center">
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="w-full sm:max-w-md overflow-y-auto"
            >
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
              </SheetHeader>
              <div className="py-6">
                <CarFilterControls
                  filters={filters}
                  currentFilters={currentFilters}
                />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </div>
  );
}
