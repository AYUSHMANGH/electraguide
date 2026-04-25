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
        // Intelligent conversational fallback if chat API fails due to rate limits
        if (error.message && error.message.includes("429")) {
            const msg = message.toLowerCase();
            if (msg.includes("hello") || msg.includes("hi") || msg.includes("hey")) {
                return "Hello there! I'm currently running in **Offline Mode** due to high API demand, but I can still answer basic questions about elections! What would you like to know?";
            } else if (msg.includes("register") || msg.includes("voter id")) {
                return "To register to vote in India, you need to be a citizen of 18 years or older. You can apply online via the **Voter Portal (voters.eci.gov.in)** using Form 6. You'll need proof of age and proof of address!";
            } else if (msg.includes("how") && msg.includes("work")) {
                return "Elections in India work through a democratic process where citizens vote for representatives. The country is divided into constituencies, and the candidate with the most votes in each constituency wins a seat in the Parliament (Lok Sabha) or State Assembly (Vidhan Sabha).";
            } else if (msg.includes("evm") || msg.includes("machine")) {
                return "An EVM is an Electronic Voting Machine. It's used in India to securely and quickly record votes. You simply press the blue button next to your chosen candidate's symbol, and a VVPAT machine will print a slip to verify your vote!";
            } else if (msg.includes("who") && msg.includes("vote")) {
                return "Every Indian citizen who has attained the age of 18 years on the qualifying date (usually January 1st of the year) and whose name is in the electoral roll is eligible to vote!";
            } else {
                return "I'm currently running in **Offline Mode** to conserve API limits, so I only have limited knowledge right now! \n\nYou can ask me about:\n- How to register to vote\n- How elections work\n- Who can vote\n- What an EVM is\n\nOr you can explore the Timeline and Quiz using the navigation menu!";
            }
        }
        return "I'm sorry, I encountered an error while processing your request. Please try again.";
    }
}
