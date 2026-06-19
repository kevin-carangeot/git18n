import { translateContent } from '~~/server/services/gemini'
import { getGitConfig } from '~~/server/utils/git-config'

export default defineEventHandler(async (event) => {
	const { geminiApiKey } = getGitConfig(event, { github: false, gemini: true })
	const body = await readBody(event)
	const { content, targetLang } = body

	if (!content || !targetLang)
		throw createError({ statusCode: 400, statusMessage: 'Missing content or targetLang' })

	try {
		return await translateContent(geminiApiKey, content, targetLang)
	} catch (error) {
		console.error('Erreur Gemini:', error)
		throw createError({ statusCode: 502, statusMessage: 'Erreur IA' })
	}
})
