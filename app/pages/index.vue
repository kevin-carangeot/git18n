<script setup lang="ts">
const config = useRuntimeConfig();
const toast = useToast();

// --- STATE ---
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
const isCreatingPR = ref(false); // État de chargement pour la création de PR

const editableTranslations = ref<Record<string, string>>({});
const loadingStatus = ref<Record<string, boolean>>({});

// --- COMPUTED ---
const hasResults = computed(() => {
    return Object.keys(loadingStatus.value).length > 0;
});

const resultTabs = computed(() => {
    const langs = (config.public.targetLanguages || []) as string[];
    return langs.map(lang => ({
        label: lang.toUpperCase(),
        code: lang,
        slot: 'content-view'
    }));
});

// --- HELPER: Parse Owner/Repo from URL ---
const getRepoInfo = () => {
    const url = config.public.githubRepoUrl as string;
    const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (!match) return { owner: '', repo: '' };
    return { owner: match[1], repo: match[2].replace('.git', '') };
};

// --- ACTION: Fetch Diff when PR is selected ---
watch(selectedPull, async (newBranch) => {
    if (!newBranch) return;

    fetchingDiff.value = true;
    diffData.value = null;
    resetView();

    try {
        const folder = config.public.githubTranslationFolder;
        // Ensure path ends with slash or handle strictly
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

// --- ACTION: Start Translation (AI Generation) ---
const startTranslation = async () => {
    if (!diffData.value || diffData.value?.count === 0) return;

    isTranslating.value = true;
    const languages = (config.public.targetLanguages || []) as string[];

    // Initialize state
    languages.forEach(lang => {
        loadingStatus.value[lang] = true;
        editableTranslations.value[lang] = '';
    });

    try {
        for (const lang of languages) {
            // Simulation delay for UI effect
            if (languages.indexOf(lang) > 0) await new Promise(r => setTimeout(r, 500));

            // TODO: Call your real /api/translate here.
            // For now, using MOCK data based on the structure.

            let fakeResult = {};
            if (lang === 'fr') {
                fakeResult = { "COMMON": { "NEW_KEY": "Ceci est une nouvelle traduction" } };
            } else {
                fakeResult = { "COMMON": { "NEW_KEY": `Translation for ${lang}` } };
            }

            // Fill the textarea
            editableTranslations.value[lang] = JSON.stringify(fakeResult, null, 4);
            loadingStatus.value[lang] = false;
        }
        toast.add({ title: 'Success', description: 'All translations generated!', color: 'green' });

    } catch (error) {
        toast.add({ title: 'Error', description: 'Translation failed', color: 'red' });
    } finally {
        isTranslating.value = false;
    }
};

// --- ACTION: Create Pull Request (The Big Button) ---
const createPullRequest = async () => {
    isCreatingPR.value = true;

    // 1. Prepare and Validate Data
    const translationsPayload: Record<string, any> = {};
    const { owner, repo } = getRepoInfo();

    try {
        // Loop through textareas to parse JSON
        for (const [lang, contentStr] of Object.entries(editableTranslations.value)) {
            if (!contentStr.trim()) continue; // Skip empty
            try {
                translationsPayload[lang] = JSON.parse(contentStr);
            } catch (e) {
                throw new Error(`Invalid JSON in ${lang.toUpperCase()} tab. Please fix it.`);
            }
        }

        if (Object.keys(translationsPayload).length === 0) {
            throw new Error("No translations to save.");
        }

        // 2. Send to Backend
        const response = await $fetch('/api/create-pr', {
            method: 'POST',
            body: {
                owner,
                repo,
                baseBranch: diffData.value?.baseBranch || 'main',
                folderPath: config.public.githubTranslationFolder, // Pass the folder context
                translations: translationsPayload
            }
        });

        // 3. Success
        toast.add({
            title: 'Pull Request Created!',
            description: 'Opening GitHub...',
            color: 'green',
            icon: 'i-heroicons-check-badge',
            timeout: 5000,
            callback: () => window.open(response.url, '_blank')
        });

        // Optional: Auto open
        window.open(response.url, '_blank');

    } catch (err: any) {
        console.error(err);
        toast.add({ title: 'Failed', description: err.message || 'Could not create PR', color: 'red' });
    } finally {
        isCreatingPR.value = false;
    }
};

const resetView = () => {
    editableTranslations.value = {};
    loadingStatus.value = {};
};

const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.add({ title: 'Copied!', icon: 'i-heroicons-clipboard-document-check', timeout: 2000 });
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
                label="Back to Config"
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
                            <span class="font-mono text-sm font-medium text-primary-500 truncate">
                                {{ config.public.githubRepoUrl?.replace('https://github.com/', '') }}
                            </span>
                        </div>
                    </div>
                </div>
                <USeparator />
                <div class="p-4 flex items-center gap-3 min-w-0">
                    <div class="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg shrink-0">
                        <UIcon name="i-octicon-git-pull-request-24" class="w-5 h-5 text-gray-500" />
                    </div>
                    <div class="flex flex-col w-full">
                        <span class="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Source Pull Request</span>
                        <USelectMenu
                            v-model="selectedPull"
                            :loading="pendingPulls"
                            :items="pulls || []"
                            value-key="value"
                            searchable
                            placeholder="Select a PR to analyze..."
                            class="w-full mt-1"
                        />
                    </div>
                </div>
            </div>

            <div v-if="fetchingDiff" class="text-sm text-gray-500 flex items-center gap-2 justify-center py-10">
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
                        @click="startTranslation"
                    >
                        Generate Translations ({{ config.public.targetLanguages.length }} langs)
                    </UButton>
                </div>
            </div>
        </div>

        <div v-else class="animate-fade-in space-y-4">

            <div class="bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900 rounded-lg p-3 flex items-center justify-between">
                <div class="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300">
                    <UIcon name="i-octicon-git-branch-24" />
                    <span class="font-medium">Base:</span>
                    <span class="font-mono text-xs bg-white dark:bg-black/20 px-2 py-0.5 rounded">
                        {{ diffData?.baseBranch }}
                    </span>
                </div>
                <div class="text-xs font-mono text-blue-600/70">
                    Adding +{{ diffData?.count }} keys to {{ Object.keys(editableTranslations).length }} files
                </div>
            </div>

            <UTabs :items="resultTabs" class="w-full">
                <template #content-view="{ item }">
                    <div class="p-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-b-lg rounded-tr-lg min-h-[400px] relative shadow-sm">

                        <div v-if="loadingStatus[item.code]" class="flex flex-col items-center justify-center h-64 text-gray-400 gap-3">
                            <UIcon name="i-heroicons-arrow-path" class="animate-spin w-10 h-10 text-primary-500" />
                            <div class="flex flex-col items-center">
                                <span class="text-sm font-medium text-gray-900 dark:text-white">Generating {{ item.label }}...</span>
                            </div>
                        </div>

                        <div v-else class="h-full flex flex-col">
                            <UTextarea
                                :key="item.code"
                                v-model="editableTranslations[item.code]"
                                autoresize
                                :rows="16"
                                color="gray"
                                variant="outline"
                                class="font-mono text-xs w-full flex-1"
                                placeholder="{ ... }"
                            />

                            <div class="flex justify-between items-center mt-3 pt-3 border-t border-gray-200 dark:border-gray-800">
                                <span class="text-[10px] text-gray-400 flex items-center gap-1">
                                    <UIcon name="i-heroicons-check-circle" class="text-green-500"/>
                                    Valid JSON required
                                </span>
                                <UButton
                                    size="xs"
                                    color="gray"
                                    variant="ghost"
                                    icon="i-heroicons-clipboard-document"
                                    label="Copy"
                                    @click="copyToClipboard(editableTranslations[item.code])"
                                />
                            </div>
                        </div>
                    </div>
                </template>
            </UTabs>

            <div class="mt-8 p-6 bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm flex items-center justify-between">

                <div class="flex items-center gap-4">
                    <div class="p-3 bg-primary-50 dark:bg-primary-900/20 rounded-full text-primary-500">
                        <UIcon name="i-heroicons-rocket-launch" class="w-6 h-6" />
                    </div>

                    <div>
                        <h3 class="font-bold text-gray-900 dark:text-white text-lg">Ready to merge?</h3>
                        <p class="text-sm text-gray-500 dark:text-gray-400">
                            This will commit all changes to a new branch and open a PR.
                        </p>
                    </div>
                </div>

                <UButton
                    size="xl"
                    color="primary"
                    variant="solid"
                    :loading="isCreatingPR"
                    icon="i-octicon-git-pull-request-24"
                    class="shadow-md cursor-pointer"
                    @click="createPullRequest"
                >
                    Create Pull Request
                </UButton>
            </div>

        </div>

    </UContainer>
</template>