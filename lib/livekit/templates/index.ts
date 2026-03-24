import type { VoiceAgentMetadata } from "./types";
import { cityTravelGuide } from "./city-travel-guide";
import { restaurantAssistant } from "./restaurant-assistant";
import { languagePracticeCoach } from "./language-practice-coach";
import { productAdvisor } from "./product-advisor";

export type { VoiceAgentMetadata } from "./types";

export const voiceTemplates: Record<string, VoiceAgentMetadata> = {
  "city-travel-guide": cityTravelGuide,
  "restaurant-assistant": restaurantAssistant,
  "language-practice-coach": languagePracticeCoach,
  "product-advisor": productAdvisor,
};
