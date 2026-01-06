<script setup lang="ts">
const config = useRuntimeConfig()
const toast = useToast()

// --- STATE ---
const selectedPull = ref('')
const { data: pulls, pending: pendingPulls } = await useFetch('/api/pulls')

const diffData = ref<{
	diff: Record<string, unknown>
	visualDiff: Record<string, unknown>
	count: number
	baseBranch: string
} | null>(null)

const fetchingDiff = ref(false)
const isTranslating = ref(false)
const isCreatingPR = ref(false)

const editableTranslations = ref<Record<string, string>>({})
const loadingStatus = ref<Record<string, boolean>>({})

// --- COMPUTED ---
const hasResults = computed(() => Object.keys(loadingStatus.value).length > 0)

const resultTabs = computed(() => {
	return (config.public.targetLanguages || []).map((lang: string) => ({
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
		const folder = config.public.githubTranslationFolder
		const filePath = folder.endsWith('/') ? `${folder}en.json` : `${folder}/en.json`
		diffData.value = await $fetch('/api/pr-diff', {
			query: { branch: newBranch, path: filePath },
		})
	} catch (err: unknown) {
		console.error(err)
		toast.add({ title: 'Error', description: 'Failed to fetch diff', color: 'red' })
	} finally {
		fetchingDiff.value = false
	}
})

const startTranslation = async () => {
	if (!diffData.value || diffData.value?.count === 0) return
	isTranslating.value = true
	const languages = config.public.targetLanguages as string[]

	languages.forEach((lang) => {
		loadingStatus.value[lang] = true
		editableTranslations.value[lang] = ''
	})

	try {
		const contentToTranslate = diffData.value.diff
		for (const lang of languages) {
			if (languages.indexOf(lang) > 0) await new Promise((r) => setTimeout(r, 500))
			const translatedJson = await $fetch<Record<string, unknown>>('/api/translate', {
				method: 'POST',
				body: { content: contentToTranslate, targetLang: lang },
			})
			editableTranslations.value[lang] = JSON.stringify(translatedJson, null, 4)
			loadingStatus.value[lang] = false
		}
		toast.add({ title: 'Success', description: 'All translations generated!', color: 'green' })
	} catch (err: unknown) {
		console.error(err)
		toast.add({ title: 'Error', description: 'Translation failed', color: 'red' })
	} finally {
		isTranslating.value = false
	}
}

const createPullRequest = async () => {
	isCreatingPR.value = true
	const translationsPayload: Record<string, unknown> = {}

	const getRepoInfo = () => {
		const url = config.public.githubRepoUrl as string
		const match = url.match(/github\.com\/([^/]+)\/([^/]+)/)
		if (!match) return { owner: '', repo: '' }
		return { owner: match[1], repo: match[2].replace('.git', '') }
	}

	try {
		for (const [lang, contentStr] of Object.entries(editableTranslations.value)) {
			if (!contentStr.trim()) continue
			try {
				translationsPayload[lang] = JSON.parse(contentStr)
			} catch (err: unknown) {
				console.error(err)
				throw new Error(`Invalid JSON in ${lang.toUpperCase()} tab.`)
			}
		}

		if (Object.keys(translationsPayload).length === 0)
			throw new Error('No translations to save.')

		const { owner, repo } = getRepoInfo()
		const response = await $fetch('/api/create-pr', {
			method: 'POST',
			body: {
				owner,
				repo,
				baseBranch: diffData.value?.baseBranch || 'main',
				folderPath: config.public.githubTranslationFolder,
				translations: translationsPayload,
			},
		})

		toast.add({
			title: 'PR Created!',
			color: 'green',
			icon: 'i-heroicons-check-badge',
			timeout: 5000,
			callback: () => window.open(response.url, '_blank'),
		})
		window.open(response.url, '_blank')
	} catch (err: unknown) {
		const message = err instanceof Error ? err.message : 'Unknown error'
		toast.add({ title: 'Failed', description: message, color: 'red' })
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
	<UContainer class="max-w-4xl py-6">
		<div class="flex items-center justify-between mb-6">
			<div class="flex items-center gap-2">
				<h1 class="text-2xl font-bold text-gray-900 dark:text-white">Git18n</h1>
				<UBadge v-if="hasResults" color="primary" variant="subtle" size="xs"
					>Editor Mode</UBadge
				>
			</div>
			<UButton
				v-if="hasResults"
				icon="i-heroicons-arrow-left"
				color="gray"
				variant="ghost"
				label="Back to Config"
				@click="resetView"
			/>
		</div>

		<div v-if="!hasResults" class="space-y-6 animate-fade-in">
			<ConfigSelector
				v-model="selectedPull"
				:repo-url="config.public.githubRepoUrl"
				:pulls="pulls"
				:pending="pendingPulls"
			/>

			<DiffReview
				:diff-data="diffData"
				:fetching="fetchingDiff"
				:is-translating="isTranslating"
				:target-langs-count="config.public.targetLanguages.length"
				@start-translation="startTranslation"
			/>
		</div>

		<div v-else class="animate-fade-in space-y-4">
			<TranslationEditor
				v-model="editableTranslations"
				:tabs="resultTabs"
				:loading-status="loadingStatus"
				:diff-count="diffData?.count || 0"
				:base-branch="diffData?.baseBranch || 'main'"
			/>

			<PrActionCard :loading="isCreatingPR" @create="createPullRequest" />
		</div>
	</UContainer>
</template>
