"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Camera } from "lucide-react";
import { Button } from "@/components/ui/button";

export const HomeSearch = () => {
  const [searchText, setSearchText] = useState("");
  const [isImgSearchActive, setIsImgSearchActive] = useState(false);

  const handleFormSubmit = () => {};

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
    </div>
  );
};
