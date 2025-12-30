<script setup lang="ts">
const config = useRuntimeConfig();

const selectedPull = ref('');
const { data: pulls, pending: pendingPulls } = await useFetch('/api/pulls');

const diffData = ref<{
    diff: any;
    visualDiff: any;
    count: number;
    baseBranch: string
} | null>(null);

const fetchingDiff = ref(false);

const isTranslating = ref(false);
const translationResult = ref(null);

watch(selectedPull, async (newBranch) => {
    if (!newBranch) return;

    fetchingDiff.value = true;
    diffData.value = null;
    translationResult.value = null;

    try {
        const folder = config.public.githubTranslationFolder;
        const filePath = folder.endsWith('/') ? `${folder}en.json` : `${folder}/en.json`;

        diffData.value = await $fetch('/api/pr-diff', {
            query: {
                branch: newBranch,
                path: filePath
            }
        });

    } catch (err) {
        console.error("Error calculating diff:", err);
    } finally {
        fetchingDiff.value = false;
    }
});

const startTranslation = async () => {
    if (!diffData.value || diffData.value?.count === 0) return;

    isTranslating.value = true;
    try {
        const result = await $fetch('/api/translate', {
            method: 'POST',
            body: {
                content: diffData.value.diff
            }
        });

        translationResult.value = result;
        console.log("Translation complete:", result);

    } catch (error) {
        console.error("Translation error:", error);
    } finally {
        isTranslating.value = false;
    }
};
</script>

<template>
    <UContainer class="max-w-xl py-10">

        <div class="text-center mb-8">
            <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Git18n</h1>
            <p class="text-gray-500 text-sm mt-1">AI-powered automated translation tool</p>
        </div>

        <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm mb-8 overflow-hidden">
            <div class="p-4 flex items-center justify-between group">
                <div class="flex items-center gap-3 min-w-0">
                    <div class="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg shrink-0">
                        <UIcon name="i-simple-icons-github" class="w-5 h-5 text-gray-900 dark:text-white" />
                    </div>
                    <div class="flex flex-col min-w-0">
                        <span class="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Repository</span>
                        <a :href="config.public.githubRepoUrl" target="_blank"
                           class="font-mono text-sm font-medium text-primary-500 hover:text-primary-600 truncate transition-colors">
                            {{ config.public.githubRepoUrl ? config.public.githubRepoUrl.replace('https://github.com/', '') : 'Not configured' }}
                        </a>
                    </div>
                </div>
                <UButton :to="config.public.githubRepoUrl" target="_blank" icon="i-heroicons-arrow-top-right-on-square" size="xs" color="neutral" variant="ghost" />
            </div>
            <USeparator />
            <div class="p-4 flex items-center gap-3 min-w-0">
                <div class="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg shrink-0">
                    <UIcon name="i-heroicons-folder-open" class="w-5 h-5 text-gray-500" />
                </div>
                <div class="flex flex-col min-w-0">
                    <span class="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Target Path</span>
                    <code class="font-mono text-xs text-gray-600 dark:text-gray-300 truncate" :title="config.public.githubTranslationFolder">
                        /{{ config.public.githubTranslationFolder }}
                    </code>
                </div>
            </div>
        </div>

        <div class="space-y-6">
            <UFormField label="Pull Request" name="pulls">
                <USelectMenu
                    id="pulls"
                    v-model="selectedPull"
                    :loading="pendingPulls"
                    :items="pulls || []"
                    value-key="value"
                    searchable
                    placeholder="Select a source..."
                    icon="i-heroicons-magnifying-glass-20-solid"
                    class="w-full"
                >
                    <template #option="{ option }">
                        <span class="truncate">{{ option.label }}</span>
                    </template>
                </USelectMenu>
            </UFormField>

            <div v-if="fetchingDiff" class="text-sm text-gray-500 flex items-center gap-2 justify-center py-4">
                <UIcon name="i-heroicons-arrow-path" class="animate-spin w-5 h-5" />
                <span>Analysing diff with base branch...</span>
            </div>

            <div v-else-if="diffData">

                <UAlert
                    v-if="diffData.count === 0"
                    icon="i-heroicons-information-circle"
                    color="amber"
                    variant="subtle"
                    title="No changes detected"
                    description="This PR doesn't introduce any new translation keys in the source file compared to the base branch."
                />

                <div v-else class="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">

                    <div class="flex items-center justify-between mb-2">
                        <span class="text-xs font-bold text-primary-600 dark:text-primary-400 flex items-center gap-1">
                            <UIcon name="i-heroicons-plus-circle" /> New content detected
                        </span>
                        <span class="text-xs text-gray-500 font-mono bg-white dark:bg-gray-900 px-2 py-0.5 rounded border border-gray-200 dark:border-gray-700">
                            +{{ diffData.count }} keys
                        </span>
                    </div>

                    <div class="bg-white dark:bg-gray-950 p-3 rounded border border-gray-100 dark:border-gray-800 overflow-auto max-h-64">
                        <DiffViewer :data="diffData.visualDiff" />
                    </div>
                </div>
            </div>

            <UButton
                block
                size="xl"
                color="primary"
                icon="i-heroicons-sparkles"
                :loading="isTranslating"
                :disabled="!selectedPull || fetchingDiff || !diffData || diffData.count === 0"
                class="cursor-pointer"
                @click="startTranslation"
            >
                {{ isTranslating ? 'Translating via AI...' : 'Translate New Keys' }}
            </UButton>

            <div v-if="translationResult" class="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <h3 class="text-sm font-bold text-green-700 dark:text-green-400 mb-2">Translation Complete!</h3>
                <pre class="text-[10px] font-mono overflow-auto max-h-32">{{ translationResult }}</pre>
            </div>
        </div>

    </UContainer>
</template>