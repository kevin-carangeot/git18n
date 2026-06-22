interface ConfigSection {
	key: string
	slot: string
	icon: string
	title: string
	headline: string
	valid: boolean
}

// Single source of truth for the three configuration sections plus the
// save/reset feedback, shared by ConfigForm (tabs) and ConfigWizard (stepper).
export const useConfigSteps = () => {
	const cfg = useConfigForm()
	const { t } = useI18n()
	const notify = useNotify()

	const sections = computed<ConfigSection[]>(() => [
		{
			key: 'repo',
			slot: 'repo',
			icon: 'i-octicon-mark-github-16',
			title: t('configSteps.repoTitle'),
			headline: t('configSteps.repoHeadline'),
			valid: cfg.repoValid.value,
		},
		{
			key: 'languages',
			slot: 'languages',
			icon: 'i-heroicons-language',
			title: t('configSteps.languagesTitle'),
			headline: t('configSteps.languagesHeadline'),
			valid: cfg.languagesValid.value,
		},
		{
			key: 'apiKey',
			slot: 'apiKey',
			icon: 'i-heroicons-key',
			title: t('configSteps.apiKeyTitle'),
			headline: t('configSteps.apiKeyHeadline'),
			valid: cfg.apiKeyValid.value,
		},
	])

	const onSave = (): boolean => {
		if (!cfg.save()) return false
		notify.success(t('configForm.savedTitle'), {
			description: t('configForm.savedDescription'),
		})
		return true
	}

	const onReset = () => {
		cfg.reset()
		notify.info(t('configForm.resetTitle'), { description: t('configForm.resetDescription') })
	}

	return { ...cfg, sections, onSave, onReset }
}
