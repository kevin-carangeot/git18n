import { translateContent } from '~~/server/services/gemini'
import { getGitConfig } from '~~/server/utils/git-config'

interface TranslateBody {
	content: Record<string, unknown>
	targetLang: string
}

export default defineEventHandler(async (event) => {
	const { geminiApiKey } = getGitConfig(event, { github: false, gemini: true })
	const { content, targetLang } = await readBody<TranslateBody>(event)

	if (!content || !targetLang)
		throw createError({ statusCode: 400, statusMessage: 'Missing content or targetLang' })

	try {
		return await translateContent(geminiApiKey, content, targetLang)
	} catch (error) {
		console.error('Gemini error:', error)
		throw createError({ statusCode: 502, statusMessage: 'AI translation failed' })
	}
})
