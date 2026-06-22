<script setup lang="ts">
defineProps<{
	loading: boolean
}>()
const emit = defineEmits(['create'])
const { t } = useI18n()
</script>

<template>
	<AppCard class="mt-8 flex items-center justify-between p-6">
		<div class="flex items-center gap-4">
			<IconBadge icon="i-heroicons-rocket-launch" size="lg" circle />
			<div>
				<h3 class="text-lg font-semibold text-slate-900 dark:text-white">
					{{ t('prAction.title') }}
				</h3>
				<p class="text-sm text-slate-500 dark:text-slate-400">
					{{ t('prAction.description') }}
				</p>
			</div>
		</div>

		<UButton
			size="xl"
			color="primary"
			variant="solid"
			:loading="loading"
			icon="i-octicon-git-pull-request-24"
			class="g-shadow-lg shrink-0 cursor-pointer whitespace-nowrap bg-linear-to-r from-emerald-500 to-emerald-700"
			@click="emit('create')"
		>
			{{ t('prAction.create') }}
		</UButton>
	</AppCard>
</template>
