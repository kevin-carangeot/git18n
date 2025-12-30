<script setup lang="ts">
const config = useRuntimeConfig();
const selectedPull = ref('');
const { data: pulls, pending } = await useFetch('/api/pulls');
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
                        <a
                            :href="config.public.githubRepoUrl"
                            target="_blank"
                            class="font-mono text-sm font-medium text-primary-500 hover:text-primary-600 truncate transition-colors"
                        >
                            {{ config.public.githubRepoUrl ? config.public.githubRepoUrl.replace('https://github.com/', '') : 'Not configured' }}
                        </a>
                    </div>
                </div>
                <UButton
                    :to="config.public.githubRepoUrl"
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

        <div class="space-y-4">
            <UFormField
                label="Select your Pull Request"
                name="pulls"
            >
                <USelectMenu
                    id="pulls"
                    v-model="selectedPull"
                    :loading="pending"
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

            <UButton
                block
                size="xl"
                color="primary"
                icon="i-heroicons-rocket-launch"
                :loading="pending"
                :disabled="!selectedPull"
                class="cursor-pointer"
            >
                Launch translation
            </UButton>
        </div>

    </UContainer>
</template>