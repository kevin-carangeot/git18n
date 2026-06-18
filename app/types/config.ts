export interface GitConfig {
	repoUrl: string
	translationFolder: string
	githubToken: string
	geminiApiKey: string
}

export const EMPTY_CONFIG: GitConfig = {
	repoUrl: '',
	translationFolder: '',
	githubToken: '',
	geminiApiKey: '',
}

export const CONFIG_STORAGE_KEY = 'git18n-config'
