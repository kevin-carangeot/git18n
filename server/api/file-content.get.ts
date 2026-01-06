export default defineEventHandler(async (event) => {
	const config = useRuntimeConfig()
	const query = getQuery(event)

	const branch = query.branch as string
	const filePath = query.path as string

	if (!branch || !filePath) {
		throw createError({
			statusCode: 400,
			statusMessage: 'Paramètres "branch" et "path" requis',
		})
	}

	const repoUrl = config.public.githubRepoUrl
	const match = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/)

	if (!match) {
		throw createError({
			statusCode: 500,
			statusMessage:
				'Configuration NUXT_PUBLIC_GITHUB_REPO_URL invalide. Format attendu : https://github.com/owner/repo',
		})
	}

	const [, owner, repo] = match

	try {
		const rawContent = await $fetch(
			`https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`,
			{
				method: 'GET',
				query: {
					ref: branch,
				},
				headers: {
					Authorization: `Bearer ${config.githubToken}`,
					'X-GitHub-Api-Version': '2022-11-28',
					Accept: 'application/vnd.github.raw',
				},
				responseType: 'text',
			}
		)

		return JSON.parse(rawContent)
	} catch (err: unknow) {
		console.error(`Erreur récupération fichier [${filePath}] sur [${branch}]:`, err)

		if (err.status === 404) {
			throw createError({
				statusCode: 404,
				statusMessage: `Fichier introuvable : ${filePath}`,
			})
		}

		throw createError({
			statusCode: 502,
			statusMessage: 'Impossible de lire le fichier depuis GitHub',
		})
	}
})
