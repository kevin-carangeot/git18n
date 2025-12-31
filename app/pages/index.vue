<script setup lang="ts">
const config = useRuntimeConfig();
const toast = useToast();

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

const editableTranslations = ref<Record<string, string>>({});
const loadingStatus = ref<Record<string, boolean>>({});

watch(selectedPull, async (newBranch) => {
    if (!newBranch) return;

    fetchingDiff.value = true;
    diffData.value = null;

    editableTranslations.value = {};
    loadingStatus.value = {};

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
        console.error("Diff Error:", err);
        toast.add({ title: 'Error', description: 'Failed to fetch diff', color: 'red' });
    } finally {
        fetchingDiff.value = false;
    }
});

const startTranslation = async () => {
    if (!diffData.value || diffData.value?.count === 0) return;

    isTranslating.value = true;

    const languages = ((config.public.targetLanguages || []) as string[]).slice(0, 2);

    languages.forEach(lang => {
        loadingStatus.value[lang] = true;
        editableTranslations.value[lang] = '';
    });

    try {
        // Sequential loop to avoid API Rate Limits (429)
        for (const lang of languages) {

            // Small delay between requests to be safe with Free Tier
            if (languages.indexOf(lang) > 0) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }

            console.log(`🚀 Translating: ${lang}...`);

            try {
                const result = await $fetch('/api/translate', {
                    method: 'POST',
                    body: {
                        content: diffData.value?.diff,
                        targetLang: lang
                    }
                });

                editableTranslations.value[lang] = JSON.stringify(result, null, 4);

            } catch (e) {
                console.error(`Error translating ${lang}:`, e);
                editableTranslations.value[lang] = JSON.stringify({ error: "Translation failed or Quota exceeded" }, null, 4);
            } finally {
                loadingStatus.value[lang] = false;
            }
        }

        toast.add({ title: 'Success', description: 'All translations generated!', color: 'green' });

    } catch (error) {
        console.error("Global Error", error);
        toast.add({ title: 'Error', description: 'Technical issue', color: 'red' });
    } finally {
        isTranslating.value = false;
    }
};

const resultTabs = computed(() => {
    const langs = (config.public.targetLanguages || []) as string[];
    return langs.map(lang => ({
        label: lang.toUpperCase(),
        code: lang,
        slot: 'content-view'
    }));
});

const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.add({ title: 'Copied!', description: 'JSON copied to clipboard', icon: 'i-heroicons-clipboard-document-check', timeout: 2000 });
};
</script>

<template>
    <UContainer class="max-w-3xl py-4">

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
            <USeparator />
            <div class="p-4 flex items-center gap-3 min-w-0">
                <div class="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg shrink-0">
                    <UIcon name="i-octicon-git-pull-request-24" class="w-5 h-5 text-gray-500" />
                </div>
                <div class="flex flex-col w-full">
                    <span class="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Pull Request</span>
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
                </div>
            </div>
        </div>

        <div class="space-y-6">
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
                    description="This PR doesn't introduce any new translation keys."
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
                <span v-if="isTranslating">Translating into {{ config.public.targetLanguages.length }} languages...</span>
                <span v-else>Translate into {{ config.public.targetLanguages.length }} Languages</span>
            </UButton>

            <div v-if="Object.keys(editableTranslations).length > 0" class="mt-6 animate-fade-in">
                <div class="flex items-center justify-between mb-3">
                    <h3 class="text-sm font-bold text-gray-700 dark:text-gray-300">Generated Translations</h3>
                    <UBadge color="green" variant="subtle" size="xs">Editable</UBadge>
                </div>

                <UTabs :items="resultTabs" class="w-full">
                    <template #content-view="{ item }">
                        <div class="p-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-b-lg rounded-tr-lg min-h-[150px] relative">

                            <div v-if="loadingStatus[item.code]" class="flex flex-col items-center justify-center h-48 text-gray-400 gap-2">
                                <UIcon name="i-heroicons-arrow-path" class="animate-spin w-8 h-8 text-primary-500" />
                                <span class="text-xs font-medium">Generating {{ item.label }} translation...</span>
                            </div>

                            <div v-else>
                                <UTextarea
                                    :key="item.code"
                                    v-model="editableTranslations[item.code]"
                                    autoresize
                                    :rows="12"
                                    color="gray"
                                    variant="outline"
                                    class="font-mono text-xs w-full"
                                    placeholder="Translation content..."
                                />

                                <div class="flex justify-between items-center mt-3 pt-3 border-t border-gray-200 dark:border-gray-800">
                                    <span class="text-[10px] text-gray-400">JSON Format • Editable</span>
                                    <UButton
                                        size="xs"
                                        color="gray"
                                        variant="solid"
                                        icon="i-heroicons-clipboard-document"
                                        label="Copy JSON"
                                        @click="copyToClipboard(editableTranslations[item.code])"
                                    />
                                </div>
                            </div>

                        </div>
                    </template>
                </UTabs>
            </div>

        </div>
    </UContainer>
</template>