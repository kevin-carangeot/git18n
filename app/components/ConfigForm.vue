<script setup lang="ts">
import { EMPTY_CONFIG, type GitConfig } from '~/types/config'

const emit = defineEmits<{ saved: [] }>()

const { config, save, reset } = useGitConfig()
const toast = useToast()
const { t } = useI18n()

const form = reactive<GitConfig>({ ...EMPTY_CONFIG, ...config.value })

const repoUrlValid = computed(() => /github\.com\/[^/]+\/[^/]+/.test(form.repoUrl))
const canSave = computed(
	() =>
		repoUrlValid.value &&
		Boolean(form.translationFolder.trim()) &&
		Boolean(form.githubToken.trim()) &&
		Boolean(form.geminiApiKey.trim())
)

const onSave = () => {
	if (!canSave.value) return
	save({ ...form })
	toast.add({
		title: t('configForm.savedTitle'),
		description: t('configForm.savedDescription'),
		color: 'success',
	})
	emit('saved')
}

const onReset = () => {
	reset()
	Object.assign(form, EMPTY_CONFIG)
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
		<div class="flex items-center gap-3.5 p-[18px_20px]">
			<div
				class="grid size-10 flex-none place-items-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10"
			>
				<UIcon name="i-heroicons-key" class="size-[18px]" />
			</div>
			<div class="flex min-w-0 flex-1 flex-col gap-0.5">
				<span class="text-[10.5px] font-bold uppercase tracking-[0.08em] text-slate-400">
					{{ t('configForm.sectionLabel') }}
				</span>
				<span class="text-[13.5px] font-medium text-slate-700 dark:text-slate-200">
					{{ t('configForm.sectionHint') }}
				</span>
			</div>
		</div>

		<USeparator />

		<div class="space-y-4 p-5">
			<p class="text-xs text-slate-500 dark:text-slate-400">
				{{ t('configForm.credentialsNote') }}
			</p>

			<UFormField :label="t('configForm.repoUrlLabel')" required>
				<UInput
					v-model="form.repoUrl"
					placeholder="https://github.com/owner/repo"
					:color="form.repoUrl && !repoUrlValid ? 'error' : undefined"
					class="w-full"
				/>
			</UFormField>

			<UFormField :label="t('configForm.folderLabel')" required>
				<UInput
					v-model="form.translationFolder"
					placeholder="ui/src/lang/json/"
					class="w-full"
				/>
			</UFormField>

			<UFormField :label="t('configForm.githubTokenLabel')" required>
				<UInput v-model="form.githubToken" placeholder="ghp_…" class="w-full" />
			</UFormField>

			<UFormField :label="t('configForm.geminiKeyLabel')" required>
				<UInput v-model="form.geminiApiKey" placeholder="AIza…" class="w-full" />
			</UFormField>

			<div class="flex items-center gap-3 pt-1">
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
