import { getGitConfig } from '~~/server/utils/git-config'

interface GitHubPull {
	title: string
	head: { ref: string }
}

export default defineEventHandler(async (event) => {
	const { owner, repo, token } = getGitConfig(event)

	try {
		const pulls = await $fetch<GitHubPull[]>(
			`https://api.github.com/repos/${owner}/${repo}/pulls`,
			{
				headers: {
					Authorization: `Bearer ${token}`,
					'X-GitHub-Api-Version': '2022-11-28',
				},
				query: { per_page: 100 },
			}
		)

		return pulls.map((pull) => ({
			label: pull.title,
			value: pull.head.ref,
		}))
	} catch (error) {
		console.error('GitHub API Error:', error)
		throw createError({ statusCode: 502, statusMessage: 'Failed to fetch pulls from GitHub' })
	}
})
