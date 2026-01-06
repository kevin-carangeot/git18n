<script setup lang="ts">
import * as Diff from 'diff'

defineProps<{
	data: Record<string, unknown>[]
}>()

const computeDiffHtml = (oldText: string, newText: string) => {
	const diff = Diff.diffWordsWithSpace(String(oldText), String(newText))

	return diff
		.map((part) => {
			if (part.added) {
				return `<span class="text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/40 font-bold px-1 rounded-sm">${part.value}</span>`
			}
			if (part.removed) {
				return `<span class="text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/20 line-through decoration-red-500/50 opacity-70 mx-1">${part.value}</span>`
			}
			return part.value
		})
		.join('')
}
</script>

<template>
	<div class="font-mono text-[13px] leading-7 whitespace-pre">
		<div v-for="(value, key) in data" :key="key">
			<div
				v-if="typeof value === 'object' && !value.status"
				class="pl-4 border-l border-gray-200 dark:border-gray-800"
			>
				<span class="text-purple-600 dark:text-purple-400">"{{ key }}"</span>: {
				<DiffViewer :data="value" />
				<span class="text-gray-400">},</span>
			</div>

			<div
				v-else-if="value.status === 'modified'"
				class="pl-4 border-l-2 border-blue-400 bg-blue-50/50 dark:bg-blue-900/10 py-1"
			>
				<span class="text-blue-600 dark:text-blue-400">"{{ key }}"</span>:
				<span class="text-gray-600 dark:text-gray-400">"</span>
				<span v-html="computeDiffHtml(value.old, value.new)" />
				<span class="text-gray-600 dark:text-gray-400">",</span>
			</div>

			<div
				v-else-if="value.status === 'added'"
				class="pl-4 border-l-2 border-green-500 bg-green-50/50 dark:bg-green-900/10 py-1"
			>
				<span class="text-green-700 dark:text-green-500 font-bold">"{{ key }}"</span>:
				<span class="text-green-600">"{{ value.val }}",</span>
			</div>

			<div v-else class="pl-4 border-l border-gray-200 dark:border-gray-800 text-gray-500">
				"{{ key }}": "{{ value }}",
			</div>
		</div>
	</div>
</template>
