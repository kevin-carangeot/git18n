<script setup lang="ts">
const { locale, setLocale, t } = useI18n()

const repoUrl = 'https://github.com/kevin-carangeot/git18n'
const repoDisplay = repoUrl.replace('https://github.com/', '')

const toggleLocale = () => setLocale(locale.value === 'fr' ? 'en' : 'fr')
</script>

<template>
	<div class="relative min-h-screen">
		<div
			class="pointer-events-none fixed inset-0 -z-10"
			:style="{ background: 'var(--g-halo)' }"
		/>

		<header
			class="sticky top-0 z-20 border-b border-slate-200/80 bg-slate-50/70 backdrop-blur-md backdrop-saturate-150 dark:border-white/10 dark:bg-slate-950/60"
		>
			<div class="mx-auto flex max-w-[920px] items-center justify-between px-7 py-3.5">
				<NuxtLink to="/" class="flex items-center gap-2.5">
					<span
						class="grid size-[30px] place-items-center rounded-[9px] bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-sm ring-1 ring-inset ring-white/25"
					>
						<UIcon name="i-heroicons-language" class="size-4 text-white" />
					</span>
					<span
						class="text-base font-semibold tracking-tight text-slate-900 dark:text-white"
					>
						git<span class="text-emerald-700 dark:text-emerald-400">18n</span>
					</span>
				</NuxtLink>

				<div class="flex items-center gap-1.5">
					<a
						:href="repoUrl"
						target="_blank"
						class="hidden items-center gap-2 rounded-[9px] border border-slate-200 bg-white px-3 py-1.5 font-mono text-xs text-slate-500 transition hover:border-slate-300 hover:text-slate-900 sm:inline-flex dark:border-white/10 dark:bg-white/5 dark:text-slate-400"
					>
						<UIcon name="i-simple-icons-github" class="size-3.5" />
						{{ repoDisplay }}
					</a>
					<UButton
						color="neutral"
						variant="ghost"
						size="xs"
						class="cursor-pointer font-mono font-semibold"
						:aria-label="t('common.language')"
						@click="toggleLocale"
					>
						{{ locale.toUpperCase() }}
					</UButton>
					<UButton
						to="/settings"
						icon="i-heroicons-cog-6-tooth"
						color="neutral"
						variant="ghost"
						:aria-label="t('common.settings')"
					/>
				</div>
			</div>
		</header>

		<slot />
	</div>
</template>
