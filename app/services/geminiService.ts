
import { GoogleGenAI, Type } from "@google/genai";
import { WeeklyMealPlan, AIWorkoutPlan } from "../types";

const getAI = () => new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY || '' });

export const generateMealPlan = async (query: string, preferences: string): Promise<WeeklyMealPlan> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Generate a 7-day healthy meal plan for a user asking for: "${query}". 
               User preferences/restrictions: "${preferences}". 
               Include calories and basic macros (protein, carbs, fat) for each meal. 
               Keep the meals simple, realistic, and focused on fitness goals.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          plan: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                day: { type: Type.STRING },
                breakfast: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    calories: { type: Type.NUMBER },
                    protein: { type: Type.STRING },
                    carbs: { type: Type.STRING },
                    fat: { type: Type.STRING },
                  },
                  required: ["name", "calories"]
                },
                lunch: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    calories: { type: Type.NUMBER },
                    protein: { type: Type.STRING },
                    carbs: { type: Type.STRING },
                    fat: { type: Type.STRING },
                  },
                  required: ["name", "calories"]
                },
                dinner: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    calories: { type: Type.NUMBER },
                    protein: { type: Type.STRING },
                    carbs: { type: Type.STRING },
                    fat: { type: Type.STRING },
                  },
                  required: ["name", "calories"]
                },
                snacks: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    calories: { type: Type.NUMBER },
                    protein: { type: Type.STRING },
                    carbs: { type: Type.STRING },
                    fat: { type: Type.STRING },
                  },
                  required: ["name", "calories"]
                }
              },
              required: ["day", "breakfast", "lunch", "dinner"]
            }
          }
        },
        required: ["plan"]
      }
    }
  });

  return JSON.parse(response.text) as WeeklyMealPlan;
};

export const getMealSuggestions = async (preferences: string): Promise<string[]> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Suggest 4 simple, high-protein meal ideas for a fitness-focused user with these preferences: "${preferences}". Return ONLY a JSON array of strings.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: { type: Type.STRING }
      }
    }
  });
  return JSON.parse(response.text);
};

export const generateWorkoutPlan = async (goal: string, focus: string): Promise<AIWorkoutPlan> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Design a specialized workout session. Goal: ${goal}. Focus area: ${focus}. Provide exercises with sets and reps.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          focus: { type: Type.STRING },
          exercises: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                sets: { type: Type.NUMBER },
                reps: { type: Type.STRING },
                description: { type: Type.STRING }
              },
              required: ["name", "sets", "reps"]
            }
          }
        },
        required: ["name", "focus", "exercises"]
      }
    }
  });
  return JSON.parse(response.text) as AIWorkoutPlan;
};
