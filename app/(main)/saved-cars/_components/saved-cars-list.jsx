"use client";

import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import Link from "next/link";

export default function SavedCarsList({ initialData }) {
  if (!initialData?.data || initialData?.data.length === 0) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center text-center p-8 border rounded-lg bg-gray-50">
        <div className="bg-gray-100 p-4 rounded-full mb-4">
          <Heart className="h-8 w-8 text-gray-500" />
        </div>
        <h3 className="text-g font-medium mb-2">No Saved Cars</h3>
        <p className="text-gray-500 mb-6 max-w-md">
          You haven't saved any cars yet. Browse the lisitng page& click on
          heart icon to save cars for later
        </p>
        <Button variant="default" asChild>
          <Link href="/cars">Browse Cars</Link>
        </Button>
      </div>
    );
  }

  return <div>Saved Cars List</div>;
}
