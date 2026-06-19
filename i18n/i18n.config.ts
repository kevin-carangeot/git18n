export default defineI18nConfig(() => ({
	pluralRules: {
		// French: 0 and 1 are singular, everything else plural.
		fr: (choice: number, choicesLength: number): number => {
			if (choice <= 1) return 0
			return choicesLength > 1 ? 1 : 0
		},
	},
}))
