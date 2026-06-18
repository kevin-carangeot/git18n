import { merge } from '~~/server/utils/merge'
import { getGitConfig } from '~~/server/utils/git-config'

export default defineEventHandler(async (event) => {
	const { owner, repo, token, folder } = getGitConfig(event)
	const body = await readBody(event)
	const { translations, baseBranch, indentation = 2 } = body

	if (!translations) throw createError({ statusCode: 400, statusMessage: 'Missing parameters' })

	const headers = {
		Authorization: `Bearer ${token}`,
		'X-GitHub-Api-Version': '2022-11-28',
		Accept: 'application/vnd.github.v3+json',
		'User-Agent': 'Nuxt-i18n-App',
	}

	const newBranchName = `feat/i18n-update-${Date.now()}`
	const apiBase = `https://api.github.com/repos/${owner}/${repo}`
	const cleanFolder = folder ? folder.replace(/\/$/, '') : 'locales'

	try {
		// 1. Get base SHA
		const refData = await $fetch<{ object: { sha: string } }>(
			`${apiBase}/git/ref/heads/${baseBranch}`,
			{ headers }
		)
		const baseSha = refData.object.sha

		// 2. Create branch
		await $fetch(`${apiBase}/git/refs`, {
			method: 'POST',
			headers,
			body: { ref: `refs/heads/${newBranchName}`, sha: baseSha },
		})

		// 3. Process files
		for (const [lang, newContent] of Object.entries(translations)) {
			const filePath = `${cleanFolder}/${lang}.json`

			let currentContentObj = {}
			let fileSha = undefined

			try {
				const fileData = await $fetch<{ content: string; sha: string }>(
					`${apiBase}/contents/${filePath}`,
					{
						headers,
						query: { ref: newBranchName },
					}
				)

				const rawContent = Buffer.from(fileData.content, 'base64').toString('utf-8')
				currentContentObj = JSON.parse(rawContent)
				fileSha = fileData.sha
			} catch {
				// File does not exist
			}

			const finalJson = merge(currentContentObj, newContent)
			const jsonString = JSON.stringify(finalJson, null, indentation) + '\n'
			const encodedContent = Buffer.from(jsonString).toString('base64')

			// Update/Create file
			await $fetch(`${apiBase}/contents/${filePath}`, {
				method: 'PUT',
				headers,
				body: {
					message: `chore(i18n): update ${lang}.json`,
					content: encodedContent,
					branch: newBranchName,
					sha: fileSha,
				},
			})
		}

		// 4. Create PR
		const pr = await $fetch<{ html_url: string }>(`${apiBase}/pulls`, {
			method: 'POST',
			headers,
			body: {
				title: `chore: update translations (${Object.keys(translations).join(', ')})`,
				body: `Automated updates via Git18n.\nLanguages: ${Object.keys(translations).join(', ')}.`,
				head: newBranchName,
				base: baseBranch,
			},
		})

		return { success: true, url: pr.html_url }
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
