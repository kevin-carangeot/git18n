import type { JsonObject } from '~~/shared/types/json'

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

/** Shape returned by `GET /api/pr-diff`, shared with the client. */
export interface PrDiffResult {
	baseBranch: string
	headBranch: string
	diff: Record<string, unknown>
	visualDiff: DiffTree
	count: number
	indentation: string | number
}

const isLeaf = (node: DiffLeaf | DiffTree): node is DiffLeaf => 'status' in node

const isObject = (value: unknown): value is JsonObject =>
	typeof value === 'object' && value !== null

/**
 * Deeply compares two objects and returns a tree of the keys from `current`
 * that are new or changed compared to `base`, each leaf tagged with its status.
 */
export const calculateDetailedDiff = (base: unknown, current: unknown): DiffTree => {
	if (!isObject(base) || !isObject(current)) return {}

	const diff: DiffTree = {}

	for (const key in current) {
		if (!Object.prototype.hasOwnProperty.call(base, key)) {
			// A whole nested group can be added at once: recurse so each leaf is
			// tagged 'added' individually, keeping the diff tree renderable.
			const val = current[key]
			diff[key] = isObject(val) ? calculateDetailedDiff({}, val) : { status: 'added', val }
		} else if (isObject(base[key]) && isObject(current[key])) {
			const nested = calculateDetailedDiff(base[key], current[key])
			if (Object.keys(nested).length > 0) diff[key] = nested
		} else if (base[key] !== current[key]) {
			diff[key] = { status: 'modified', old: base[key], new: current[key] }
		}
	}

	return diff
}

/** Reduces a diff tree to the plain values to translate (new value of each leaf). */
export const flattenDiffTree = (tree: DiffTree): JsonObject => {
	const out: JsonObject = {}
	for (const key in tree) {
		const node = tree[key]
		out[key] = isLeaf(node)
			? node.status === 'added'
				? node.val
				: node.new
			: flattenDiffTree(node)
	}
	return out
}

/** Counts the actual leaf values (strings/numbers), ignoring nested containers. */
export const countLeaves = (obj: unknown): number => {
	if (!isObject(obj)) return 1
	let count = 0
	for (const key in obj) {
		count += countLeaves(obj[key])
	}
	return count
}
