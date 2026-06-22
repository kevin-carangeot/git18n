import { calculateDetailedDiff, flattenDiffTree, countLeaves } from '~~/server/utils/diff'
import { detectIndentation } from '~~/server/utils/indent'
import { getGitConfig } from '~~/server/utils/git-config'

export default defineEventHandler(async (event) => {
	const { owner, repo, token } = getGitConfig(event)
	const query = getQuery(event)

	const branchName = query.branch as string
	const filePath = query.path as string

	if (!branchName || !filePath)
		throw createError({ statusCode: 400, statusMessage: 'Missing parameters' })

	const headers = {
		Authorization: `Bearer ${token}`,
		'X-GitHub-Api-Version': '2022-11-28',
		Accept: 'application/vnd.github.raw',
	}

	// Keep the raw text alongside the parsed data so indentation can be detected.
	const fetchJsonFile = async (
		ref: string
	): Promise<{ data: Record<string, unknown>; raw: string }> => {
		try {
			const raw = await $fetch<string>(
				`https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`,
				{ headers, query: { ref }, responseType: 'text' }
			)
			return { data: JSON.parse(raw), raw }
		} catch {
			return { data: {}, raw: '' }
		}
	}

	try {
		const repoInfo = await $fetch<{ default_branch: string }>(
			`https://api.github.com/repos/${owner}/${repo}`,
			{ headers: { Authorization: `Bearer ${token}` } }
		)
		const baseBranch = repoInfo.default_branch

		const [head, base] = await Promise.all([
			fetchJsonFile(branchName),
			fetchJsonFile(baseBranch),
		])

		const visualDiff = calculateDetailedDiff(base.data, head.data)
		const diff = flattenDiffTree(visualDiff)

		return {
			baseBranch,
			headBranch: branchName,
			diff,
			visualDiff,
			count: countLeaves(diff),
			indentation: detectIndentation(head.raw || base.raw),
		}
	} catch (err: unknown) {
		console.error('Diff error:', err)
		throw createError({ statusCode: 500, statusMessage: 'Diff calculation failed' })
	}
})
