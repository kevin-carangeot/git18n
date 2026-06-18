import { calculateJsonDiff, calculateDetailedDiff } from '~~/server/utils/diff'
import { getGitConfig } from '~~/server/utils/git-config'

// 👇 HELPER FUNCTION: Recursively counts only the final values (leaves)
// It ignores objects/folders and counts actual strings/numbers
const countLeafNodes = (obj: Record<string, unknown>): number => {
	let count = 0

	for (const key in obj) {
		if (Object.prototype.hasOwnProperty.call(obj, key)) {
			const value = obj[key]

			// If it's an object (nested folder), dig deeper
			if (typeof value === 'object' && value !== null) {
				count += countLeafNodes(value)
			}
			// If it's a value (string, number, boolean), it counts as 1 key
			else {
				count++
			}
		}
	}
	return count
}

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

	// Helper to fetch and parse safely
	const fetchJsonFile = async (ref: string) => {
		try {
			const raw = await $fetch<string>(
				`https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`,
				{
					headers,
					query: { ref },
					responseType: 'text',
				}
			)
			return JSON.parse(raw)
		} catch {
			return {}
		}
	}

	try {
		// 1. Get Repo Info for default branch
		const repoInfo = await $fetch<{ default_branch: string }>(
			`https://api.github.com/repos/${owner}/${repo}`,
			{
				headers: { Authorization: `Bearer ${token}` },
			}
		)
		const baseBranch = repoInfo.default_branch

		// 2. Fetch both versions
		const [headContent, baseContent] = await Promise.all([
			fetchJsonFile(branchName),
			fetchJsonFile(baseBranch),
		])

		// 3. Calculate Diffs
		const diffJson = calculateJsonDiff(baseContent, headContent)
		const visualDiff = calculateDetailedDiff(baseContent, headContent)

		const preciseCount = countLeafNodes(diffJson)

		return {
			baseBranch,
			headBranch: branchName,
			diff: diffJson,
			visualDiff: visualDiff,
			count: preciseCount,
		}
	} catch (err: unknown) {
		console.error('Diff Error:', err)
		throw createError({ statusCode: 500, statusMessage: 'Diff calculation failed' })
	}
})
