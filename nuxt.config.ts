// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	app: {
		head: {
			title: 'Git18n',
			charset: 'utf-8',
			viewport: 'width=device-width, initial-scale=1',
		},
	},
	modules: ['@nuxt/ui', '@nuxt/eslint', '@nuxt/fonts', '@nuxtjs/i18n'],
	i18n: {
		locales: [
			{ code: 'fr', name: 'Français', file: 'fr.json' },
			{ code: 'en', name: 'English', file: 'en.json' },
		],
		defaultLocale: 'fr',
		strategy: 'no_prefix',
		detectBrowserLanguage: {
			useCookie: true,
			cookieKey: 'git18n-locale',
			redirectOn: 'root',
			fallbackLocale: 'fr',
		},
	},
	css: ['~/assets/css/main.css'],
	compatibilityDate: '2025-07-15',
	devtools: { enabled: true },
	ssr: false,
})
