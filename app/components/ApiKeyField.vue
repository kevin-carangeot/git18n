<script setup lang="ts">
const geminiApiKey = defineModel<string>({ required: true })

const { t } = useI18n()
</script>

<template>
	<UFormField :label="t('configForm.geminiKeyLabel')" required>
		<UInput v-model="geminiApiKey" placeholder="AIza…" class="w-full" />
	</UFormField>
</template>
