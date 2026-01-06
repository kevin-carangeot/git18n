<script setup lang="ts">
defineProps<{
    diffData: { count: number, visualDiff: any } | null
    fetching: boolean
    isTranslating: boolean
    targetLangsCount: number
}>()

const emit = defineEmits(['start-translation'])
</script>

<template>
    <div>
        <div v-if="fetching" class="text-sm text-gray-500 flex items-center gap-2 justify-center py-10">
            <UIcon name="i-heroicons-arrow-path" class="animate-spin w-6 h-6" />
            <span>Analysing translation keys...</span>
        </div>

        <div v-else-if="diffData">
            <UAlert
                v-if="diffData.count === 0"
                icon="i-heroicons-information-circle"
                color="amber"
                variant="subtle"
                title="No changes"
                description="This PR doesn't introduce any new keys in the source file."
            />

            <div v-else class="space-y-6">
                <div class="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-bold text-primary-600 dark:text-primary-400 flex items-center gap-1">
              <UIcon name="i-heroicons-plus-circle" /> Missing keys detected
            </span>
                        <span class="text-xs text-gray-500 font-mono bg-white dark:bg-gray-900 px-2 py-0.5 rounded border">
              +{{ diffData.count }} keys
            </span>
                    </div>
                    <div class="bg-white dark:bg-gray-950 p-3 rounded border border-gray-100 dark:border-gray-800 overflow-auto max-h-64">
                        <DiffViewer :data="diffData.visualDiff" />
                    </div>
                </div>

                <UButton
                    block
                    size="xl"
                    color="primary"
                    icon="i-heroicons-sparkles"
                    :loading="isTranslating"
                    class="cursor-pointer"
                    @click="emit('start-translation')"
                >
                    Generate Translations ({{ targetLangsCount }} langs)
                </UButton>
            </div>
        </div>
    </div>
</template>