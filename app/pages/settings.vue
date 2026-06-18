<script setup lang="ts">
const { t } = useI18n()
</script>

<template>
	<UContainer class="max-w-[680px] py-16">
		<div class="mb-8">
			<h1 class="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
				{{ t('settings.title') }}
			</h1>
		</div>

		<ConfigForm />
	</UContainer>
</template>
