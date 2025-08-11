import { GoogleGenerativeAI } from "@google/generative-ai";

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
