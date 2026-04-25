import { GoogleGenerativeAI } from "@google/generative-ai";

async function test() {
  try {
    // We fetch via REST to list models since SDK might not have listModels exposed easily.
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.VITE_GEMINI_API_KEY}`);
    const data = await response.json();
    console.log("Models:", data.models.map(m => m.name));
  } catch (error) {
    console.error("API Error:", error);
  }
}

test();
