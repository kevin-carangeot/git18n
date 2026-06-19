<script setup lang="ts">
import { LANGUAGE_CATALOG, SOURCE_LANGUAGE } from '~/types/config'

const selected = defineModel<string[]>({ required: true })
const { t, locale } = useI18n()

const displayNames = computed(
	() => new Intl.DisplayNames([locale.value], { type: 'language' })
)
const nameOf = (code: string) => displayNames.value.of(code) ?? code

const isOn = (code: string) => selected.value.includes(code)

const toggle = (code: string) => {
	selected.value = isOn(code)
		? selected.value.filter((c) => c !== code)
		: [...selected.value, code]
}

const selectAll = () => {
	selected.value = LANGUAGE_CATALOG.map((l) => l.code)
}
const clearAll = () => {
	selected.value = []
}
</script>

<template>
	<div>
		<div class="mb-3 flex items-center justify-between">
			<span class="text-sm text-slate-500 dark:text-slate-400">
				{{ t('languagePicker.count', { count: selected.length }, selected.length) }}
			</span>
			<div class="flex gap-1.5">
				<UButton
					size="xs"
					color="neutral"
					variant="outline"
					:label="t('languagePicker.selectAll')"
					@click="selectAll"
				/>
				<UButton
					size="xs"
					color="neutral"
					variant="ghost"
					:label="t('languagePicker.clearAll')"
					@click="clearAll"
				/>
			</div>
		</div>

		<div
			class="grid gap-2.5"
			style="grid-template-columns: repeat(auto-fill, minmax(120px, 1fr))"
		>
			<!-- Source language: locked, always present -->
			<div
				class="relative flex flex-col items-center gap-1.5 rounded-xl border border-dashed border-slate-200 bg-white px-3 py-3.5 dark:border-white/10 dark:bg-slate-900"
			>
				<span
					class="absolute right-2 top-2 rounded-full bg-emerald-50 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-emerald-600 dark:bg-emerald-500/10"
				>
					{{ t('languagePicker.source') }}
				</span>
				<span class="text-2xl leading-none">{{ SOURCE_LANGUAGE.flag }}</span>
				<span class="text-sm font-medium text-slate-900 dark:text-white">
					{{ nameOf(SOURCE_LANGUAGE.code) }}
				</span>
				<span class="text-[10px] text-slate-400">
					{{ t('languagePicker.mandatory') }}
				</span>
			</div>

			<!-- Target languages: toggleable -->
			<button
				v-for="lang in LANGUAGE_CATALOG"
				:key="lang.code"
				type="button"
				class="relative flex cursor-pointer flex-col items-center gap-1.5 rounded-xl border bg-slate-50 px-3 py-3.5 transition dark:bg-white/5"
				:class="
					isOn(lang.code)
						? 'border-emerald-500 bg-white shadow-[0_0_0_3px_rgba(5,150,105,0.18)] dark:bg-slate-900'
						: 'border-slate-200 hover:border-slate-300 dark:border-white/10'
				"
				@click="toggle(lang.code)"
			>
				<span
					class="absolute right-2 top-2 grid size-5 place-items-center rounded-full border transition"
					:class="
						isOn(lang.code)
							? 'border-emerald-500 bg-emerald-500 text-white'
							: 'border-slate-200 bg-white dark:border-white/20 dark:bg-slate-800'
					"
				>
					<UIcon v-if="isOn(lang.code)" name="i-heroicons-check" class="size-3.5" />
				</span>
				<span class="text-2xl leading-none">{{ lang.flag }}</span>
				<span
					class="text-sm font-medium"
					:class="
						isOn(lang.code)
							? 'text-slate-900 dark:text-white'
							: 'text-slate-600 dark:text-slate-300'
					"
				>
					{{ nameOf(lang.code) }}
				</span>
				<span class="text-[10px] uppercase tracking-wide text-slate-400">
					{{ lang.code }}
				</span>
			</button>
		</div>

		<p class="mt-3 text-xs text-slate-500 dark:text-slate-400">
			{{ t('languagePicker.footnote') }}
		</p>
	</div>
</template>
