// 0 and 1 are singular, everything else plural.
const singularZeroAndOne = (choice: number, choicesLength: number): number => {
	if (choice <= 1) return 0
	return choicesLength > 1 ? 1 : 0
}

export default defineI18nConfig(() => ({
	pluralRules: {
		fr: singularZeroAndOne,
		en: singularZeroAndOne,
	},
}))
