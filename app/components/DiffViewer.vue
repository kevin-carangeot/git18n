<script setup lang="ts">
import * as Diff from 'diff'
import type { DiffTree } from '~~/server/utils/diff'

defineProps<{
	data: DiffTree
}>()

type DiffSegment = { value: string; type: 'added' | 'removed' | 'common' }

const computeDiffParts = (oldText: unknown, newText: unknown): DiffSegment[] =>
	Diff.diffWordsWithSpace(String(oldText), String(newText)).map((part) => ({
		value: part.value,
		type: part.added ? 'added' : part.removed ? 'removed' : 'common',
	}))
</script>

<template>
	<div class="font-mono text-[13px] leading-7 whitespace-pre">
		<div v-for="(value, key) in data" :key="key">
			<div
				v-if="typeof value === 'object' && !value.status"
				class="pl-4 border-l border-gray-200 dark:border-gray-800"
			>
				<span class="text-slate-700 dark:text-slate-300">"{{ key }}"</span>: {
				<DiffViewer :data="value" />
				<span class="text-gray-400">},</span>
			</div>

			<div
				v-else-if="value.status === 'modified'"
				class="pl-4 border-l-2 border-emerald-400 bg-emerald-50/40 dark:bg-emerald-900/10 py-1"
			>
				<span class="text-emerald-700 dark:text-emerald-400">"{{ key }}"</span>:
				<span class="text-gray-600 dark:text-gray-400">"</span>
				<span>
					<template
						v-for="(part, i) in computeDiffParts(value.old, value.new)"
						:key="i"
					>
						<span
							v-if="part.type === 'added'"
							class="text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/40 font-bold px-1 rounded-sm"
							>{{ part.value }}</span
						>
						<span
							v-else-if="part.type === 'removed'"
							class="text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/20 line-through decoration-red-500/50 opacity-70 mx-1"
							>{{ part.value }}</span
						>
						<template v-else>{{ part.value }}</template>
					</template>
				</span>
				<span class="text-gray-600 dark:text-gray-400">",</span>
			</div>

			<div
				v-else-if="value.status === 'added'"
				class="pl-4 border-l-2 border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/10 py-1"
			>
				<span class="text-emerald-700 dark:text-emerald-400 font-bold">"{{ key }}"</span>:
				<span class="text-emerald-600">"{{ value.val }}",</span>
			</div>

			<div v-else class="pl-4 border-l border-gray-200 dark:border-gray-800 text-gray-500">
				"{{ key }}": "{{ value }}",
			</div>
		</div>
	</div>
</template>
