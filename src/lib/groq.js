import Groq from 'groq-sdk';

const apiKey = import.meta.env.VITE_GROQ_API_KEY;

let groq;
try {
  groq = new Groq({
    apiKey: apiKey,
    dangerouslyAllowBrowser: true // Required for client-side Vite usage
  });
} catch (error) {
  console.error("Error initializing Groq SDK:", error);
}

// Fallback logic remains the same for offline use
const getOfflineFallback = (message) => {
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

export const getGroqChatResponse = async (message, history = []) => {
    try {
        if (!groq) {
             console.warn("Groq API key is missing or invalid, using fallback.");
             return getOfflineFallback(message);
        }

        // Format history for Groq
        const formattedHistory = history.map(msg => ({
            role: msg.role === 'model' ? 'assistant' : msg.role,
            content: msg.parts
        }));

        // Add the system prompt and the new user message
        const messages = [
            {
                role: "system",
                content: "You are Electra, an AI Election Assistant for India. You explain democratic processes, voting rights, and election facts clearly, concisely, and impartially. Use Markdown."
            },
            ...formattedHistory,
            {
                role: "user",
                content: message
            }
        ];

        const completion = await groq.chat.completions.create({
            messages: messages,
            model: "llama3-8b-8192", // Using Llama 3 8B which is incredibly fast and standard on Groq
            temperature: 0.7,
            max_tokens: 8192,
        });

        return completion.choices[0]?.message?.content || "I couldn't generate a response.";

    } catch (error) {
        console.error("Error fetching Groq chat response:", error);
        return getOfflineFallback(message);
    }
};

export const getGroqResponse = async (prompt) => {
     try {
        if (!groq) {
             console.warn("Groq API key is missing or invalid, returning standard fallback.");
             return "Data is currently unavailable.";
        }

        const completion = await groq.chat.completions.create({
            messages: [
                 {
                    role: "system",
                    content: "You are an expert on Indian Elections."
                 },
                 {
                    role: "user",
                    content: prompt
                 }
            ],
            model: "llama3-8b-8192", 
            temperature: 0.5,
            max_tokens: 4000,
        });

        return completion.choices[0]?.message?.content || "Information unavailable.";

    } catch (error) {
        console.error("Error fetching Groq response:", error);
        return "Information unavailable.";
    }
}
