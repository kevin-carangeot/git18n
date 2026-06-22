<script setup lang="ts">
import type { PrDiffResult } from '~~/server/utils/diff'

defineProps<{
	diffData: Pick<PrDiffResult, 'count' | 'visualDiff'> | null
	fetching: boolean
	isTranslating: boolean
	targetLangsCount: number
}>()

const emit = defineEmits(['start-translation'])
const { t } = useI18n()
</script>

<template>
	<div>
		<div
			v-if="fetching"
			class="flex items-center justify-center gap-2 py-10 text-sm text-slate-500"
		>
			<UIcon name="i-heroicons-arrow-path" class="size-6 animate-spin text-emerald-500" />
			<span>{{ t('diffReview.analysing') }}</span>
		</div>

		<div v-else-if="diffData">
			<div
				v-if="diffData.count === 0"
				class="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white/50 py-14 text-center dark:border-white/10 dark:bg-white/5"
			>
				<UIcon name="i-heroicons-check-circle" class="mb-3 size-9 text-emerald-500" />
				<p class="text-sm font-medium text-slate-900 dark:text-white">
					{{ t('diffReview.noKeysTitle') }}
				</p>
				<p class="mt-1 text-sm text-slate-500">
					{{ t('diffReview.noKeysDescription') }}
				</p>
			</div>

			<div v-else class="space-y-5">
				<div
					class="g-shadow-md overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-white/10 dark:bg-slate-900"
				>
					<div
						class="flex items-center justify-between border-b border-slate-200 bg-slate-50/60 px-4.5 py-3 dark:border-white/10 dark:bg-white/5"
					>
						<span
							class="flex items-center gap-2 text-[13px] font-semibold text-slate-900 dark:text-white"
						>
							<UIcon name="i-heroicons-plus-circle" class="text-emerald-600" />
							{{ t('diffReview.missingKeys') }}
						</span>
						<span
							class="rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 font-mono text-xs font-semibold text-emerald-700 dark:border-emerald-500/25 dark:bg-emerald-500/10 dark:text-emerald-400"
						>
							{{ t('diffReview.keysBadge', { count: diffData.count }) }}
						</span>
					</div>
					<div class="max-h-64 overflow-auto p-4">
						<DiffViewer :data="diffData.visualDiff" />
					</div>
				</div>

				<UButton
					block
					size="xl"
					color="primary"
					icon="i-heroicons-sparkles"
					:loading="isTranslating"
					class="g-shadow-lg cursor-pointer bg-linear-to-r from-emerald-500 to-emerald-700 font-semibold"
					@click="emit('start-translation')"
				>
					{{ t('diffReview.generate', { count: targetLangsCount }) }}
				</UButton>
			</div>
		</div>
	</div>
</template>
