import { GoogleGenerativeAI } from '@google/generative-ai'
import { buildTranslationPrompt } from '~~/server/utils/prompt'

export const translateContent = async (
	apiKey: string,
	content: Record<string, unknown>,
	targetLang: string
): Promise<Record<string, unknown>> => {
	const genAI = new GoogleGenerativeAI(apiKey)
	const model = genAI.getGenerativeModel({
		model: 'gemini-2.5-flash-lite',
		generationConfig: { responseMimeType: 'application/json', temperature: 0 },
	})

	const prompt = buildTranslationPrompt(content, targetLang)
	const result = await model.generateContent(prompt)
	return JSON.parse(result.response.text())
}
