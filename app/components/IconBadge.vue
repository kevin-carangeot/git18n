<script setup lang="ts">
withDefaults(
	defineProps<{
		icon: string
		color?: 'emerald' | 'neutral'
		size?: 'sm' | 'md' | 'lg'
		circle?: boolean
	}>(),
	{ color: 'emerald', size: 'sm', circle: false }
)

const box: Record<string, string> = { sm: 'size-10', md: 'size-11', lg: 'size-12' }
const iconSize: Record<string, string> = { sm: 'size-4.5', md: 'size-5', lg: 'size-6' }
const palette: Record<string, string> = {
	emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
	neutral: 'bg-slate-100 text-slate-500 dark:bg-white/5',
}
</script>

<template>
	<span
		class="grid flex-none place-items-center"
		:class="[box[size], palette[color], circle ? 'rounded-full' : 'rounded-xl']"
	>
		<UIcon :name="icon" :class="iconSize[size]" />
	</span>
</template>
