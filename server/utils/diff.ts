type JsonObject = Record<string, unknown>

export interface DiffAdded {
	status: 'added'
	val: unknown
}

export interface DiffModified {
	status: 'modified'
	old: unknown
	new: unknown
}

export type DiffLeaf = DiffAdded | DiffModified

export interface DiffTree {
	[key: string]: DiffLeaf | DiffTree
}

/**
 * deeply compares two objects and returns ONLY the keys
 * from 'current' that are different or new compared to 'base'.
 */
export const calculateJsonDiff = (base: unknown, current: unknown): unknown => {
	// If inputs are not objects (strings, null, undefined), return current
	if (
		typeof base !== 'object' ||
		base === null ||
		typeof current !== 'object' ||
		current === null
	) {
		return current
	}

	const baseObj = base as JsonObject
	const currentObj = current as JsonObject
	const diff: JsonObject = {}

	for (const key in currentObj) {
		if (!Object.prototype.hasOwnProperty.call(baseObj, key)) {
			diff[key] = currentObj[key]
		} else if (typeof baseObj[key] === 'object' && typeof currentObj[key] === 'object') {
			const nestedDiff = calculateJsonDiff(baseObj[key], currentObj[key])
			// We assume nestedDiff is an object here because of the recursive call structure
			if (nestedDiff && Object.keys(nestedDiff as JsonObject).length > 0) {
				diff[key] = nestedDiff
			}
		} else if (baseObj[key] !== currentObj[key]) {
			diff[key] = currentObj[key]
		}
	}

	return diff
}

export const calculateDetailedDiff = (base: unknown, current: unknown): DiffTree => {
	// If inputs are not objects, we can't generate a detailed diff tree, return empty
	if (
		typeof base !== 'object' ||
		base === null ||
		typeof current !== 'object' ||
		current === null
	) {
		return {}
	}

	const baseObj = base as JsonObject
	const currentObj = current as JsonObject
	const diff: DiffTree = {}

	for (const key in currentObj) {
		// CASE 1 : New key
		if (!Object.prototype.hasOwnProperty.call(baseObj, key)) {
			diff[key] = { status: 'added', val: currentObj[key] }
		}
		// CASE 2 : Folder
		else if (typeof baseObj[key] === 'object' && typeof currentObj[key] === 'object') {
			const nested = calculateDetailedDiff(baseObj[key], currentObj[key])
			if (Object.keys(nested).length > 0) diff[key] = nested
		}
		// CASE 3 : Update key
		else if (baseObj[key] !== currentObj[key]) {
			diff[key] = {
				status: 'modified',
				old: baseObj[key],
				new: currentObj[key],
			}
		}
	}
	return diff
}
