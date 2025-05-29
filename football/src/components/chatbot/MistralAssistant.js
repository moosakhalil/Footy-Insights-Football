import MistralClient from "@mistralai/mistralai";

const getMistralClient = () => {
  const apiKey = "F1pZ0MfSM06R9kFkFqh2NvMYEUOC8xZX";
  
  if (!apiKey) {
    throw new Error("Mistral AI API key not found");
  }

  return new MistralClient(apiKey);
};

const mistralClient = getMistralClient();

const SYSTEM_MESSAGE = {
  role: "system",
  content: `You are a football (soccer) expert assistant. Your responses should be:
1. Strictly limited to football/soccer topics only
2. If asked about non-football topics, politely redirect to football
3. Focus on:
   - Football matches, teams, and players
   - Football history and statistics
   - Football rules and regulations
   - Football news and updates
   - Football tactics and strategies
4. If a question is not related to football, respond with: "I can only help with football-related questions. Please ask me about football matches, teams, players, or other football topics."
5. Keep responses concise and informative
6. Use football terminology appropriately`
};

export default class MistralAssistant {
  #model;
  #generationConfig;

  constructor(
    modelName = "mistral-tiny",  // Changed to a smaller model for testing
    generationConfig = {
      temperature: 0.7,
      maxTokens: 1000,
    }
  ) {
    this.#model = modelName;
    this.#generationConfig = generationConfig;
  }

  async chat(content, history = []) {
    if (!content || typeof content !== "string") {
      throw new Error("Content must be a non-empty string");
    }

    try {
      const messages = [
        SYSTEM_MESSAGE,
        ...history.map(msg => ({
          role: msg.role === "model" ? "assistant" : "user",
          content: msg.content,
        })),
        { role: "user", content }
      ];

      console.log("Sending request to Mistral with messages:", messages);
      const response = await mistralClient.chat({
        model: this.#model,
        messages,
        ...this.#generationConfig
      });

      console.log("Received response from Mistral:", response);
      return response.choices[0].message.content;
    } catch (error) {
      console.error("[Mistral Error] Full error details:", error);
      throw new Error(`Mistral API Error: ${error.message}`);
    }
  }

  async *chatStream(content, history = []) {
    if (!content || typeof content !== "string") {
      throw new Error("Content must be a non-empty string");
    }

    try {
      const messages = [
        SYSTEM_MESSAGE,
        ...history.map(msg => ({
          role: msg.role === "model" ? "assistant" : "user",
          content: msg.content,
        })),
        { role: "user", content }
      ];

      console.log("Starting stream with messages:", messages);
      const stream = await mistralClient.chatStream({
        model: this.#model,
        messages,
        ...this.#generationConfig
      });

      for await (const chunk of stream) {
        console.log("Received chunk:", chunk);
        if (chunk.choices[0]?.delta?.content) {
          yield chunk.choices[0].delta.content;
        }
      }
    } catch (error) {
      console.error("[Mistral Stream Error] Full error details:", error);
      throw new Error(`Mistral Stream Error: ${error.message}`);
    }
  }

  static createMessage(role, content) {
    return { role, content };
  }
} 