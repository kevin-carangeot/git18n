<script setup lang="ts">
const repoUrl = defineModel<string>('repoUrl', { required: true })
const translationFolder = defineModel<string>('translationFolder', { required: true })
const githubToken = defineModel<string>('githubToken', { required: true })

defineProps<{ repoUrlValid: boolean }>()

const { t } = useI18n()
</script>

<template>
	<div class="space-y-4">
		<UFormField :label="t('configForm.repoUrlLabel')" required>
			<UInput
				v-model="repoUrl"
				placeholder="https://github.com/owner/repo"
				:color="repoUrl && !repoUrlValid ? 'error' : undefined"
				class="w-full"
			/>
		</UFormField>

		<UFormField :label="t('configForm.folderLabel')" required>
			<UInput v-model="translationFolder" placeholder="ui/src/lang/json/" class="w-full" />
		</UFormField>

		<UFormField :label="t('configForm.githubTokenLabel')" required>
			<UInput v-model="githubToken" placeholder="ghp_…" class="w-full" />
		</UFormField>
	</div>
</template>
