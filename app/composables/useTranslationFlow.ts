import type { PrDiffResult } from '~~/server/utils/diff'
import { localeFilePath } from '~~/shared/utils/locale-path'

// Drives the PR → diff → translate → create-PR flow: owns the related state
// and the GitHub/Gemini calls, leaving index.vue to wire up the UI.
export const useTranslationFlow = () => {
	const { config } = useGitConfig()
	const { $api } = useNuxtApp()
	const notify = useNotify()
	const { t } = useI18n()

	const selectedPull = ref('')
	const diffData = ref<PrDiffResult | null>(null)
	const fetchingDiff = ref(false)
	const isTranslating = ref(false)
	const isCreatingPR = ref(false)
	const editableTranslations = ref<Record<string, string>>({})
	const loadingStatus = ref<Record<string, boolean>>({})

	const hasResults = computed(() => Object.keys(loadingStatus.value).length > 0)

	const resetView = () => {
		editableTranslations.value = {}
		loadingStatus.value = {}
	}

	const fetchDiff = async (branch: string) => {
		fetchingDiff.value = true
		diffData.value = null
		resetView()

		try {
			const filePath = localeFilePath(config.value.translationFolder, 'en')
			diffData.value = await $api('/api/pr-diff', { query: { branch, path: filePath } })
		} catch (err: unknown) {
			console.error(err)
			notify.error(t('toast.errorTitle'), { description: t('toast.fetchDiffFailed') })
		} finally {
			fetchingDiff.value = false
		}
	}

	watch(selectedPull, (branch) => {
		if (branch) fetchDiff(branch)
	})

	const startTranslation = async () => {
		if (!diffData.value || diffData.value.count === 0) return
		isTranslating.value = true
		const languages = config.value.targetLanguages

		languages.forEach((lang) => {
			loadingStatus.value[lang] = true
			editableTranslations.value[lang] = ''
		})

		try {
			const contentToTranslate = diffData.value.diff
			for (const lang of languages) {
				if (languages.indexOf(lang) > 0) await new Promise((r) => setTimeout(r, 500))
				const translatedJson = await $api<Record<string, unknown>>('/api/translate', {
					method: 'POST',
					body: { content: contentToTranslate, targetLang: lang },
				})
				editableTranslations.value[lang] = JSON.stringify(
					translatedJson,
					null,
					diffData.value.indentation
				)
				loadingStatus.value[lang] = false
			}
			notify.success(t('toast.successTitle'), {
				description: t('toast.translationsGenerated'),
			})
		} catch (err: unknown) {
			console.error(err)
			notify.error(t('toast.errorTitle'), { description: t('toast.translationFailed') })
		} finally {
			isTranslating.value = false
		}
	}

	const createPullRequest = async () => {
		isCreatingPR.value = true
		const translationsPayload: Record<string, unknown> = {}

		try {
			for (const [lang, contentStr] of Object.entries(editableTranslations.value)) {
				if (!contentStr.trim()) continue
				try {
					translationsPayload[lang] = JSON.parse(contentStr)
				} catch (err: unknown) {
					console.error(err)
					throw new Error(t('toast.invalidJson', { lang: lang.toUpperCase() }))
				}
			}

			if (Object.keys(translationsPayload).length === 0)
				throw new Error(t('toast.noTranslations'))

			const response = await $api('/api/create-pr', {
				method: 'POST',
				body: {
					baseBranch: diffData.value?.headBranch || selectedPull.value,
					translations: translationsPayload,
					indentation: diffData.value?.indentation ?? 2,
				},
			})

			notify.success(t('toast.prCreatedTitle'), {
				icon: 'i-heroicons-check-badge',
				duration: 5000,
			})
			window.open(response.url, '_blank')
		} catch (err: unknown) {
			const message = err instanceof Error ? err.message : t('toast.unknownError')
			notify.error(t('toast.failedTitle'), { description: message })
		} finally {
			isCreatingPR.value = false
		}
	}

	return {
		selectedPull,
		diffData,
		fetchingDiff,
		isTranslating,
		isCreatingPR,
		editableTranslations,
		loadingStatus,
		hasResults,
		startTranslation,
		createPullRequest,
		resetView,
	}
}
