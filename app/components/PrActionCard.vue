<script setup lang="ts">
defineProps<{
	loading: boolean
}>()
const emit = defineEmits(['create'])
const { t } = useI18n()
</script>

<template>
	<div
		class="g-shadow-md mt-8 flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-6 dark:border-white/10 dark:bg-slate-900"
	>
		<div class="flex items-center gap-4">
			<div
				class="grid size-12 place-items-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10"
			>
				<UIcon name="i-heroicons-rocket-launch" class="size-6" />
			</div>
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
	</div>
</template>
