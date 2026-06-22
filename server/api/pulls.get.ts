import { createGitHubClient } from '~~/server/services/github'
import { getGitConfig } from '~~/server/utils/git-config'

export default defineEventHandler(async (event) => {
	const { owner, repo, token } = getGitConfig(event)
	const client = createGitHubClient({ owner, repo, token })

	try {
		const pulls = await client.listPulls()
		return pulls.map((pull) => ({
			label: pull.title,
			value: pull.head.ref,
		}))
	} catch (error) {
		console.error('GitHub API Error:', error)
		throw createError({ statusCode: 502, statusMessage: 'Failed to fetch pulls from GitHub' })
	}
})
