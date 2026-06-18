<script setup lang="ts">
const props = defineProps<{
	repoUrl: string
	pulls: Record<string, unknown>[]
	pending: boolean
	modelValue: string
}>()

const emit = defineEmits(['update:modelValue'])
const { t } = useI18n()

const repoDisplay = computed(() => {
	return props.repoUrl
		? props.repoUrl.replace('https://github.com/', '')
		: t('configSelector.notConfigured')
})
</script>

<template>
	<div
		class="g-shadow-md overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-white/10 dark:bg-slate-900"
	>
		<div class="flex items-center gap-3.5 p-[18px_20px]">
			<div
				class="grid size-10 flex-none place-items-center rounded-xl bg-slate-100 text-slate-500 dark:bg-white/5"
			>
				<UIcon name="i-simple-icons-github" class="size-[18px]" />
			</div>
			<div class="flex min-w-0 flex-1 flex-col gap-0.5">
				<span class="text-[10.5px] font-bold uppercase tracking-[0.08em] text-slate-400">{{
						t('configSelector.repository')
					}}</span>
				<a
					:href="repoUrl"
					target="_blank"
					class="truncate font-mono text-[13.5px] font-medium text-emerald-700 transition-colors hover:text-emerald-800 dark:text-emerald-400"
				>
					{{ repoDisplay }}
				</a>
			</div>
			<UButton
				:to="repoUrl"
				target="_blank"
				icon="i-heroicons-arrow-top-right-on-square"
				size="xs"
				color="neutral"
				variant="ghost"
			/>
		</div>

		<USeparator />

		<div class="flex items-center gap-3.5 p-[18px_20px]">
			<div
				class="grid size-10 flex-none place-items-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10"
			>
				<UIcon name="i-octicon-git-pull-request-24" class="size-[18px]" />
			</div>
			<div class="flex w-full flex-col gap-1">
				<span class="text-[10.5px] font-bold uppercase tracking-[0.08em] text-slate-400">{{
						t('configSelector.sourcePr')
					}}</span>
				<USelectMenu
					:model-value="modelValue"
					:loading="pending"
					:items="pulls || []"
					value-key="value"
					searchable
					:placeholder="t('configSelector.selectPlaceholder')"
					class="w-full"
					@update:model-value="emit('update:modelValue', $event)"
				/>
			</div>
		</div>
	</div>
</template>
