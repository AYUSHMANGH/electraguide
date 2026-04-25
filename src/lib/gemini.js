import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

export const getGeminiResponse = async (prompt) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Error fetching Gemini response:", error);
    // Provide intelligent fallback mock data if rate limited or API fails
    if (prompt.includes("voter registration")) {
        return "### Voter Registration\n\nVoter registration is the crucial first step in the democratic process.\n\n* **Why it matters**: You must be on the official voter list (electoral roll) to cast a ballot.\n* **Requirements**: In India, you need to be a citizen and at least 18 years old.\n* **Documents needed**: Proof of identity and proof of address (e.g., Aadhaar card, PAN card, or Passport).";
    } else if (prompt.includes("campaigning phase")) {
        return "### Campaigning Phase\n\nThis is when political parties and candidates present their ideas to the public to win votes.\n\n* **Activities**: Rallies, public speeches, door-to-door canvassing, and media advertisements.\n* **Manifestos**: Parties release official documents promising what they will do if elected.\n* **What to watch for**: Voters should listen carefully to promises and compare different candidates' plans for the future.";
    } else if (prompt.includes("voting day")) {
        return "### Voting Day\n\nThe most important day in a democracy when citizens cast their ballots.\n\n1. **Arrival**: Voters go to their designated polling booth.\n2. **Verification**: Election officials verify your ID and find your name on the voter list.\n3. **Inking**: A temporary indelible ink mark is placed on your index finger to prevent double-voting.\n4. **Voting**: You secretly cast your vote using an Electronic Voting Machine (EVM).";
    } else if (prompt.includes("votes are counted")) {
        return "### Counting & Results\n\nAfter voting concludes across all phases, the ballots are securely transported and counted.\n\n* **Security**: EVMs are kept in highly secure strong rooms guarded by central forces.\n* **Counting**: On a designated results day, votes are tallied electronically in the presence of candidate representatives to ensure absolute transparency.\n* **Declaration**: The candidate with the most votes in a constituency is declared the winner by the Election Commission.";
    } else if (prompt.includes("geographical coordinates")) {
        return "### Regional Insights (Fallback Data)\n\n*Note: The AI API is currently rate-limited. Showing sample demographic data.* \n\n**1. Likely Region:**\nBased on general coordinates, this area represents a dynamic constituency in India.\n\n**2. Dominating Political Parties:**\n* **Bharatiya Janata Party (BJP)**\n* **Indian National Congress (INC)**\n* Regional parties depending on the exact state borders.\n\n**3. Historical Support:**\nHistorically, this region sees highly competitive elections. The winning party typically secures a **~40-45% vote share**, indicating an engaged and divided voter base. A strong majority is rare, making every vote count.";
    }

    if (error.message && error.message.includes("429")) {
      return "Whoops! The AI is currently experiencing high demand (Rate Limit Exceeded). Please wait a minute and try again.";
    }
    return "I'm sorry, I encountered an error while fetching information. Please try again later.";
  }
};

export const getGeminiChatResponse = async (history, message) => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const chat = model.startChat({
            history: history,
            generationConfig: {
                maxOutputTokens: 8192,
            },
        });
        const result = await chat.sendMessage(message);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Error fetching Gemini chat response:", error);
        // Intelligent fallback if chat API fails due to rate limits
        if (error.message && error.message.includes("429")) {
            return "I am currently experiencing high demand due to API rate limits! But don't worry, I am Electra, your AI Election Assistant. \n\nEven though I cannot connect to my live knowledge base right now, you can still explore the **Timeline**, take the **Quiz**, or check your **Eligibility** using the navigation menu above!";
        }
        return "I'm sorry, I encountered an error while processing your request. Please try again.";
    }
}
