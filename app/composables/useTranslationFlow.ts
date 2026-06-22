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
		const { diff: contentToTranslate, indentation } = diffData.value

		languages.forEach((lang) => {
			loadingStatus.value[lang] = true
			editableTranslations.value[lang] = ''
		})

		// Languages translate concurrently; each tab resolves independently.
		const results = await Promise.allSettled(
			languages.map(async (lang) => {
				try {
					const translatedJson = await $api<Record<string, unknown>>('/api/translate', {
						method: 'POST',
						body: { content: contentToTranslate, targetLang: lang },
					})
					editableTranslations.value[lang] = JSON.stringify(
						translatedJson,
						null,
						indentation
					)
				} finally {
					loadingStatus.value[lang] = false
				}
			})
		)

		isTranslating.value = false

		const failed = results.filter((r) => r.status === 'rejected')
		if (failed.length > 0) {
			failed.forEach((r) => console.error(r.reason))
			notify.error(t('toast.errorTitle'), { description: t('toast.translationFailed') })
		} else {
			notify.success(t('toast.successTitle'), {
				description: t('toast.translationsGenerated'),
			})
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

			// The translation PR targets the selected PR's own branch (its head ref):
			// new keys are added straight onto that feature branch, not the repo default.
			const response = await $api<{ success: boolean; url: string }>('/api/create-pr', {
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
