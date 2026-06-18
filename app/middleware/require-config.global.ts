export default defineNuxtRouteMiddleware((to) => {
	if (to.path === '/settings') return
	const { isConfigured } = useGitConfig()
	if (!isConfigured.value) return navigateTo('/settings')
})
