import { createTranslationPr } from '~~/server/services/github'
import { getGitConfig } from '~~/server/utils/git-config'

interface CreatePrBody {
	translations: Record<string, Record<string, unknown>>
	baseBranch: string
	indentation?: string | number
}

export default defineEventHandler(async (event) => {
	const { owner, repo, token, folder } = getGitConfig(event)
	const { translations, baseBranch, indentation = 2 } = await readBody<CreatePrBody>(event)

	if (!translations) throw createError({ statusCode: 400, statusMessage: 'Missing parameters' })

	try {
		const url = await createTranslationPr({
			owner,
			repo,
			token,
			folder,
			translations,
			baseBranch,
			indentation,
		})

		return { success: true, url }
	} catch (err: unknown) {
		console.error('PR Action Failed:', err)
		const status =
			err && typeof err === 'object' && 'response' in err
				? (err.response as { status?: number } | undefined)?.status
				: undefined
		const message = err instanceof Error ? err.message : 'Failed to create PR'
		throw createError({ statusCode: status || 500, statusMessage: message })
	}
})
