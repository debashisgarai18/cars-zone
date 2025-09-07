import { gteSavedCars } from "@/actions/list-cars";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import SavedCarsList from "./_components/saved-cars-list";

export default async function SavedCarPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in?redirect=/saved-cars");
  }

  const savedCarsResult = await gteSavedCars();

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-6xl mb-6 gradient-title">Your Saved Cars</h1>
      <SavedCarsList initialData={savedCarsResult} />
    </div>
  );
}
