<script setup lang="ts">
const { form, repoUrlValid, repoValid, languagesValid, apiKeyValid, canSave, save } =
	useConfigForm()
const toast = useToast()
const { t } = useI18n()

const steps = computed(() => [
	{ title: t('configSteps.repoTitle'), icon: 'i-octicon-mark-github-16', slot: 'repo' },
	{ title: t('configSteps.languagesTitle'), icon: 'i-heroicons-language', slot: 'languages' },
	{ title: t('configSteps.apiKeyTitle'), icon: 'i-heroicons-key', slot: 'apiKey' },
])

const currentStep = ref(0)
const stepValid = computed(() => [repoValid.value, languagesValid.value, apiKeyValid.value])
const currentValid = computed(() => stepValid.value[currentStep.value])
const isLast = computed(() => currentStep.value === steps.value.length - 1)

const next = () => {
	if (!currentValid.value) return
	if (currentStep.value < steps.value.length - 1) currentStep.value += 1
}
const prev = () => {
	if (currentStep.value > 0) currentStep.value -= 1
}

const onSave = () => {
	if (!save()) return
	toast.add({
		title: t('configForm.savedTitle'),
		description: t('configForm.savedDescription'),
		color: 'success',
	})
}
</script>

<template>
	<div
		class="g-shadow-md overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-white/10 dark:bg-slate-900"
	>
		<div class="p-5">
			<UStepper v-model="currentStep" :items="steps" linear>
				<template #repo>
					<div class="space-y-4">
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
					<LanguagePicker v-model="form.targetLanguages" />
				</template>

				<template #apiKey>
					<ApiKeyField v-model="form.geminiApiKey" />
				</template>
			</UStepper>
		</div>

		<USeparator />

		<div class="flex items-center justify-between gap-3 p-5">
			<UButton
				v-if="currentStep > 0"
				:label="t('common.previous')"
				color="neutral"
				variant="ghost"
				icon="i-heroicons-arrow-left"
				@click="prev"
			/>
			<span v-else />

			<UButton
				v-if="!isLast"
				:label="t('common.next')"
				trailing-icon="i-heroicons-arrow-right"
				:disabled="!currentValid"
				@click="next"
			/>
			<UButton v-else :label="t('common.save')" :disabled="!canSave" @click="onSave" />
		</div>
	</div>
</template>
