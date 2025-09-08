
import { GoogleGenAI } from "@google/genai";
import type { TrackingData } from "../types";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  // In a real app, you might want to handle this more gracefully,
  // but for this example, we'll throw an error if the key is missing.
  console.error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

export const getMileageTips = async (drivingData: TrackingData): Promise<string> => {
  if (!API_KEY) {
    return "Error: Gemini API key is not configured.";
  }
  
  const avgSpeed =
    drivingData.speedHistory.reduce((a, b) => a + b, 0) /
      drivingData.speedHistory.length || 0;
  const maxSpeed = Math.max(...drivingData.speedHistory);
  const distance = drivingData.distance;

  const prompt = `
    Analyze the following bike driving data and provide actionable tips to improve mileage.
    The response should be concise, friendly, and formatted as a list of suggestions.
    - Total Distance: ${distance.toFixed(2)} km
    - Average Speed: ${avgSpeed.toFixed(2)} km/h
    - Maximum Speed: ${maxSpeed.toFixed(2)} km/h
    
    Based on this data, how can the rider improve their fuel efficiency?
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to get advice from Gemini.");
  }
};

export const speak = (text: string) => {
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
  } else {
    console.log("Speech synthesis not supported.");
  }
};
