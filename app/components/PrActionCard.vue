<script setup lang="ts">
defineProps<{
  loading: boolean
}>()
const emit = defineEmits(['create'])
</script>

<template>
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
      :loading="loading"
      icon="i-octicon-git-pull-request-24"
      class="shadow-md cursor-pointer"
      @click="emit('create')"
    >
      Create Pull Request
    </UButton>
  </div>
</template>