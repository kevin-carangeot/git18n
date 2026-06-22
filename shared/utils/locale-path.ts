/** Strips a trailing slash from the configured folder, falling back to `locales`. */
export const cleanFolder = (folder: string): string => folder.replace(/\/$/, '') || 'locales'

/** Builds the path of a locale file (e.g. `ui/lang/fr.json`) from the folder + code. */
export const localeFilePath = (folder: string, locale: string): string =>
	`${cleanFolder(folder)}/${locale}.json`
