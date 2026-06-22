export interface LanguageOption {
	code: string
	flag: string
}

// An open pull request, as returned by `GET /api/pulls` (value is the head ref).
export interface PullOption {
	label: string
	value: string
}

export interface GitConfig {
	repoUrl: string
	translationFolder: string
	githubToken: string
	geminiApiKey: string
	targetLanguages: string[]
}

// Source language is fixed; rendered as a locked card in the picker.
export const SOURCE_LANGUAGE: LanguageOption = { code: 'en', flag: '🇬🇧' }

// Selectable target languages. Display names are derived at render time
// via Intl.DisplayNames using the active UI locale.
export const LANGUAGE_CATALOG: LanguageOption[] = [
	{ code: 'fr', flag: '🇫🇷' },
	{ code: 'es', flag: '🇪🇸' },
	{ code: 'de', flag: '🇩🇪' },
	{ code: 'it', flag: '🇮🇹' },
	{ code: 'pt', flag: '🇵🇹' },
	{ code: 'nl', flag: '🇳🇱' },
	{ code: 'pl', flag: '🇵🇱' },
	{ code: 'ru', flag: '🇷🇺' },
	{ code: 'ro', flag: '🇷🇴' },
	{ code: 'uk', flag: '🇺🇦' },
	{ code: 'cs', flag: '🇨🇿' },
	{ code: 'el', flag: '🇬🇷' },
	{ code: 'sv', flag: '🇸🇪' },
	{ code: 'da', flag: '🇩🇰' },
	{ code: 'fi', flag: '🇫🇮' },
]

export const EMPTY_CONFIG: GitConfig = {
	repoUrl: '',
	translationFolder: '',
	githubToken: '',
	geminiApiKey: '',
	targetLanguages: ['fr'],
}

export const CONFIG_STORAGE_KEY = 'git18n-config'
