"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Filter, Sliders, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import CarFilterControls from "./car-filter-controls";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
    priceRange,
    priceRangeMin: filters.priceRange.min,
    priceRangeMax: filters.priceRange.max,
  };

  const handleFilterChange = (filterName, value) => {
    switch (filterName) {
      case "make":
        setMake(value);
        break;
      case "bodyType":
        setBodyType(value);
        break;
      case "fuelType":
        setFuelType(value);
        break;
      case "transmission":
        setTransmission(value);
        break;
      case "priceRange":
        setPriceRange(value);
        break;
    }
  };

  const handleClearFilter = (filterName) => {
    handleFilterChange(filterName, "");
  };

  const clearFilters = () => {
    setMake("");
    setBodyType("");
    setFuelType("");
    setTransmission("");
    setPriceRange([filters.priceRange.min, filters.priceRange.max]);
    setSortBy("newest");

    const params = new URLSearchParams();
    const search = searchParam.get("search");
    if (search) params.set("search", search);

    const query = params.toString();
    const url = query ? `${pathName}?${query}` : pathName;

    router.push(url);
    setIsSheetOpen(false);
  };

  const applyFilters = () => {
    const params = new URLSearchParams();

    if (make) params.set("make", make);
    if (bodyType) params.set("bodyType", bodyType);
    if (fuelType) params.set("fuelType", fuelType);
    if (transmission) params.set("transmission", transmission);
    if (priceRange[0] > filters.priceRange.min)
      params.set("minPrice", priceRange[0].toString());
    if (priceRange[1] < filters.priceRange.max)
      params.set("maxPrice", priceRange[1].toString());
    if (sortBy !== "newest") params.set("sortBy", sortBy);

    const search = searchParam.get("search");
    const page = searchParam.get("page");

    if (search) params.set("search", search);
    if (page && page !== "1") params.set("page", page);

    const query = params.toString();
    const url = query ? `${pathName}?${query}` : pathName;

    router.push(url);
    setIsSheetOpen(false);
  };

  return (
    <div className="flex lg:flex-col justify-between gap-4">
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
                  onFilterChange={handleFilterChange}
                  onClearFilter={handleClearFilter}
                />
              </div>
              <SheetFooter className="sm:justify-between flex-row pt-2 border-t space-x-4 mt-auto">
                <Button
                  type="button"
                  variant="outline"
                  onClick={clearFilters}
                  className="flex-1 cursor-pointer"
                >
                  Reset
                </Button>
                <Button
                  type="button"
                  onClick={applyFilters}
                  className="cursor-pointer flex-1"
                >
                  Show Results
                </Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>
      </div>
      <Select
        value={sortBy}
        onValueChange={(value) => {
          setSortBy(value);
          setTimeout(() => applyFilters(), 0);
        }}
      >
        <SelectTrigger className="w-[180px] lg:w-full">
          <SelectValue placeholder="Theme" />
        </SelectTrigger>
        <SelectContent>
          {[
            { value: "newest", label: "Newest first" },
            { value: "priceAsc", label: "Price: Low to High" },
            { value: "priceDesc", label: "Price: High to Low" },
          ].map((opt) => {
            return (
              <SelectItem
                className="cursor-pointer"
                key={opt.value}
                value={opt.value}
              >
                {opt.label}
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
      <div className="hidden lg:block sticky top-24">
        <div className="border rounded-lg overflow-hidden bg-white">
          <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
            <h3 className="font-medium flex items-center">
              <Sliders className="mr-2 h-4 w-4" />
              Filters
            </h3>
            {activeFilterCount > 0 && (
              <Button
                className="cursor-pointer h-8 text-sm text-gray-600"
                size="sm"
                variant="ghost"
                onClick={clearFilters}
              >
                <X className="mr-2 h-3 w-3" />
                Clear All
              </Button>
            )}
          </div>
          <div className="p-4">
            <CarFilterControls
              filters={filters}
              currentFilters={currentFilters}
              onFilterChange={handleFilterChange}
              onClearFilter={handleClearFilter}
            />
          </div>
          <div className="px-4 py-4 border-t">
            <Button className="cursor-pointer w-full" onClick={applyFilters}>
              Apply Filters
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
