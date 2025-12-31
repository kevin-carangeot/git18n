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

// --- COMPUTED: Detects if we have results to switch interface ---
const hasResults = computed(() => {
    return Object.keys(loadingStatus.value).length > 0;
});

watch(selectedPull, async (newBranch) => {
    if (!newBranch) return;

    fetchingDiff.value = true;
    diffData.value = null;

    // Reset view when changing PR
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

    const languages = (config.public.targetLanguages || []) as string[];

    languages.forEach(lang => {
        loadingStatus.value[lang] = true;
        editableTranslations.value[lang] = '';
    });

    try {
        for (const lang of languages) {

            // Simulating network delay (1s)
            if (languages.indexOf(lang) > 0) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }

            console.log(`🚀 Translating (MOCK): ${lang}...`);

            // --- REAL API CALL (COMMENTED OUT FOR TESTING) ---
            /*
            const result = await $fetch('/api/translate', {
                method: 'POST',
                body: {
                    content: diffData.value?.diff,
                    targetLang: lang
                }
            });
            */

            // --- FAKE DATA INJECTION ---
            let fakeResult = {};

            if (lang === 'fr') {
                fakeResult = {
                    "COMMON": { "DATERANGEPICKER": { "PERIODS": { "ITEMS": { "last20": "20 derniers jours" } } } },
                    "DASHBOARD": { "EMPTY_STATE": { "MODAL": { "ADD_PRODUCT": { "MODULE_BUILT_FOR_PS": { "SUBMIT_MODAL": { "TITLE": "Soumettre un module Built for PrestaShop." } } } } } }
                };
            } else if (lang === 'es') {
                fakeResult = {
                    "COMMON": { "DATERANGEPICKER": { "PERIODS": { "ITEMS": { "last20": "Últimos 20 días" } } } },
                    "DASHBOARD": { "EMPTY_STATE": { "MODAL": { "ADD_PRODUCT": { "MODULE_BUILT_FOR_PS": { "SUBMIT_MODAL": { "TITLE": "Enviar un módulo \"Built for PrestaShop\"." } } } } } }
                };
            } else if (lang === 'de') {
                fakeResult = {
                    "COMMON": { "DATERANGEPICKER": { "PERIODS": { "ITEMS": { "last20": "Letzten 20 Tage" } } } },
                    "DASHBOARD": { "EMPTY_STATE": { "MODAL": { "ADD_PRODUCT": { "MODULE_BUILT_FOR_PS": { "SUBMIT_MODAL": { "TITLE": "Ein \"Built for PrestaShop\"-Modul einreichen." } } } } } }
                };
            } else {
                // Generic fallback for other languages
                fakeResult = {
                    "COMMON": { "TEST_KEY": `Translated content for ${lang.toUpperCase()}` }
                };
            }

            editableTranslations.value[lang] = JSON.stringify(fakeResult, null, 4);
            loadingStatus.value[lang] = false;
        }

        toast.add({ title: 'Success', description: 'All translations generated!', color: 'green' });

    } catch (error) {
        console.error("Global Error", error);
        toast.add({ title: 'Error', description: 'Technical issue', color: 'red' });
    } finally {
        isTranslating.value = false;
    }
};

const resetView = () => {
    editableTranslations.value = {};
    loadingStatus.value = {};
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
    <UContainer class="max-w-4xl py-6">

        <div class="flex items-center justify-between mb-6">
            <div class="flex items-center gap-2">
                <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Git18n</h1>
                <UBadge v-if="hasResults" color="primary" variant="subtle" size="xs">Editor Mode</UBadge>
            </div>


            <UButton
                v-if="hasResults"
                icon="i-heroicons-arrow-left"
                color="gray"
                variant="ghost"
                label="Back to Configuration"
                class="cursor-pointer"
                @click="resetView"
            />
        </div>

        <div v-if="!hasResults" class="space-y-6 animate-fade-in">

            <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden">
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

            <div v-if="fetchingDiff" class="text-sm text-gray-500 flex items-center gap-2 justify-center py-10">
                <UIcon name="i-heroicons-arrow-path" class="animate-spin w-6 h-6" />
                <span>Analysing diff...</span>
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

                <div v-else class="space-y-6">
                    <div class="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
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

                    <UButton
                        block
                        size="xl"
                        color="primary"
                        icon="i-heroicons-sparkles"
                        :loading="isTranslating"
                        class="cursor-pointer"
                        @click="startTranslation"
                    >
                        Translate into {{ config.public.targetLanguages.length }} Languages
                    </UButton>
                </div>
            </div>
        </div>


        <div v-else class="animate-fade-in space-y-4">

            <div class="bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900 rounded-lg p-3 flex items-center justify-between">
                <div class="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300">
                    <UIcon name="i-octicon-git-pull-request-24" />
                    <span class="font-medium">Working on:</span>
                    <span class="font-mono text-xs bg-white dark:bg-black/20 px-2 py-0.5 rounded">{{ pulls?.find(p => p.value === selectedPull)?.label || selectedPull }}</span>
                </div>
                <div class="text-xs font-mono text-blue-600/70">
                    +{{ diffData?.count }} keys found
                </div>
            </div>

            <UTabs :items="resultTabs" class="w-full">
                <template #content-view="{ item }">
                    <div class="p-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-b-lg rounded-tr-lg min-h-[400px] relative shadow-sm">

                        <div v-if="loadingStatus[item.code]" class="flex flex-col items-center justify-center h-64 text-gray-400 gap-3">
                            <UIcon name="i-heroicons-arrow-path" class="animate-spin w-10 h-10 text-primary-500" />
                            <div class="flex flex-col items-center">
                                <span class="text-sm font-medium text-gray-900 dark:text-white">Generating {{ item.label }}...</span>
                                <span class="text-xs">Please wait, AI is thinking.</span>
                            </div>
                        </div>

                        <div v-else class="h-full flex flex-col">
                            <UTextarea
                                :key="item.code"
                                v-model="editableTranslations[item.code]"
                                autoresize
                                :rows="20"
                                color="gray"
                                variant="outline"
                                class="font-mono text-xs w-full flex-1"
                                placeholder="Translation content..."
                            />

                            <div class="flex justify-between items-center mt-3 pt-3 border-t border-gray-200 dark:border-gray-800">
                                <span class="text-[10px] text-gray-400 flex items-center gap-1">
                                    <UIcon name="i-heroicons-check-circle" class="text-green-500"/>
                                    Editable JSON
                                </span>
                                <div class="flex gap-2">
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

                    </div>
                </template>
            </UTabs>
        </div>

    </UContainer>
</template>