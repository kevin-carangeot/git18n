// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	modules: [
		'@nuxt/ui',
		'@nuxt/eslint'
	],
	css: ['~/assets/css/main.css'],
	compatibilityDate: '2025-07-15',
	devtools: { enabled: true },
	runtimeConfig: {
		githubToken: process.env.GITHUB_TOKEN,
		geminiApiKey: process.env.GEMINI_API_KEY,
		public: {
			githubRepoUrl: process.env.GITHUB_REPO_URL,
			githubTranslationFolder: process.env.GITHUB_TRANSLATION_FOLDER,
			targetLanguages: ['fr', 'es', 'de', 'it', 'pt', 'nl', 'pl', 'ru', 'ro']
		}
	},
	ssr: false
})
