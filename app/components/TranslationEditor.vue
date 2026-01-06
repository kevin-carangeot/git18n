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
			class="bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900 rounded-lg p-3 flex items-center justify-between"
		>
			<div class="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300">
				<UIcon name="i-octicon-git-branch-24" />
				<span class="font-medium">Base:</span>
				<span class="font-mono text-xs bg-white dark:bg-black/20 px-2 py-0.5 rounded">
					{{ baseBranch }}
				</span>
			</div>
			<div class="text-xs font-mono text-blue-600/70">
				Adding +{{ diffCount }} keys to {{ Object.keys(modelValue).length }} files
			</div>
		</div>

		<UTabs :items="tabs" class="w-full">
			<template #content-view="{ item }">
				<div
					class="p-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-b-lg rounded-tr-lg min-h-[400px] relative shadow-sm"
				>
					<div
						v-if="loadingStatus[item.code]"
						class="flex flex-col items-center justify-center h-64 text-gray-400 gap-3"
					>
						<UIcon
							name="i-heroicons-arrow-path"
							class="animate-spin w-10 h-10 text-primary-500"
						/>
						<div class="flex flex-col items-center">
							<span class="text-sm font-medium text-gray-900 dark:text-white"
								>Generating {{ item.label }}...</span
							>
						</div>
					</div>

					<div v-else class="h-full flex flex-col">
						<UTextarea
							:model-value="modelValue[item.code]"
							autoresize
							:rows="16"
							color="gray"
							variant="outline"
							class="font-mono text-xs w-full flex-1"
							placeholder="{ ... }"
							@update:model-value="(val) => updateTranslation(item.code, val)"
						/>

						<div
							class="flex justify-between items-center mt-3 pt-3 border-t border-gray-200 dark:border-gray-800"
						>
							<span class="text-[10px] text-gray-400 flex items-center gap-1">
								<UIcon name="i-heroicons-check-circle" class="text-green-500" />
								Valid JSON required
							</span>
							<UButton
								size="xs"
								color="gray"
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
