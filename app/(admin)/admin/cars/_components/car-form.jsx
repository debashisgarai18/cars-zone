"use client";

import { useForm } from "react-hook-form";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { Camera, Loader2, Upload, X } from "lucide-react";
import useFetch from "@/hooks/use-fetch";
import { addCar, processImage } from "@/actions/cars";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useRouter } from "next/navigation";

const fuelTypes = ["Petrol", "Diesel", "Electric", "Hybrid", "Plug-in Hybrid"];
const transmissions = ["Automatic", "Manual", "Semi-automatic"];
const bodyTypes = [
  "SUV",
  "Sedan",
  "Hatchback",
  "Convertible",
  "Coupe",
  "Wagon",
  "Pickup",
];
const carStatus = ["AVAILABLE", "UNAVAILABLE", "SOLD"];

export default function CarForm() {
  const [activeTab, setActiveTab] = useState("manual");
  const [uploadedImages, setUploadedImages] = useState([]);
  const [imageError, setImageError] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadedAIImage, setUploadedAIImage] = useState(null);

  const carFormSchema = z.object({
    make: z.string().min(1, "Make is required"),
    model: z.string().min(1, "Model is required"),
    year: z.string().refine((val) => {
      const year = parseInt(val);
      return (
        !isNaN(year) && year >= 1900 && year <= new Date().getFullYear() + 1
      );
    }, "Valid year required"),
    price: z.string().min(1, "Price is required"),
    mileage: z.string().min(1, "Mileage is required"),
    color: z.string().min(1, "Color is required"),
    fuelType: z.string().min(1, "Fuel Type is required"),
    transmission: z.string().min(1, "Transmission is required"),
    bodyType: z.string().min(1, "Body Type is required"),
    seats: z.string().optional(),
    description: z
      .string()
      .min(10, "Description must be atleast 10 characters"),
    status: z.enum(["AVAILABLE", "UNAVAILABLE", "SOLD"]),
    featured: z.boolean().default(false),
  });

  const router = useRouter();

  const {
    register,
    setValue,
    getValues,
    formState: { errors },
    handleSubmit,
    watch,
  } = useForm({
    resolver: zodResolver(carFormSchema),
    defaultValues: {
      make: "",
      model: "",
      year: "",
      price: "",
      mileage: "",
      color: "",
      fuelType: "",
      transmission: "",
      bodyType: "",
      seats: "",
      description: "",
      status: "AVAILABLE",
      featured: false,
    },
  });

  const {
    data: addCarResult,
    loading: addCarLoading,
    fn: addCarFunction,
  } = useFetch(addCar);

  //* fetch the sever action fn
  const {
    loading: processImageLoading,
    fn: processImageFn,
    data: processImageResult,
    error: processImageError,
  } = useFetch(processImage);

  const processWithAI = async () => {
    if (!uploadedAIImage) {
      toast.error("Please upload an image first");
      return;
    }
    await processImageFn(uploadedAIImage);
  };

  useEffect(() => {
    if (processImageError) {
      toast.error(processImageError.message || "Failed to upload the car");
    }
  }, [processImageError]);

  useEffect(() => {
    if (processImageResult?.success) {
      const carDetails = processImageResult?.data;

      setValue("make", carDetails.make);
      setValue("model", carDetails.model);
      setValue("year", carDetails.year.toString());
      setValue("color", carDetails.color);
      setValue("bodyType", carDetails.bodyType);
      setValue("fuelType", carDetails.fuelType);
      setValue("price", carDetails.price);
      setValue("mileage", carDetails.mileage);
      setValue("transmission", carDetails.transmission);
      setValue("description", carDetails.description);

      const reader = new FileReader();
      reader.onload = () => {
        setUploadedImages((prev) => [...prev, e.target.result]);
      };

      reader.readAsDataURL(uploadedAIImage);

      toast.success("Successfully extracted car details", {
        description: `Detected ${carDetails.year} ${carDetails.make} ${
          carDetails.model
        } with ${Math.round(carDetails.confidence * 100)}% confidence`,
      });

      setActiveTab("Manual");
    }
  }, [processImageResult, uploadedAIImage]);

  useEffect(() => {
    if (addCarResult?.success) {
      toast.success("Car added successfully");
      router.push("/admin/cars");
    }
  }, [addCarResult, addCarLoading]);

  const onSubmit = async (data) => {
    if (uploadedImages.length === 0) {
      setImageError("Please upload atleast one image");
      return;
    }

    const carData = {
      ...data,
      year: parseInt(data.year),
      price: parseInt(data.price),
      mileage: parseInt(data.mileage),
      seats: data.seats ? parseInt(data.seats) : null,
    };

    await addCarFunction({
      carData,
      images: uploadedImages,
    });
  };

  //* fn for Ai image search -> use of drop-zone
  const onAIImagesDrop = (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }
      setUploadedAIImage(file);

      //* use of file reader
      const render = new FileReader();
      render.onload = (e) => {
        setImagePreview(e.target.result);
        toast.success("Image uploaded successfully");
      };
      render.readAsDataURL(file);
    }
  };

  //* for AI image search
  const { getRootProps: getAIRootProps, getInputProps: getAIInputProps } =
    useDropzone({
      onDrop: onAIImagesDrop,
      accept: {
        "image/*": [".jpeg", ".jpg", ".png", ".webp"],
      },
      maxFiles: 1,
      multiple: false,
    });

  const removeImage = (index) => {
    setUploadedImages((prev) => prev.filter((_, idx) => idx !== index));
  };

  //* use of react-dropzone -> for manual entry
  const onMultiImagesDrop = (acceptedFiles) => {
    const validFiles = acceptedFiles.filter((file) => {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} exceeds 5MB size limit and will be skipped`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    const newImages = [];
    validFiles.forEach((file) => {
      // use of file reader
      const fileReader = new FileReader();
      fileReader.onload = (e) => {
        newImages.push(e.target.result);
        if (newImages.length === validFiles.length) {
          setUploadedImages((prev) => [...prev, ...newImages]);
          setImageError("");
          toast.success(`Successfully uploaded ${validFiles.length} images`);
        }
      };
      fileReader.readAsDataURL(file);
    });
  };

  //* for manual entry
  const {
    getRootProps: getMultiImageRootProps,
    getInputProps: getMultiImageInputProps,
  } = useDropzone({
    onDrop: onMultiImagesDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".webp"],
    },
    multiple: true,
  });

  return (
    <div>
      <Tabs
        defaultValue="ai"
        className="mt-6"
        value={activeTab}
        onValueChange={setActiveTab}
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="manual" className="cursor-pointer">
            Manual Entry
          </TabsTrigger>
          <TabsTrigger value="ai" className="cursor-pointer">
            AI Upload
          </TabsTrigger>
        </TabsList>
        <TabsContent value="manual" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Car Details</CardTitle>
              <CardDescription>Enter the details of your car</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="make">Make</Label>
                    <Input
                      id="make"
                      {...register("make")}
                      className={errors.make && "border-red-500"}
                      placeholder="e.g. Mercedes"
                    />
                    {errors.make && (
                      <p className="text-xs text-red-500">
                        {errors.make.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="model">Model</Label>
                    <Input
                      id="model"
                      {...register("model")}
                      className={errors.model && "border-red-500"}
                      placeholder="e.g. Maybach"
                    />
                    {errors.model && (
                      <p className="text-xs text-red-500">
                        {errors.model.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="year">Year</Label>
                    <Input
                      id="year"
                      {...register("year")}
                      className={errors.year && "border-red-500"}
                      placeholder="e.g. 2024"
                    />
                    {errors.year && (
                      <p className="text-xs text-red-500">
                        {errors.year.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price">Price (Rs.)</Label>
                    <Input
                      id="price"
                      {...register("price")}
                      className={errors.price && "border-red-500"}
                      placeholder="e.g. 5Cr"
                    />
                    {errors.price && (
                      <p className="text-xs text-red-500">
                        {errors.price.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mileage">Mileage</Label>
                    <Input
                      id="mileage"
                      {...register("mileage")}
                      className={errors.mileage && "border-red-500"}
                      placeholder="e.g. 20000"
                    />
                    {errors.mileage && (
                      <p className="text-xs text-red-500">
                        {errors.mileage.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="color">Color</Label>
                    <Input
                      id="color"
                      {...register("color")}
                      className={errors.color && "border-red-500"}
                      placeholder="e.g. Grey"
                    />
                    {errors.color && (
                      <p className="text-xs text-red-500">
                        {errors.color.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fuelType">Fuel Type</Label>
                    <Select
                      onValueChange={(val) => setValue("fuelType", val)}
                      defaultValue={getValues("fuelType")}
                    >
                      <SelectTrigger
                        className={`w-full ${errors.fuelType} && "border-red-500"`}
                      >
                        <SelectValue placeholder="Select the fuel type" />
                      </SelectTrigger>
                      <SelectContent>
                        {fuelTypes.map((fuel) => {
                          return (
                            <SelectItem value={fuel} key={fuel}>
                              {fuel}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                    {errors.fuelType && (
                      <p className="text-xs text-red-500">
                        {errors.fuelType.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="transmission">Transmission</Label>
                    <Select
                      onValueChange={(val) => setValue("transmission", val)}
                      defaultValue={getValues("transmission")}
                    >
                      <SelectTrigger
                        className={`w-full ${errors.transmission} && "border-red-500"`}
                      >
                        <SelectValue placeholder="Select the transmission type" />
                      </SelectTrigger>
                      <SelectContent>
                        {transmissions.map((tms) => {
                          return (
                            <SelectItem value={tms} key={tms}>
                              {tms}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                    {errors.transmission && (
                      <p className="text-xs text-red-500">
                        {errors.transmission.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bodyType">Body</Label>
                    <Select
                      onValueChange={(val) => setValue("bodyType", val)}
                      defaultValue={getValues("bodyType")}
                    >
                      <SelectTrigger
                        className={`w-full ${errors.bodyType} && "border-red-500"`}
                      >
                        <SelectValue placeholder="Select the body type" />
                      </SelectTrigger>
                      <SelectContent>
                        {bodyTypes.map((bdy) => {
                          return (
                            <SelectItem value={bdy} key={bdy}>
                              {bdy}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                    {errors.bodyType && (
                      <p className="text-xs text-red-500">
                        {errors.bodyType.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="seats">
                      No. of seats
                      <span className="text-sm text-gray-500">(Optional)</span>
                    </Label>
                    <Input
                      id="seats"
                      {...register("seats")}
                      className={errors.seats && "border-red-500"}
                      placeholder="e.g.5"
                    />
                    {errors.seats && (
                      <p className="text-xs text-red-500">
                        {errors.seats.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      onValueChange={(val) => setValue("status", val)}
                      defaultValue={getValues("status")}
                    >
                      <SelectTrigger
                        className={`w-full ${errors.status} && "border-red-500"`}
                      >
                        <SelectValue placeholder="Select car status" />
                      </SelectTrigger>
                      <SelectContent>
                        {carStatus.map((status) => {
                          return (
                            <SelectItem value={status} key={status}>
                              {status.charAt(0) + status.slice(1).toLowerCase()}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 col-span-full">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      {...register("description")}
                      placeholder="Enter the detailed description here..."
                      className={`min-h-32 w-full ${
                        errors.description && "border-red-500"
                      }`}
                    />
                    {errors.description && (
                      <p className="text-xs text-red-500">
                        {errors.description.message}
                      </p>
                    )}
                  </div>
                  <div className="flex items-start space-x-3 space-y-0 rounded-md border p-4 col-span-full">
                    <Checkbox
                      id="featured"
                      checked={watch("featured")}
                      onCheckedChange={(checked) => {
                        setValue("featured", checked);
                      }}
                    />
                    <div className="space-y-1 leading-none">
                      <Label htmlFor="featured">Feature this Car</Label>
                      <p className="text-sm text-gray-500">
                        Featured cars appears on the homepage
                      </p>
                    </div>
                  </div>
                  <div className="col-span-full">
                    <Label
                      htmlFor="images"
                      className={imageError && "border-red-500"}
                    >
                      Images
                      {imageError && <span className="text-red-500">*</span>}
                    </Label>
                    <div
                      {...getMultiImageRootProps()}
                      className={`border-2 border-dashed rounded-lg text-center cursor-pointer mt-2 p-4 hover:bg-gray-50 transition ${
                        imageError ? "border-red-500" : "border-gray-300"
                      }`}
                    >
                      <input {...getMultiImageInputProps()} />
                      <div className="flex flex-col items-center justify-center">
                        <Upload className="h-12 w-12 text-gray-400 mb-3" />
                        <p className="text-gray-600 text-sm">
                          Drag/Drop or Click to upload multiple images
                        </p>
                        <p className="text-gray-500 text-xs mt-1">
                          Supports : JPG, PNG, JPEG, WEBP (max 5MB)
                        </p>
                      </div>
                    </div>
                    {imageError && (
                      <p className="text-xs text-red-500 mt-1">{imageError}</p>
                    )}
                  </div>
                </div>
                {uploadedImages.length > 0 && (
                  <div className="mt-4">
                    <h3 className="text-sm font-medium mb-2">
                      Uploaded Images ({uploadedImages.length})
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {uploadedImages.map((image, idx) => {
                        return (
                          <div key={idx} className="relative group">
                            <Image
                              src={image}
                              alt={`Car Image ${idx + 1}`}
                              height={50}
                              width={50}
                              className="h-28 w-full object-cover rounded-md"
                              priority
                            />
                            <Button
                              type="button"
                              size="icon"
                              variant="destructive"
                              className="absolute right-1 top-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                              onClick={() => removeImage(idx)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                <Button
                  type="submit"
                  className="w-full md:w-auto"
                  disabled={addCarLoading}
                >
                  {addCarLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Adding
                      Car...
                    </>
                  ) : (
                    "Add Car"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="ai" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>AI-Powered Car Details Extraction</CardTitle>
              <CardDescription>
                Upload the image of a car and let AI extract its details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="border-2 border-dashed rounded-lg p-6 text-center">
                  {imagePreview ? (
                    <div className="flex flex-col items-center">
                      <img
                        src={imagePreview}
                        alt="Car Preview"
                        className="max-h-56 max-w-full object0contain mb-4"
                      />
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setImagePreview(null);
                            setUploadedAIImage(null);
                          }}
                        >
                          Remove
                        </Button>
                        <Button
                          size="sm"
                          onClick={processWithAI}
                          disabled={processImageLoading}
                        >
                          {true ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                              Processing...
                            </>
                          ) : (
                            <>
                              <Camera className="mr-2 h-4 w-4" />
                              Extracting Details
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div
                      {...getAIRootProps()}
                      className="cursor-pointer hover:bg-gray-50 transition"
                    >
                      <input {...getAIInputProps()} />
                      <div className="flex flex-col items-center justify-center">
                        <Camera className="h-12 w-12 text-gray-400 mb-2" />
                        <p className="text-gray-600 text-sm">
                          "Drag and Drop a car image or click to select"
                        </p>
                        <p className="text-gray-500 text-xs mt-1">
                          Supports : JPG, PNG, JPEG, WEBP (max 5MB)
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                <div className="bg-gray-50 p-4 rounded-md">
                  <h3 className="font-medium mb-2">How it works</h3>
                  <ol className="space-y-2 text-sm text-gray-600 list-decimal pl-4">
                    <li>Upload a clear image of the car</li>
                    <li>Click "Extract Details" to analyse with Gemini AI</li>
                    <li>Review the extracted information</li>
                    <li>Fill in any missing details manually</li>
                    <li>Add the car to your invenory</li>
                  </ol>
                </div>
                <div className="bg-amber-50 p-4 rounded-md">
                  <h3 className="font-medium text-amber-700">
                    Tips for best results
                  </h3>
                  <ul className="space-y-1 text-sm text-amber-700">
                    <li>▪️Use clear, well-lit images</li>
                    <li>▪️Try to capture the entire vehicle</li>
                    <li>▪️For different models, use multiple views</li>
                    <li>▪️Always verify AI-extracted inforation</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
