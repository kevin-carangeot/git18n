/**
 * deeply compares two objects and returns ONLY the keys
 * from 'current' that are different or new compared to 'base'.
 */
export const calculateJsonDiff = (base: any, current: any): any => {
  // If inputs are not objects (strings, null, undefined), return current
  if (typeof base !== 'object' || base === null || typeof current !== 'object' || current === null) {
    return current;
  }

  const diff: any = {};

  for (const key in current) {
    // 1. New Key: The key exists in Current but not in Base
    if (!Object.prototype.hasOwnProperty.call(base, key)) {
      diff[key] = current[key];
    }
    // 2. Both are Objects: Recursively check deeper
    else if (typeof base[key] === 'object' && typeof current[key] === 'object') {
      const nestedDiff = calculateJsonDiff(base[key], current[key]);
      // Only add to result if there are actual differences inside
      if (Object.keys(nestedDiff).length > 0) {
        diff[key] = nestedDiff;
      }
    }
    // 3. Value Changed: Key exists in both, but values differ
    else if (base[key] !== current[key]) {
      diff[key] = current[key];
    }
  }

  return diff;
};