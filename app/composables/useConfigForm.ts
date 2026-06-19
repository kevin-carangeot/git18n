import { EMPTY_CONFIG, type GitConfig } from '~/types/config'

export const useConfigForm = () => {
	const { config, save: persist, reset: clear } = useGitConfig()
	const form = reactive<GitConfig>({ ...EMPTY_CONFIG, ...config.value })

	const repoUrlValid = computed(() => /github\.com\/[^/]+\/[^/]+/.test(form.repoUrl))
	const repoValid = computed(
		() =>
			repoUrlValid.value &&
			Boolean(form.translationFolder.trim()) &&
			Boolean(form.githubToken.trim())
	)
	const languagesValid = computed(() => form.targetLanguages.length > 0)
	const apiKeyValid = computed(() => Boolean(form.geminiApiKey.trim()))
	const canSave = computed(() => repoValid.value && languagesValid.value && apiKeyValid.value)

	const save = (): boolean => {
		if (!canSave.value) return false
		persist({ ...form })
		return true
	}

	const reset = () => {
		clear()
		Object.assign(form, EMPTY_CONFIG)
	}

	return { form, repoUrlValid, repoValid, languagesValid, apiKeyValid, canSave, save, reset }
}
