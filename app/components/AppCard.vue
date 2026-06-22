<script setup lang="ts">
// Shared surface card. Extra classes (layout, padding) are merged via attrs.
</script>

<template>
	<div
		class="g-shadow-md overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-white/10 dark:bg-slate-900"
	>
		<slot />
	</div>
</template>
