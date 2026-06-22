import { merge } from '~~/server/utils/merge'
import { localeFilePath } from '~~/shared/utils/locale-path'
import type { JsonObject } from '~~/shared/types/json'

interface GitHubClientOptions {
	owner: string
	repo: string
	token: string
}

export interface GitHubPull {
	title: string
	head: { ref: string }
}

const buildHeaders = (token: string) => ({
	Authorization: `Bearer ${token}`,
	'X-GitHub-Api-Version': '2022-11-28',
	Accept: 'application/vnd.github.v3+json',
	'User-Agent': 'Nuxt-i18n-App',
})

const isNotFound = (err: unknown): boolean =>
	!!err && typeof err === 'object' && 'statusCode' in err && err.statusCode === 404

export const createGitHubClient = ({ owner, repo, token }: GitHubClientOptions) => {
	const apiBase = `https://api.github.com/repos/${owner}/${repo}`
	const headers = buildHeaders(token)

	return {
		async getRepo(): Promise<{ default_branch: string }> {
			return $fetch<{ default_branch: string }>(apiBase, { headers })
		},

		async listPulls(): Promise<GitHubPull[]> {
			return $fetch<GitHubPull[]>(`${apiBase}/pulls`, { headers, query: { per_page: 100 } })
		},

		// Returns the raw file text, or null only when the file genuinely does
		// not exist (404). Any other error propagates instead of being masked.
		async getFileRaw(path: string, ref: string): Promise<string | null> {
			try {
				return await $fetch<string>(`${apiBase}/contents/${path}`, {
					headers: { ...headers, Accept: 'application/vnd.github.raw' },
					query: { ref },
					responseType: 'text',
				})
			} catch (err) {
				if (isNotFound(err)) return null
				throw err
			}
		},

		async getBranchSha(branch: string): Promise<string> {
			const ref = await $fetch<{ object: { sha: string } }>(
				`${apiBase}/git/ref/heads/${branch}`,
				{ headers }
			)
			return ref.object.sha
		},

		async createBranch(name: string, sha: string): Promise<void> {
			await $fetch(`${apiBase}/git/refs`, {
				method: 'POST',
				headers,
				body: { ref: `refs/heads/${name}`, sha },
			})
		},

		async getFile(
			path: string,
			ref: string
		): Promise<{ content: JsonObject; sha: string } | null> {
			try {
				const file = await $fetch<{ content: string; sha: string }>(
					`${apiBase}/contents/${path}`,
					{ headers, query: { ref } }
				)
				const raw = Buffer.from(file.content, 'base64').toString('utf-8')
				return { content: JSON.parse(raw), sha: file.sha }
			} catch (err) {
				if (isNotFound(err)) return null
				throw err
			}
		},

		async putFile(params: {
			path: string
			message: string
			content: string
			branch: string
			sha?: string
		}): Promise<void> {
			await $fetch(`${apiBase}/contents/${params.path}`, {
				method: 'PUT',
				headers,
				body: {
					message: params.message,
					content: Buffer.from(params.content).toString('base64'),
					branch: params.branch,
					sha: params.sha,
				},
			})
		},

		async createPullRequest(params: {
			title: string
			body: string
			head: string
			base: string
		}): Promise<string> {
			const pr = await $fetch<{ html_url: string }>(`${apiBase}/pulls`, {
				method: 'POST',
				headers,
				body: params,
			})
			return pr.html_url
		},
	}
}

export const createTranslationPr = async (params: {
	owner: string
	repo: string
	token: string
	folder: string
	translations: Record<string, JsonObject>
	baseBranch: string
	indentation: string | number
}): Promise<string> => {
	const { owner, repo, token, folder, translations, baseBranch, indentation } = params
	const client = createGitHubClient({ owner, repo, token })

	const newBranchName = `feat/i18n-update-${Date.now()}`
	const languages = Object.keys(translations)

	const baseSha = await client.getBranchSha(baseBranch)
	await client.createBranch(newBranchName, baseSha)

	for (const [lang, newContent] of Object.entries(translations)) {
		const filePath = localeFilePath(folder, lang)
		const existing = await client.getFile(filePath, newBranchName)

		const finalJson = merge(existing?.content ?? {}, newContent)
		const jsonString = JSON.stringify(finalJson, null, indentation) + '\n'

		await client.putFile({
			path: filePath,
			message: `chore(i18n): update ${lang}.json`,
			content: jsonString,
			branch: newBranchName,
			sha: existing?.sha,
		})
	}

	return client.createPullRequest({
		title: `chore: update translations (${languages.join(', ')})`,
		body: `Automated updates via Git18n.\nLanguages: ${languages.join(', ')}.`,
		head: newBranchName,
		base: baseBranch,
	})
}
