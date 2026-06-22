import { CONFIG_STORAGE_KEY, EMPTY_CONFIG, type GitConfig } from '~/types/config'

const config = ref<GitConfig>({ ...EMPTY_CONFIG })

const read = (): GitConfig => {
	if (import.meta.server) return { ...EMPTY_CONFIG }
	try {
		const raw = localStorage.getItem(CONFIG_STORAGE_KEY)
		if (!raw) return { ...EMPTY_CONFIG }
		return { ...EMPTY_CONFIG, ...(JSON.parse(raw) as Partial<GitConfig>) }
	} catch {
		return { ...EMPTY_CONFIG }
	}
}

export const useGitConfig = () => {
	if (import.meta.client && !localStorageLoaded) {
		config.value = read()
		localStorageLoaded = true
	}

	const isConfigured = computed(() =>
		Boolean(
			config.value.repoUrl &&
			config.value.translationFolder &&
			config.value.githubToken &&
			config.value.geminiApiKey &&
			config.value.targetLanguages.length >= 1
		)
	)

	const save = (next: GitConfig) => {
		config.value = { ...next }
		if (import.meta.client) localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(next))
	}

	const reset = () => {
		config.value = { ...EMPTY_CONFIG }
		if (import.meta.client) localStorage.removeItem(CONFIG_STORAGE_KEY)
	}

	return { config, isConfigured, save, reset }
}

let localStorageLoaded = false
