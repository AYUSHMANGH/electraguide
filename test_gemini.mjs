import { GoogleGenerativeAI } from "@google/generative-ai";

async function test() {
  try {
    const genAI = new GoogleGenerativeAI(process.env.VITE_GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    
    console.log("Testing generateContent...");
    const result = await model.generateContent("Say hello");
    console.log("generateContent response:", await result.response.text());

    console.log("Testing startChat...");
    const chat = model.startChat({
        history: [],
        generationConfig: {
            maxOutputTokens: 1000,
        },
    });
    const chatResult = await chat.sendMessage("You are Electra, an AI Election Assistant. Explain things simply, step-by-step, using bullet points and examples where helpful. Keep it suitable for a beginner. The user's question is: How do elections work in India?");
    console.log("startChat response:", await chatResult.response.text());
    
  } catch (error) {
    console.error("API Error:");
    console.error(error);
  }
}

test();
