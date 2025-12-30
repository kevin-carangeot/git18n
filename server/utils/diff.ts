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
    if (!Object.prototype.hasOwnProperty.call(base, key)) {
      diff[key] = current[key];
    } else if (typeof base[key] === 'object' && typeof current[key] === 'object') {
      const nestedDiff = calculateJsonDiff(base[key], current[key]);
      if (Object.keys(nestedDiff).length > 0) diff[key] = nestedDiff;
    } else if (base[key] !== current[key]) {
      diff[key] = current[key];
    }
  }

  return diff;
};

export const calculateDetailedDiff = (base: any, current: any): any => {
  const diff: any = {};

  for (const key in current) {
    // CASE 1 : New key
    if (!Object.prototype.hasOwnProperty.call(base, key)) {
      diff[key] = { status: 'added', val: current[key] };
    }
    // CASE 2 : Folder
    else if (typeof base[key] === 'object' && typeof current[key] === 'object') {
      const nested = calculateDetailedDiff(base[key], current[key]);
      if (Object.keys(nested).length > 0) diff[key] = nested;
    }
    // CASE 3 : Update key
    else if (base[key] !== current[key]) {
      diff[key] = {
        status: 'modified',
        old: base[key],
        new: current[key]
      };
    }
  }
  return diff;
};