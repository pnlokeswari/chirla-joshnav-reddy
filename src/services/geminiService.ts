import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function translateImage(base64Image: string, mimeType: string) {
  const model = "gemini-3-flash-preview";
  
  const prompt = `
    Extract all text from this image and translate it into English. 
    Maintain the structure and formatting as much as possible.
    Return only the translated English text.
  `;

  const imagePart = {
    inlineData: {
      data: base64Image.split(",")[1], // Remove the data:image/png;base64, prefix
      mimeType: mimeType,
    },
  };

  const response = await ai.models.generateContent({
    model: model,
    contents: [{ parts: [{ text: prompt }, imagePart] }],
  });

  return response.text;
}
