<script setup lang="ts">
import { LANGUAGE_CATALOG } from '~/types/config'
import type { PrDiffResult } from '~~/server/utils/diff'
import { localeFilePath } from '~~/shared/utils/locale-path'

const { config: gitConfig, isConfigured } = useGitConfig()
const { $api } = useNuxtApp()
const toast = useToast()
const { t } = useI18n()

// --- STATE ---
const selectedPull = ref('')
const {
	data: pulls,
	pending: pendingPulls,
	refresh: refreshPulls,
} = await useFetch('/api/pulls', { $fetch: $api, immediate: isConfigured.value })

// Load pull requests as soon as the user finishes configuring.
watch(isConfigured, (configured) => {
	if (configured) refreshPulls()
})

const diffData = ref<PrDiffResult | null>(null)

const fetchingDiff = ref(false)
const isTranslating = ref(false)
const isCreatingPR = ref(false)

const editableTranslations = ref<Record<string, string>>({})
const loadingStatus = ref<Record<string, boolean>>({})

// --- COMPUTED ---
const hasResults = computed(() => Object.keys(loadingStatus.value).length > 0)

const resultTabs = computed(() => {
	return gitConfig.value.targetLanguages.map((lang: string) => ({
		label: lang.toUpperCase(),
		code: lang,
		slot: 'content-view',
	}))
})

// --- ACTIONS ---
watch(selectedPull, async (newBranch) => {
	if (!newBranch) return
	fetchingDiff.value = true
	diffData.value = null
	resetView()

	try {
		const filePath = localeFilePath(gitConfig.value.translationFolder, 'en')
		diffData.value = await $api('/api/pr-diff', {
			query: { branch: newBranch, path: filePath },
		})
	} catch (err: unknown) {
		console.error(err)
		toast.add({
			title: t('toast.errorTitle'),
			description: t('toast.fetchDiffFailed'),
			color: 'error',
		})
	} finally {
		fetchingDiff.value = false
	}
})

const startTranslation = async () => {
	if (!diffData.value || diffData.value?.count === 0) return
	isTranslating.value = true
	const languages = gitConfig.value.targetLanguages

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
		toast.add({
			title: t('toast.successTitle'),
			description: t('toast.translationsGenerated'),
			color: 'success',
		})
	} catch (err: unknown) {
		console.error(err)
		toast.add({
			title: t('toast.errorTitle'),
			description: t('toast.translationFailed'),
			color: 'error',
		})
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

		toast.add({
			title: t('toast.prCreatedTitle'),
			color: 'success',
			icon: 'i-heroicons-check-badge',
			duration: 5000,
		})
		window.open(response.url, '_blank')
	} catch (err: unknown) {
		const message = err instanceof Error ? err.message : t('toast.unknownError')
		toast.add({ title: t('toast.failedTitle'), description: message, color: 'error' })
	} finally {
		isCreatingPR.value = false
	}
}

const resetView = () => {
	editableTranslations.value = {}
	loadingStatus.value = {}
}
</script>

<template>
	<UContainer class="max-w-[920px] pt-6 pb-14">
		<div v-if="hasResults" class="mb-6 flex items-start justify-between gap-4">
			<div class="flex items-center gap-3">
				<div
					class="flex size-11 items-center justify-center rounded-xl bg-emerald-50 ring-1 ring-emerald-100 dark:bg-emerald-500/10 dark:ring-emerald-500/20"
				>
					<UIcon
						name="i-heroicons-pencil-square"
						class="size-5 text-emerald-600 dark:text-emerald-400"
					/>
				</div>
				<div>
					<h2 class="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
						{{ t('home.reviewTitle') }}
					</h2>
					<p class="text-sm text-slate-500 dark:text-slate-400">
						{{ t('home.reviewSubtitle') }}
					</p>
				</div>
			</div>
			<UButton
				icon="i-heroicons-arrow-left"
				color="neutral"
				variant="ghost"
				:label="t('common.backToConfig')"
				@click="resetView"
			/>
		</div>

		<div v-if="!hasResults" class="animate-fade-in space-y-7">
			<div class="mb-5 text-center">
				<span
					class="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400"
				>
					<span class="size-1.5 rounded-full bg-emerald-500 ring-3 ring-emerald-500/20" />
					{{ t('home.badge') }}
				</span>
				<h1
					class="text-4xl font-bold leading-[1.08] tracking-tight text-slate-900 dark:text-white"
				>
					{{ t('home.titleLine1') }}
					<span
						class="block bg-linear-to-r from-emerald-600 to-emerald-700 bg-clip-text text-transparent"
					>
						{{ t('home.titleLine2') }}
					</span>
				</h1>
				<p class="mx-auto mt-3 max-w-2xl text-base text-slate-500 dark:text-slate-400">
					{{ t('home.subtitle', { count: LANGUAGE_CATALOG.length }) }}
				</p>
			</div>

			<ConfigWizard v-if="!isConfigured" />

			<template v-else>
				<ConfigSelector
					v-model="selectedPull"
					:repo-url="gitConfig.repoUrl"
					:pulls="pulls"
					:pending="pendingPulls"
				/>

				<DiffReview
					:diff-data="diffData"
					:fetching="fetchingDiff"
					:is-translating="isTranslating"
					:target-langs-count="gitConfig.targetLanguages.length"
					@start-translation="startTranslation"
				/>
			</template>
		</div>

		<div v-else class="animate-fade-in space-y-4">
			<TranslationEditor
				v-model="editableTranslations"
				:tabs="resultTabs"
				:loading-status="loadingStatus"
				:diff-count="diffData?.count || 0"
				:base-branch="diffData?.headBranch || selectedPull"
			/>

			<PrActionCard :loading="isCreatingPR" @create="createPullRequest" />
		</div>
	</UContainer>
</template>
