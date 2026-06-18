import type { H3Event } from 'h3'

interface ResolvedGitConfig {
	repoUrl: string
	owner: string
	repo: string
	token: string
	folder: string
	geminiApiKey: string
}

interface GitConfigOptions {
	github?: boolean
	gemini?: boolean
}

export const getGitConfig = (
	event: H3Event,
	opts: GitConfigOptions = { github: true }
): ResolvedGitConfig => {
	const repoUrl = getHeader(event, 'x-git18n-repo-url') ?? ''
	const token = getHeader(event, 'x-git18n-token') ?? ''
	const folder = getHeader(event, 'x-git18n-folder') ?? ''
	const geminiApiKey = getHeader(event, 'x-git18n-gemini-key') ?? ''

	let owner = ''
	let repo = ''

	if (opts.github) {
		if (!repoUrl || !token)
			throw createError({ statusCode: 400, statusMessage: 'Missing GitHub configuration' })

		const match = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/)
		if (!match)
			throw createError({ statusCode: 400, statusMessage: 'Invalid GitHub repository URL' })

		owner = match[1]
		repo = match[2].replace(/\.git$/, '')
	}

	if (opts.gemini && !geminiApiKey)
		throw createError({ statusCode: 400, statusMessage: 'Missing Gemini API key' })

	return { repoUrl, owner, repo, token, folder, geminiApiKey }
}
