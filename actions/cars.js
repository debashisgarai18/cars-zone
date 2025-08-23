"use server";

import { db } from "@/lib/prisma";
import { createClient } from "@/lib/supabase";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { v4 as uuidv4 } from "uuid";

//* Function to convert a file to base64
const convert2Base64 = async (file) => {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  return buffer.toString("base64");
};

//* Function to communicate to GeminiAPI
export async function processImage(file) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("Gemini API key is not configured");
    }

    const geminiAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = geminiAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const base64Image = await convert2Base64(file);
    const imagePart = {
      inlineData: {
        data: base64Image,
        mimeType: file.type,
      },
    };

    const prompt = `
    Analyze this car image and extract the following information:
    1. Make (manufacturer)
    2. Model
    3. Year (approximately)
    4. Color
    5. Body Type (SUV or Sedan or Hatchback, etc)
    6. Mileage
    7. Fuel Type (your best guess)
    8. Transmission type (your best guess)
    9. Price (your best guess)
    10. Short description as to be added to a car listing

    Format your response as a clean JSON object with these fields:
    {
        "make": "",
        "model": "",
        "year": 0000,
        "color": "",
        "price": "",
        "mileage": "",
        "bodyType": "",
        "fuelType": "",
        "transmission": "",
        "description": "",
        "confidence": 0.0
    }

    For confidence, provide a value between 0 and 1 representing ho confident you are in your overall identification.
    Only respond with the JSON object, nothing else
    `;

    const result = await model.generateContent([imagePart, prompt]);
    const response = await result.response;
    const cleanedText = response
      .text()
      .replace(/```(?:json)?\n?/g, "")
      .trim();

    try {
      const carDetails = JSON.parse(cleanedText);
      const requiredFields = [
        "make",
        "model",
        "year",
        "color",
        "bodyType",
        "price",
        "mileage",
        "fuelType",
        "transmission",
        "description",
        "confidence",
      ];
      const missingFields = requiredFields.filter(
        (ele) => !(ele in carDetails)
      );
      if (missingFields.length > 0) {
        throw new Error(
          `AI response missing the required fields: ${missingFields.join(",")}`
        );
      }

      return { success: true, data: carDetails };
    } catch (error) {
      console.error("failed to parse the AI response", error);
      return {
        success: false,
        error: "Failed to parse AI response",
      };
    }
  } catch (error) {
    console.error("Gemini API Error", error);
  }
}

export async function addCar({ carData, images }) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: {
        clerkUserId: userId,
      },
    });

    if (!user) throw new Error("User not found");

    const carId = uuidv4();
    const folderPath = `cars/${carId}`;

    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const imageUrl = [];
    for (let i = 0; i < images.length; ++i) {
      console.log("Here")
      const base64Data = images[i];

      // skip if the data is not of base64 type
      if (!base64Data || !base64Data.startsWith("data:image/")) {
        console.warn("Skipping invalid image data");
        continue;
      }

      // extract the base64 part of the data
      const base64 = base64Data.split(",")[1];
      const imageBuffer = Buffer.from(base64, "base64");

      // Determine file extension from the data URL
      const mimeMatch = base64Data.match(/data:image\/([a-zA-Z0-9]);/);
      const fileExtension = mimeMatch ? mimeMatch[1] : "jpeg";

      // create the file name
      const fileName = `image-${Date.now()}-${i}.${fileExtension}`;
      const filePath = `${folderPath}/${fileName}`;

      const { data, error } = await supabase.storage
        .from("car-images-bucket")
        .upload(filePath, imageBuffer, {
          contentType: `image/${fileExtension}`,
        });

      if (error) {
        console.error("Error uploading image", error);
        throw new Error(`Failed to upload the image: ${error.message}`);
      }

      const publicURL = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/car-images-bucket/${filePath}`;
      imageUrl.push(publicURL);
    }

    if (imageUrl.length === 0) throw new Error("No valid images were uploaded");

    const car = await db.car.create({
      data: {
        id: carId,
        make: carData.make,
        model: carData.model,
        year: carData.year,
        price: carData.price,
        mileage: carData.mileage,
        color: carData.color,
        fuelType: carData.fuelType,
        transmission: carData.transmission,
        bodyType: carData.bodyType,
        seats: carData.seats,
        description: carData.description,
        status: carData.status,
        featured: carData.featured,
        images: imageUrl,
      },
    });

    revalidatePath("/admin/cars");

    return {
      success: true,
    };
  } catch (error) {
    throw new Error(`Error adding car: ${error.message}`);
  }
}
