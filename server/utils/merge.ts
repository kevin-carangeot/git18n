const isObject = (item: any) => item && typeof item === 'object' && !Array.isArray(item);

export const merge = (original: any, updates: any): any => {
  // If original is empty, we just return the new content
  if (!original || Object.keys(original).length === 0) return updates;

  const output: any = {};

  // 1. Walk through ORIGINAL keys to preserve exact order
  for (const key of Object.keys(original)) {
    const originalVal = original[key];
    const updateVal = updates[key];

    // Check if we have an update for this specific key
    if (updateVal !== undefined) {
      if (isObject(originalVal) && isObject(updateVal)) {
        // Deep recursion to find the nested key to update
        output[key] = merge(originalVal, updateVal);
      } else {
        // It's a value (string/number), strictly replace it
        output[key] = updateVal;
      }
    } else {
      // No update provided, keep original exactly as is
      output[key] = originalVal;
    }
  }

  // 2. Append ONLY new keys that did not exist before
  for (const key of Object.keys(updates)) {
    if (!(key in original)) {
      output[key] = updates[key];
    }
  }

  return output;
};