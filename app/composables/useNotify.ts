interface NotifyOptions {
	description?: string
	icon?: string
	duration?: number
}

// Thin wrapper over useToast for the three colors used across the app.
export const useNotify = () => {
	const toast = useToast()

	return {
		success: (title: string, opts?: NotifyOptions) =>
			toast.add({ title, color: 'success', ...opts }),
		error: (title: string, opts?: NotifyOptions) =>
			toast.add({ title, color: 'error', ...opts }),
		info: (title: string, opts?: NotifyOptions) =>
			toast.add({ title, color: 'neutral', ...opts }),
	}
}
