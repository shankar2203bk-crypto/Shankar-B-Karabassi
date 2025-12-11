import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AnalysisResult, SimulationResponse } from "../types";

// Initialize the Gemini API client
// Note: process.env.API_KEY is automatically injected by the environment.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const analysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    score: {
      type: Type.INTEGER,
      description: "A score from 0 to 10 rating the quality and effectiveness of the prompt.",
    },
    level: {
      type: Type.STRING,
      enum: ["Beginner", "Intermediate", "Advanced"],
      description: "The difficulty level or sophistication of the prompt.",
    },
    summary: {
      type: Type.STRING,
      description: "A brief summary of the prompt's intent and quality.",
    },
    strengths: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "List of what the prompt does well.",
    },
    weaknesses: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "List of areas where the prompt is lacking.",
    },
    suggestions: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Actionable tips to improve the prompt.",
    },
    improvedPrompt: {
      type: Type.STRING,
      description: "A rewritten version of the prompt that applies the improvements.",
    },
  },
  required: ["score", "level", "summary", "strengths", "weaknesses", "suggestions", "improvedPrompt"],
};

const cleanJson = (text: string): string => {
  let clean = text.trim();
  // Remove markdown code blocks if present
  if (clean.startsWith('```json')) {
    clean = clean.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  } else if (clean.startsWith('```')) {
    clean = clean.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }
  return clean;
};

export const analyzePrompt = async (prompt: string): Promise<AnalysisResult> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Analyze the following prompt designed for an LLM. 
      Evaluate it based on clarity, context, constraints, and potential for hallucination.
      Rate it out of 10.
      Categorize it as Beginner, Intermediate, or Advanced based on the prompt engineering techniques used (e.g., zero-shot, few-shot, chain-of-thought, persona adoption).
      Provide specific feedback and a rewritten 'Master' version.
      
      Prompt to analyze:
      "${prompt}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
        systemInstruction: "You are a world-class Prompt Engineer and educator. Your goal is to help users write better prompts.",
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("No analysis generated");
    }
    
    try {
      return JSON.parse(cleanJson(text)) as AnalysisResult;
    } catch (e) {
      console.error("Failed to parse JSON:", text);
      throw new Error("Failed to parse analysis result");
    }
  } catch (error) {
    console.error("Error analyzing prompt:", error);
    throw error;
  }
};

export const executePrompt = async (prompt: string, useGrounding: boolean = true): Promise<SimulationResponse> => {
  try {
    const config: any = {};
    
    if (useGrounding) {
      config.tools = [{ googleSearch: {} }];
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: config
    });

    // Extract grounding chunks if available
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const webSources = groundingChunks
      .map(chunk => chunk.web)
      .filter((web): web is { uri: string; title: string } => !!web);

    return {
      content: response.text || "No output generated.",
      webSources: webSources.length > 0 ? webSources : undefined
    };
  } catch (error) {
    console.error("Error executing prompt:", error);
    return { content: "Error: Could not execute prompt. Please try again." };
  }
};

export const executeImagePrompt = async (prompt: string): Promise<SimulationResponse> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: prompt }],
      },
    });
    
    // Iterate through parts to find the image
    const parts = response.candidates?.[0]?.content?.parts || [];
    for (const part of parts) {
      if (part.inlineData && part.inlineData.data) {
        return { 
          content: `data:${part.inlineData.mimeType};base64,${part.inlineData.data}` 
        };
      }
    }
    
    return { content: "No image generated. The model may have returned only text." };
  } catch (error) {
    console.error("Error generating image:", error);
    return { content: "Error: Could not generate image. Please try again." };
  }
};