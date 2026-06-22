import { calculateDetailedDiff, flattenDiffTree, countLeaves } from '~~/server/utils/diff'
import { detectIndentation } from '~~/server/utils/indent'
import { getGitConfig } from '~~/server/utils/git-config'
import { createGitHubClient } from '~~/server/services/github'
import type { JsonObject } from '~~/shared/types/json'

export default defineEventHandler(async (event) => {
	const { owner, repo, token } = getGitConfig(event)
	const query = getQuery(event)

	const branchName = query.branch as string
	const filePath = query.path as string

	if (!branchName || !filePath)
		throw createError({ statusCode: 400, statusMessage: 'Missing parameters' })

	const client = createGitHubClient({ owner, repo, token })

	// Keep the raw text alongside the parsed data so indentation can be detected.
	// A missing file (404) yields an empty object; any other error propagates.
	const fetchJsonFile = async (ref: string): Promise<{ data: JsonObject; raw: string }> => {
		const raw = await client.getFileRaw(filePath, ref)
		if (raw === null) return { data: {}, raw: '' }
		return { data: JSON.parse(raw), raw }
	}

	try {
		const { default_branch: baseBranch } = await client.getRepo()

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
