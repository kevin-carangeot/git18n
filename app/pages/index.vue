<script setup lang="ts">
import { LANGUAGE_CATALOG } from '~/types/config'

const { config: gitConfig, isConfigured } = useGitConfig()
const { $api } = useNuxtApp()
const { t } = useI18n()

const {
	data: pulls,
	pending: pendingPulls,
	refresh: refreshPulls,
} = await useFetch('/api/pulls', { $fetch: $api, immediate: isConfigured.value })

// Load pull requests as soon as the user finishes configuring.
watch(isConfigured, (configured) => {
	if (configured) refreshPulls()
})

const {
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
} = useTranslationFlow()

const resultTabs = computed(() =>
	gitConfig.value.targetLanguages.map((lang) => ({
		label: lang.toUpperCase(),
		code: lang,
		slot: 'content-view',
	}))
)
</script>

<template>
	<UContainer class="max-w-[920px] pt-6 pb-14">
		<div v-if="hasResults" class="mb-6 flex items-start justify-between gap-4">
			<div class="flex items-center gap-3">
				<IconBadge
					icon="i-heroicons-pencil-square"
					size="md"
					class="ring-1 ring-emerald-100 dark:ring-emerald-500/20"
				/>
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
