export default defineNuxtPlugin(() => {
	const api = $fetch.create({
		onRequest({ options }) {
			const { config } = useGitConfig()
			const c = config.value
			const headers = new Headers(options.headers)
			if (c.repoUrl) headers.set('x-git18n-repo-url', c.repoUrl)
			if (c.githubToken) headers.set('x-git18n-token', c.githubToken)
			if (c.translationFolder) headers.set('x-git18n-folder', c.translationFolder)
			if (c.geminiApiKey) headers.set('x-git18n-gemini-key', c.geminiApiKey)
			options.headers = headers
		},
	})

	return { provide: { api } }
})
