<script setup lang="ts">
const props = defineProps<{
	tabs: { label: string; code: string; slot: string }[]
	loadingStatus: Record<string, boolean>
	modelValue: Record<string, string>
	diffCount: number
	baseBranch: string
}>()

const emit = defineEmits(['update:modelValue'])
const toast = useToast()

const updateTranslation = (lang: string, value: string) => {
	const newValue = { ...props.modelValue, [lang]: value }
	emit('update:modelValue', newValue)
}

const copyToClipboard = (content: string) => {
	navigator.clipboard.writeText(content)
	toast.add({ title: 'Copied!', icon: 'i-heroicons-clipboard-document-check', timeout: 2000 })
}
</script>

<template>
	<div class="space-y-4">
		<div
			class="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-white/10 dark:bg-white/5"
		>
			<div class="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
				<UIcon name="i-octicon-git-branch-24" class="text-emerald-600" />
				<span class="font-medium">Base:</span>
				<span class="rounded bg-white px-2 py-0.5 font-mono text-xs dark:bg-black/20">{{
					baseBranch
				}}</span>
			</div>
			<div class="font-mono text-xs text-slate-400">
				Adding +{{ diffCount }} keys to {{ Object.keys(modelValue).length }} files
			</div>
		</div>

		<UTabs :items="tabs" class="w-full">
			<template #content-view="{ item }">
				<div
					class="g-shadow-md relative min-h-100 rounded-xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-slate-900"
				>
					<div
						v-if="loadingStatus[item.code]"
						class="flex h-64 flex-col items-center justify-center gap-4"
					>
						<div class="w-full max-w-md space-y-2.5">
							<div
								class="h-3 w-1/3 animate-pulse rounded bg-slate-200 dark:bg-white/10"
							/>
							<div
								class="h-3 w-2/3 animate-pulse rounded bg-slate-200 dark:bg-white/10"
							/>
							<div
								class="h-3 w-1/2 animate-pulse rounded bg-slate-200 dark:bg-white/10"
							/>
							<div
								class="h-3 w-3/5 animate-pulse rounded bg-slate-200 dark:bg-white/10"
							/>
						</div>
						<span class="flex items-center gap-2 text-sm font-medium text-slate-500">
							<UIcon name="i-heroicons-sparkles" class="size-4 text-emerald-500" />
							Generating {{ item.label }}...
						</span>
					</div>

					<div v-else class="flex h-full flex-col">
						<UTextarea
							:model-value="modelValue[item.code]"
							autoresize
							:rows="16"
							color="neutral"
							variant="outline"
							class="w-full flex-1 font-mono text-xs"
							placeholder="{ ... }"
							@update:model-value="(val) => updateTranslation(item.code, val)"
						/>
						<div
							class="mt-3 flex items-center justify-between border-t border-slate-200 pt-3 dark:border-white/10"
						>
							<span class="flex items-center gap-1 text-[10px] text-slate-400">
								<UIcon name="i-heroicons-check-circle" class="text-emerald-500" />
								Valid JSON required
							</span>
							<UButton
								size="xs"
								color="neutral"
								variant="ghost"
								icon="i-heroicons-clipboard-document"
								label="Copy"
								@click="copyToClipboard(modelValue[item.code])"
							/>
						</div>
					</div>
				</div>
			</template>
		</UTabs>
	</div>
</template>
