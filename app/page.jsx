import { CarCard } from "@/components/car-card";
import { HomeSearch } from "@/components/home-search";
import { Button } from "@/components/ui/button";
import { featuredCars } from "@/lib/dummyData";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="pt-20 flex flex-col">
      <HeroSection />
    </div>
  );
}

// Hero Section
const HeroSection = () => {
  return (
    <div>
      <section className="relative py-16 md:py-28 dotted-background">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <h1 className="text-5xl md:text-8xl mb-4 gradient-title">
              Find you dream car from CarZone
            </h1>
            <p className="text-xl text-gray-500 mb-8 max-w-2xl mx-auto">
              Advanced AI car search and test drive from thousand of vehicles
            </p>
          </div>
          <HomeSearch />
        </div>
      </section>
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold ">Featured Cars</h2>
            <Button variant="ghost" className="flex items-center" asChild>
              <Link href="/cars">
              View All
              <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredCars.map((ele) => {
              return <CarCard key={ele.id} car={ele} />;
            })}
          </div>
        </div>
      </section>
    </div>
  );
};
