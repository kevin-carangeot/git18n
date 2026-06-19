<script setup lang="ts">
const { form, repoUrlValid, repoValid, languagesValid, apiKeyValid, canSave, save, reset } =
	useConfigForm()
const toast = useToast()
const { t } = useI18n()

const active = ref('repo')

const tabs = computed(() => [
	{ label: t('configSteps.repoTitle'), icon: 'i-octicon-mark-github-16', slot: 'repo', value: 'repo' },
	{
		label: t('configSteps.languagesTitle'),
		icon: 'i-heroicons-language',
		slot: 'languages',
		value: 'languages',
	},
	{ label: t('configSteps.apiKeyTitle'), icon: 'i-heroicons-key', slot: 'apiKey', value: 'apiKey' },
])

const validByValue = computed<Record<string, boolean>>(() => ({
	repo: repoValid.value,
	languages: languagesValid.value,
	apiKey: apiKeyValid.value,
}))

const missingSections = computed(() =>
	[
		{ valid: repoValid.value, label: t('configSteps.repoTitle') },
		{ valid: languagesValid.value, label: t('configSteps.languagesTitle') },
		{ valid: apiKeyValid.value, label: t('configSteps.apiKeyTitle') },
	]
		.filter((s) => !s.valid)
		.map((s) => s.label)
		.join(', ')
)

const onSave = () => {
	if (!save()) return
	toast.add({
		title: t('configForm.savedTitle'),
		description: t('configForm.savedDescription'),
		color: 'success',
	})
}

const onReset = () => {
	reset()
	toast.add({
		title: t('configForm.resetTitle'),
		description: t('configForm.resetDescription'),
		color: 'neutral',
	})
}
</script>

<template>
	<div
		class="g-shadow-md overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-white/10 dark:bg-slate-900"
	>
		<UTabs
			v-model="active"
			:items="tabs"
			variant="link"
			class="w-full"
			:ui="{ list: 'w-full', trigger: 'grow' }"
		>
			<template #trailing="{ item }">
				<UIcon
					v-if="validByValue[item.value]"
					name="i-heroicons-check-circle-solid"
					class="size-4 text-emerald-500"
				/>
				<span v-else class="size-2 rounded-full bg-amber-500" />
			</template>

			<template #repo>
				<div class="space-y-4 p-5">
					<p class="text-xs text-slate-500 dark:text-slate-400">
						{{ t('configForm.credentialsNote') }}
					</p>
					<RepoFields
						v-model:repo-url="form.repoUrl"
						v-model:translation-folder="form.translationFolder"
						v-model:github-token="form.githubToken"
						:repo-url-valid="repoUrlValid"
					/>
				</div>
			</template>

			<template #languages>
				<div class="p-5">
					<LanguagePicker v-model="form.targetLanguages" />
				</div>
			</template>

			<template #apiKey>
				<div class="p-5">
					<ApiKeyField v-model="form.geminiApiKey" />
				</div>
			</template>
		</UTabs>

		<USeparator />

		<div class="flex items-center justify-between gap-3 p-5">
			<div
				class="flex items-center gap-1.5 text-xs"
				:class="canSave ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'"
			>
				<UIcon
					:name="canSave ? 'i-heroicons-check-circle' : 'i-heroicons-exclamation-circle'"
					class="size-4"
				/>
				<span>{{
					canSave
						? t('configForm.complete')
						: t('configForm.incomplete', { sections: missingSections })
				}}</span>
			</div>
			<div class="flex items-center gap-3">
				<UButton :label="t('common.save')" :disabled="!canSave" @click="onSave" />
				<UButton
					:label="t('common.reset')"
					color="neutral"
					variant="ghost"
					@click="onReset"
				/>
			</div>
		</div>
	</div>
</template>
