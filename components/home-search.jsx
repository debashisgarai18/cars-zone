"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Camera, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export const HomeSearch = () => {
  const [searchText, setSearchText] = useState("");
  const [isImgSearchActive, setIsImgSearchActive] = useState(false);
  const [imagePreview, setImagePreview] = useState("");
  const [searchImage, setSearchImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const router = useRouter();

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!searchText) {
      toast.error("Please enter the text to search!!!");
      return;
    }
    router.push(`/cars?search=${encodeURIComponent(searchText)}`);
  };

  const handleImageSearch = async (e) => {
    e.preventDefault();
    if (!searchImage) {
      toast.error("Please upload an image for searching!!!");
      return;
    }
    // AI image generation logic
  };

  // use of react-dropzone
  const onDrop = (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }
      setIsUploading(true);
      setSearchImage(file);

      //* use of file reader
      const fileReader = new FileReader();
      fileReader.onloadend = () => {
        setImagePreview(fileReader.result);
        setIsUploading(false);
        toast.success("Image uploaded successfully");
      };

      fileReader.onerror = () => {
        setIsUploading(false);
        toast.error("Failed to read the image");
      };

      fileReader.readAsDataURL(file);
    }
  };

  const { getRootProps, getInputProps, isDragActive, isDragReject } =
    useDropzone({
      onDrop,
      accept: {
        "image/*": [".jpeg", ".jpg", ".png"],
      },
      maxFiles: 1,
    });

  return (
    <div>
      <form onSubmit={handleFormSubmit}>
        <div className="relative flex items-center">
          <Input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Enter model or Use the AI Image Search.."
            className="pl-10 pr-12 py-6 w-full rounded-full border-gray-300 bg-white/95 backdrop-blur-sm"
          />
          <div className="absolute right-[100px]">
            <Camera
              size={35}
              onClick={() => setIsImgSearchActive(!isImgSearchActive)}
              className="cursor-pointer rounded-xl p-1.5"
              style={{
                background: isImgSearchActive ? "black" : "",
                color: isImgSearchActive ? "white" : "",
              }}
            />
          </div>
          <Button type="submit" className="absolute right-2 rounded-full">
            Search
          </Button>
        </div>
      </form>
      {isImgSearchActive && (
        <div className="mt-4">
          <form onSubmit={handleImageSearch}>
            <div className="border-2 border-dashed border-gray-300 rounded-3xl p-6 text-center">
              {imagePreview ? (
                <div className="flex flex-col items-center">
                  <img
                    src={imagePreview}
                    alt="Car Preview"
                    className="h-40 object-contain mb-4"
                  />
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchImage(null);
                      setImagePreview("");
                      toast.info("Image Removed");
                    }}
                  >
                    Remove Image
                  </Button>
                </div>
              ) : (
                <div {...getRootProps()} className="cursor-pointer">
                  <input {...getInputProps()} />
                  <div className="flex flex-col items-center">
                    <Upload className="h-12 w-12 text-gray-400 mb-2" />
                    <p className="text-gray-500 mb-2">
                      {isDragActive && !isDragReject
                        ? "Leave the files here to upload"
                        : "Drag and Drop a car image or click to select"}
                    </p>
                    {isDragReject && (
                      <p className="text-red-500 mb-2">Invalid Image Type</p>
                    )}
                    <p className="text-gray-400 text-sm">
                      Supports : JPG, PNG, JPEG (max 5MB)
                    </p>
                  </div>
                </div>
              )}
            </div>
            {imagePreview && (
              <Button
                className="w-full mt-2"
                type="submit"
                disabled={isUploading}
              >
                {isUploading ? "Uploading..." : "Search with this Image"}
              </Button>
            )}
          </form>
        </div>
      )}
    </div>
  );
};
