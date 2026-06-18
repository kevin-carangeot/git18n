<script setup lang="ts">
import { EMPTY_CONFIG, type GitConfig } from '~/types/config'

const { config, save, reset } = useGitConfig()
const toast = useToast()

const form = reactive<GitConfig>({ ...EMPTY_CONFIG, ...config.value })

const repoUrlValid = computed(() => /github\.com\/[^/]+\/[^/]+/.test(form.repoUrl))
const canSave = computed(
	() =>
		repoUrlValid.value &&
		form.translationFolder.trim() &&
		form.githubToken.trim() &&
		form.geminiApiKey.trim()
)

const onSave = () => {
	if (!canSave.value) return
	save({ ...form })
	toast.add({ title: 'Saved', description: 'Configuration stored locally.', color: 'success' })
}

const onReset = () => {
	reset()
	Object.assign(form, EMPTY_CONFIG)
	toast.add({ title: 'Reset', description: 'Configuration cleared.', color: 'neutral' })
}
</script>

<template>
	<UContainer class="max-w-[680px] py-16">
		<div class="mb-8">
			<h1 class="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
				Configuration
			</h1>
			<p class="mt-2 text-sm text-slate-500 dark:text-slate-400">
				Vos identifiants restent dans ce navigateur (localStorage) et sont envoyés au serveur
				uniquement le temps de chaque requête.
			</p>
		</div>

		<div class="space-y-5">
			<UFormField label="GitHub repository URL" required>
				<UInput
					v-model="form.repoUrl"
					placeholder="https://github.com/owner/repo"
					:color="form.repoUrl && !repoUrlValid ? 'error' : undefined"
					class="w-full"
				/>
			</UFormField>

			<UFormField label="Translation folder" required>
				<UInput v-model="form.translationFolder" placeholder="ui/src/lang/json/" class="w-full" />
			</UFormField>

			<UFormField label="GitHub token" required>
				<UInput v-model="form.githubToken" type="password" placeholder="ghp_…" class="w-full" />
			</UFormField>

			<UFormField label="Gemini API key" required>
				<UInput v-model="form.geminiApiKey" type="password" placeholder="AIza…" class="w-full" />
			</UFormField>

			<div class="flex items-center gap-3 pt-2">
				<UButton label="Save" :disabled="!canSave" @click="onSave" />
				<UButton label="Reset" color="neutral" variant="ghost" @click="onReset" />
			</div>
		</div>
	</UContainer>
</template>
