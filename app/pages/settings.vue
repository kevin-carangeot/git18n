<script setup lang="ts"></script>

<template>
	<UContainer class="max-w-[680px] py-16">
		<div class="mb-8">
			<h1 class="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
				Configuration
			</h1>
			<p class="mt-2 text-sm text-slate-500 dark:text-slate-400">
				Vos identifiants restent dans ce navigateur (localStorage) et sont envoyés au serveur
				uniquement le temps de chaque requête.
			</p>
		</div>

		<ConfigForm />
	</UContainer>
</template>
