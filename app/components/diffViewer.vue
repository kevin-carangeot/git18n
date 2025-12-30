<script setup lang="ts">
import * as Diff from 'diff';

defineProps<{
    data: any
}>();

const computeDiffHtml = (oldText: string, newText: string) => {
    const diff = Diff.diffChars(String(oldText), String(newText));

    return diff.map(part => {
        if (part.added) return `<b class="text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30">${part.value}</b>`;
        if (part.removed) return '';
        return part.value;
    }).join('');
}
</script>

<template>
    <div class="font-mono text-[11px] leading-relaxed">
        <div v-for="(value, key) in data" :key="key" class="pl-4 border-l border-gray-100 dark:border-gray-800">

            <div v-if="typeof value === 'object' && !value.status">
                <span class="text-gray-400">"{{ key }}": {</span>
                <DiffViewer :data="value" />
                <span class="text-gray-400">},</span>
            </div>

            <div v-else-if="value.status === 'modified'" class="flex">
                <span class="text-blue-600 dark:text-blue-400 mr-2">"{{ key }}":</span>
                <span class="text-gray-600 dark:text-gray-300">"</span>
                <span v-html="computeDiffHtml(value.old, value.new)"></span>
                <span class="text-gray-600 dark:text-gray-300">",</span>
            </div>

            <div v-else-if="value.status === 'added'" class="bg-green-50/50 dark:bg-green-900/10 -ml-4 pl-4 border-l-2 border-green-500">
                <span class="text-green-700 dark:text-green-500 font-bold">"{{ key }}": "{{ value.val }}",</span>
            </div>

        </div>
    </div>
</template>