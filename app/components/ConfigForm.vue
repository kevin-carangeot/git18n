<script setup lang="ts">
const { form, repoUrlValid, sections, canSave, onSave, onReset } = useConfigSteps()
const { t } = useI18n()

const active = ref('repo')

const tabs = computed(() =>
	sections.value.map((s) => ({ label: s.title, icon: s.icon, slot: s.slot, value: s.key }))
)

const validByValue = computed<Record<string, boolean>>(() =>
	Object.fromEntries(sections.value.map((s) => [s.key, s.valid]))
)

const missingSections = computed(() =>
	sections.value
		.filter((s) => !s.valid)
		.map((s) => s.title)
		.join(', ')
)
</script>

<template>
	<AppCard>
		<UTabs
			v-model="active"
			:items="tabs"
			variant="link"
			class="w-full"
			:ui="{ list: 'w-full', trigger: 'grow py-3.5' }"
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
				:class="
					canSave
						? 'text-emerald-600 dark:text-emerald-400'
						: 'text-amber-600 dark:text-amber-400'
				"
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
			<div class="flex items-center gap-2">
				<UButton
					:label="t('common.reset')"
					icon="i-heroicons-arrow-path"
					color="neutral"
					variant="ghost"
					size="md"
					class="rounded-lg font-medium"
					@click="onReset"
				/>
				<UButton
					:label="t('common.save')"
					icon="i-heroicons-check"
					:disabled="!canSave"
					size="md"
					class="rounded-lg px-4 font-semibold shadow-sm transition enabled:hover:shadow-md enabled:hover:shadow-emerald-500/20"
					@click="onSave"
				/>
			</div>
		</div>
	</AppCard>
</template>
