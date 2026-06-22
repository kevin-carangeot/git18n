// 0 and 1 are singular, everything else plural.
const singularZeroAndOne = (choice: number, choicesLength: number): number => {
	if (choice <= 1) return 0
	return choicesLength > 1 ? 1 : 0
}

// Apply the same rule to every locale without listing them: vue-i18n looks up
// pluralRules[locale], so a Proxy returns the rule whatever the locale is.
const pluralRules = new Proxy({}, { get: () => singularZeroAndOne }) as Record<
	string,
	typeof singularZeroAndOne
>

export default defineI18nConfig(() => ({ pluralRules }))
