<script setup lang="ts">
const props = defineProps<{
	repoUrl: string
	pulls: Record<string, unknown>[]
	pending: boolean
	modelValue: string
}>()

const emit = defineEmits(['update:modelValue'])

const repoDisplay = computed(() => {
	return props.repoUrl ? props.repoUrl.replace('https://github.com/', '') : 'Not configured'
})
</script>

<template>
	<div
		class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden"
	>
		<div class="p-4 flex items-center justify-between group">
			<div class="flex items-center gap-3 min-w-0">
				<div class="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg shrink-0">
					<UIcon
						name="i-simple-icons-github"
						class="w-5 h-5 text-gray-900 dark:text-white"
					/>
				</div>
				<div class="flex flex-col min-w-0">
					<span class="text-[10px] uppercase font-bold text-gray-400 tracking-wider"
						>Repository</span
					>
					<a
						:href="repoUrl"
						target="_blank"
						class="font-mono text-sm font-medium text-primary-500 hover:text-primary-600 truncate transition-colors"
					>
						{{ repoDisplay }}
					</a>
				</div>
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

		<div class="p-4 flex items-center gap-3 min-w-0">
			<div class="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg shrink-0">
				<UIcon name="i-octicon-git-pull-request-24" class="w-5 h-5 text-gray-500" />
			</div>
			<div class="flex flex-col w-full">
				<span class="text-[10px] uppercase font-bold text-gray-400 tracking-wider"
					>Source Pull Request</span
				>
				<USelectMenu
					:model-value="modelValue"
					:loading="pending"
					:items="pulls || []"
					value-key="value"
					searchable
					placeholder="Select a PR to analyze..."
					class="w-full mt-1"
					@update:model-value="emit('update:modelValue', $event)"
				/>
			</div>
		</div>
	</div>
</template>
