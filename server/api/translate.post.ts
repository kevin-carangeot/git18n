import { GoogleGenerativeAI } from "@google/generative-ai";
import { buildTranslationPrompt } from "~~/server/utils/prompt";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const body = await readBody(event);
  const { content, targetLang } = body;

  if (!config.geminiApiKey) throw createError({ statusCode: 500, statusMessage: "Missing API key" });
  if (!content || !targetLang) throw createError({ statusCode: 400, statusMessage: "Missing content or targetLang" });

  const genAI = new GoogleGenerativeAI(config.geminiApiKey);

  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash-lite",
    generationConfig: {
      responseMimeType: "application/json",
    },
  });

  const prompt = buildTranslationPrompt(content, targetLang);

  try {
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    return JSON.parse(responseText);
  } catch (error) {
    console.error("Erreur Gemini:", error);
    throw createError({ statusCode: 502, statusMessage: "Erreur IA" });
  }
});