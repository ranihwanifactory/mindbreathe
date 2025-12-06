import { GoogleGenAI, Type } from "@google/genai";
import { BreathingPattern } from "../types";

export const getCustomBreathingExercise = async (situation: string): Promise<BreathingPattern> => {
  try {
    // Initialize the client lazily to prevent top-level errors if the environment isn't ready
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const model = "gemini-2.5-flash";
    const response = await ai.models.generateContent({
      model: model,
      contents: `사용자의 현재 상태나 기분: "${situation}".
      이 상태에 처한 사람에게 가장 도움이 되는 맞춤형 호흡법을 하나 생성해주세요.
      결과는 반드시 JSON 형식이어야 합니다.
      타이밍(inhale, holdTop, exhale, holdBottom)은 상황에 적절한 초 단위 정수여야 합니다 (예: 불안할 때는 날숨을 길게, 에너지가 필요할 때는 빠른 호흡).
      모든 텍스트 필드(이름, 설명, 효과 등)는 '한국어'로 작성해주세요.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING, description: "호흡법의 창의적인 이름 (한국어)" },
            description: { type: Type.STRING, description: "이 호흡법이 어떻게 도움이 되는지 간단한 설명 (한국어)" },
            benefit: { type: Type.STRING, description: "주요 효과 (예: '즉각적인 진정') (한국어)" },
            inhale: { type: Type.INTEGER, description: "들숨 시간 (초)" },
            holdTop: { type: Type.INTEGER, description: "들숨 후 멈춤 시간 (초)" },
            exhale: { type: Type.INTEGER, description: "날숨 시간 (초)" },
            holdBottom: { type: Type.INTEGER, description: "날숨 후 멈춤 시간 (초)" },
          },
          required: ["name", "description", "benefit", "inhale", "holdTop", "exhale", "holdBottom"]
        }
      }
    });

    if (response.text) {
      const data = JSON.parse(response.text);
      return {
        id: `custom-${Date.now()}`,
        name: data.name,
        description: data.description,
        benefit: data.benefit,
        inhale: data.inhale,
        holdTop: data.holdTop,
        exhale: data.exhale,
        holdBottom: data.holdBottom,
        tags: ['맞춤형', 'AI 생성됨']
      };
    }
    throw new Error("No response text from AI");
  } catch (error) {
    console.error("Error fetching breathing exercise:", error);
    // Fallback to a gentle relaxation pattern if AI fails
    return {
      id: 'fallback-calm',
      name: '부드러운 흐름',
      description: '맞춤형 호흡법을 생성하지 못했습니다. 대신 마음을 편안하게 해주는 기본 호흡법을 추천해 드립니다.',
      benefit: '이완 & 안정',
      inhale: 4,
      holdTop: 0,
      exhale: 6,
      holdBottom: 0,
      tags: ['기본']
    };
  }
};