
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateDJShoutout = async (songName: string, artist: string, userName: string, note: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are a cool, minimalist underground club DJ. 
      Generate a short, energetic one-sentence shout-out for the next track.
      Song: ${songName} by ${artist}.
      Requested by: ${userName}.
      Listener's Note: ${note}.
      Keep it professional, concise, and in character.`,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return `Next up: ${songName} for ${userName}!`;
  }
};
