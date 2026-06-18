// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	app: {
		head: {
			title: 'Git18n',
			charset: 'utf-8',
			viewport: 'width=device-width, initial-scale=1',
		},
	},
	modules: ['@nuxt/ui', '@nuxt/eslint', '@nuxt/fonts'],
	css: ['~/assets/css/main.css'],
	compatibilityDate: '2025-07-15',
	devtools: { enabled: true },
	runtimeConfig: {
		githubToken: process.env.GITHUB_TOKEN,
		geminiApiKey: process.env.GEMINI_API_KEY,
		public: {
			githubRepoUrl: process.env.GITHUB_REPO_URL,
			githubTranslationFolder: process.env.GITHUB_TRANSLATION_FOLDER,
			targetLanguages: ['fr', 'es', 'de', 'it', 'pt', 'nl', 'pl', 'ru', 'ro'],
		},
	},
	ssr: false,
})
