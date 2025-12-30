import { calculateJsonDiff, calculateDetailedDiff } from "~~/server/utils/diff";

// 👇 HELPER FUNCTION: Recursively counts only the final values (leaves)
// It ignores objects/folders and counts actual strings/numbers
const countLeafNodes = (obj: any): number => {
  let count = 0;

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key];

      // If it's an object (nested folder), dig deeper
      if (typeof value === 'object' && value !== null) {
        count += countLeafNodes(value);
      }
      // If it's a value (string, number, boolean), it counts as 1 key
      else {
        count++;
      }
    }
  }
  return count;
};

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const query = getQuery(event);

  const branchName = query.branch as string;
  const filePath = query.path as string;

  if (!branchName || !filePath) throw createError({ statusCode: 400, statusMessage: 'Missing parameters' });

  // Extract owner/repo
  const repoUrl = config.public.githubRepoUrl;
  const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
  if (!match) throw createError({ statusCode: 500, statusMessage: 'Invalid Repo Config' });
  const [, owner, repo] = match;

  const headers = {
    Authorization: `Bearer ${config.githubToken}`,
    'X-GitHub-Api-Version': '2022-11-28',
    'Accept': 'application/vnd.github.raw'
  };

  // Helper to fetch and parse safely
  const fetchJsonFile = async (ref: string) => {
    try {
      const raw = await $fetch<string>(`https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`, {
        headers,
        query: { ref },
        responseType: 'text'
      });
      return JSON.parse(raw);
    } catch (e) {
      return {};
    }
  };

  try {
    // 1. Get Repo Info for default branch
    const repoInfo = await $fetch<any>(`https://api.github.com/repos/${owner}/${repo}`, {
      headers: { Authorization: `Bearer ${config.githubToken}` }
    });
    const baseBranch = repoInfo.default_branch;

    // 2. Fetch both versions
    const [headContent, baseContent] = await Promise.all([
      fetchJsonFile(branchName),
      fetchJsonFile(baseBranch)
    ]);

    // 3. Calculate Diffs
    const diffJson = calculateJsonDiff(baseContent, headContent);
    const visualDiff = calculateDetailedDiff(baseContent, headContent);

    const preciseCount = countLeafNodes(diffJson);

    return {
      baseBranch,
      headBranch: branchName,
      diff: diffJson,
      visualDiff: visualDiff,
      count: preciseCount
    };

  } catch (error) {
    console.error('Diff Error:', error);
    throw createError({ statusCode: 500, statusMessage: 'Diff calculation failed' });
  }
});