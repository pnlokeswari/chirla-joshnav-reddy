import { GoogleGenAI } from "@google/genai";

// Support both standard and Vite-prefixed environment variables
const apiKey = process.env.GEMINI_API_KEY || import.meta.env.VITE_GEMINI_API_KEY;

export const isApiKeyMissing = !apiKey || apiKey === "undefined" || apiKey === "MY_GEMINI_API_KEY" || apiKey === "";

const ai = new GoogleGenAI({ apiKey: apiKey || "" });

export async function translateImage(base64Image: string, mimeType: string) {
  if (isApiKeyMissing) {
    throw new Error("API_KEY_MISSING");
  }

  const model = "gemini-3-flash-preview";
  
  const prompt = `
    Extract all text from this image and translate it into English. 
    Maintain the structure and formatting as much as possible.
    Return only the translated English text.
  `;

  const imagePart = {
    inlineData: {
      data: base64Image.split(",")[1],
      mimeType: mimeType,
    },
  };

  const response = await ai.models.generateContent({
    model: model,
    contents: [{ parts: [{ text: prompt }, imagePart] }],
  });

  return response.text;
}
