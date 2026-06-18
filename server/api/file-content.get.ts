import { getGitConfig } from '~~/server/utils/git-config'

export default defineEventHandler(async (event) => {
	const { owner, repo, token } = getGitConfig(event)
	const query = getQuery(event)

	const branch = query.branch as string
	const filePath = query.path as string

	if (!branch || !filePath) {
		throw createError({
			statusCode: 400,
			statusMessage: 'Paramètres "branch" et "path" requis',
		})
	}

	try {
		const rawContent = await $fetch(
			`https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`,
			{
				method: 'GET',
				query: { ref: branch },
				headers: {
					Authorization: `Bearer ${token}`,
					'X-GitHub-Api-Version': '2022-11-28',
					Accept: 'application/vnd.github.raw',
				},
				responseType: 'text',
			}
		)

		return JSON.parse(rawContent)
	} catch (err: unknown) {
		console.error(`Erreur récupération fichier [${filePath}] sur [${branch}]:`, err)

		if (err && typeof err === 'object' && 'status' in err && err.status === 404) {
			throw createError({ statusCode: 404, statusMessage: `Fichier introuvable : ${filePath}` })
		}

		throw createError({
			statusCode: 502,
			statusMessage: 'Impossible de lire le fichier depuis GitHub',
		})
	}
})
