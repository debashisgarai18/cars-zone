"use client";

import { deleteCar, getCars, updateCarStatus } from "@/actions/cars";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import useFetch from "@/hooks/use-fetch";
import { formatCurrency } from "@/lib/helper";
import {
  CarIcon,
  Eye,
  Loader2,
  MoreHorizontal,
  Plus,
  Search,
  Star,
  StarOff,
  Trash,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function CarsList() {
  const [search, setSearch] = useState("");
  const [carToDelete, setCarToDelete] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const router = useRouter();

  // getCar server action
  const {
    loading: loadingCars,
    fn: fetchCarsFunction,
    data: carsData,
    error: carsError,
  } = useFetch(getCars);

  useEffect(() => {
    fetchCarsFunction(search);
  }, [search]);

  // deleteCar server action
  const {
    loading: deletingCar,
    fn: deleteCarsFunction,
    data: deleteResult,
    error: deleteError,
  } = useFetch(deleteCar);

  // updateCar server action
  const {
    loading: updatingCar,
    fn: updateCarStatusFunction,
    data: updateResult,
    error: updateError,
  } = useFetch(updateCarStatus);

  useEffect(() => {
    if (deleteResult?.success) {
      toast.success("Car deleted successfully");
      fetchCarsFunction(search);
    }

    if (updateResult?.success) {
      toast.success("Car upadated successfully");
      fetchCarsFunction(search);
    }
  }, [updateResult, deleteResult, search]);

  // useEffect to handle the errors
  useEffect(() => {
    if (carsError) toast.error("Failed to load the car");
    if (deleteError) toast.error("Failed to delete the car");
    if (updateError) toast.error("Failed to update the car");
  }, [deleteError, updateError, carsError]);

  const getStatusBadge = (status) => {
    switch (status) {
      case "AVAILABLE":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            Available
          </Badge>
        );
      case "UNAVAILABLE":
        return (
          <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">
            Unavailable
          </Badge>
        );
      case "SOLD":
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
            Sold
          </Badge>
        );
      default:
        return <Badge variabnt="outline">{status}</Badge>;
    }
  };

  const handleToggleFeatured = async (car) => {
    await updateCarStatusFunction(car.id, { featured: !car.featured });
  };

  const handleStatusUpdate = async (car, newStatus) => {
    await updateCarStatusFunction(car.id, { status: newStatus });
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchCarsFunction(search);
  };

  const handleDeleteCar = async () => {
    if (!carToDelete) return;

    await deleteCarsFunction(carToDelete.id);
    setDeleteDialogOpen(false);
    setCarToDelete(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <Button
          className="flex items-center cursor-pointer"
          onClick={() => router.push("/admin/cars/create")}
        >
          <Plus className="h-4 w-4" />
          Add Cars
        </Button>
        <form onSubmit={handleSearchSubmit}>
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              className="pl-9 w-full sm:w-60"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              type="search"
              placeholder="Search cars..."
            />
          </div>
        </form>
      </div>
      <Card>
        <CardContent className="p=0">
          {loadingCars && !carsData ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : carsData?.success && carsData.data.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12"></TableHead>
                    <TableHead>Make and Model</TableHead>
                    <TableHead>Year</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Featured</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {carsData.data.map((car) => {
                    return (
                      <TableRow key={car.id}>
                        <TableCell className="w-10 h-10 rounded-md overflow-hidden">
                          {car.images && car.images.length > 0 ? (
                            <Image
                              src={car.images[0]}
                              alt={`${car.make} ${car.model}`}
                              height={40}
                              width={40}
                              className="w-full h-full object-cover"
                              priority
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                              <CarIcon className="h-6 w-6 text-gray-400" />
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="font-medium">
                          {car.model} {car.make}
                        </TableCell>
                        <TableCell>{car.year}</TableCell>
                        <TableCell>{formatCurrency(car.price)}</TableCell>
                        <TableCell>{getStatusBadge(car.status)}</TableCell>
                        <TableCell>
                          <Button
                            className="p-0 h-9 w-9"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleFeatured(car)}
                            disabled={updatingCar}
                          >
                            {car.featured ? (
                              <div>
                                <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
                              </div>
                            ) : (
                              <div className="h-5 w-5 text-gray-400">
                                <StarOff />
                              </div>
                            )}
                          </Button>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="p-0 h-8 w-8 cursor-pointer"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="align-end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem
                                onClick={() => router.push(`/cars/${car.id}`)}
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                View
                              </DropdownMenuItem>
                              <DropdownMenuItem>Billing</DropdownMenuItem>
                              <DropdownMenuItem>Set Available</DropdownMenuItem>
                              <DropdownMenuItem>
                                Set Unavailable
                              </DropdownMenuItem>
                              <DropdownMenuItem>Mark as Sold</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-red-600 cursor-pointer"
                                onClick={() => {
                                  setCarToDelete(car);
                                  setDeleteDialogOpen(true);
                                }}
                              >
                                <Trash className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div></div>
          )}
        </CardContent>
      </Card>
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {carToDelete?.make}{" "}
              {carToDelete?.model} ({carToDelete?.year})? This action is
              irreversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deletingCar}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteCar}
              disabled={deletingCar}
              className="cursor-pointer"
            >
              {deletingCar ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Car"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
