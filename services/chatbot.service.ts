import { CHATBOT_KNOWLEDGE_BASE } from "@/lib/mock-data";
import type { ChatAnswer, ChatRequestPayload } from "@/types";

class ChatbotService {
  async send(payload: ChatRequestPayload): Promise<ChatAnswer> {
    const query = payload.question.toLowerCase();
    let answer = CHATBOT_KNOWLEDGE_BASE.default;

    if (query.includes("health") || query.includes("status")) {
      answer = CHATBOT_KNOWLEDGE_BASE.health;
    } else if (query.includes("thermal") || query.includes("heat") || query.includes("temp")) {
      answer = CHATBOT_KNOWLEDGE_BASE.thermal;
    } else if (query.includes("migrate") || query.includes("heal") || query.includes("fix")) {
      answer = CHATBOT_KNOWLEDGE_BASE.migrate;
    } else if (query.includes("prediction") || query.includes("risk")) {
      answer = CHATBOT_KNOWLEDGE_BASE.predictions;
    } else if (query.includes("gpu") || query.includes("nvidia")) {
      answer = "GPU utilization across Cluster 1 is **87.3% average**. `gpu-node-alpha-02` (NVIDIA H100) is running near peak memory limits (96.1%).";
    }

    return {
      answer,
      confidence: 0.96,
      sources: ["ClusterDoctor-AI-Engine-v3", "Realtime-DigitalTwin-Observer"],
    };
  }
}

export const chatbotService = new ChatbotService();
