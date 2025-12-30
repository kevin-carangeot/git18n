import { calculateJsonDiff } from "~~/server/utils/diff";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const query = getQuery(event);

  const branchName = query.branch as string;
  const filePath = query.path as string;

  if (!branchName || !filePath) throw createError({ statusCode: 400, statusMessage: 'Missing parameters' });

  const repoUrl = config.public.githubRepoUrl;
  const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
  if (!match) throw createError({ statusCode: 500, statusMessage: 'Invalid Repo Config' });
  const [, owner, repo] = match;

  const headers = {
    Authorization: `Bearer ${config.githubToken}`,
    'X-GitHub-Api-Version': '2022-11-28',
    'Accept': 'application/vnd.github.raw'
  };

  try {
    // 1. Get Repo Info to find default branch
    const repoInfo = await $fetch<any>(`https://api.github.com/repos/${owner}/${repo}`, {
      headers: { Authorization: `Bearer ${config.githubToken}` }
    });
    const baseBranch = repoInfo.default_branch;

    // 2. Helper function to fetch and parse safely
    const fetchJsonFile = async (ref: string) => {
      try {
        const raw = await $fetch<string>(`https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`, {
          headers,
          query: { ref },
          responseType: 'text'
        });
        return JSON.parse(raw);
      } catch (e) {
        console.warn(`Failed to fetch/parse file on branch ${ref}:`, e);
        return {};
      }
    };

    // 3. Fetch both versions
    const [headContent, baseContent] = await Promise.all([
      fetchJsonFile(branchName),
      fetchJsonFile(baseBranch)
    ]);

    // 4. Calculate Diff
    const diff = calculateJsonDiff(baseContent, headContent);

    return {
      baseBranch,
      headBranch: branchName,
      diff,
      count: countKeys(diff)
    };

  } catch (error) {
    console.error('Diff Error:', error);
    throw createError({ statusCode: 500, statusMessage: 'Diff calculation failed' });
  }
});

// Helper to count keys in a nested object
function countKeys(obj: any): number {
  let count = 0;
  for (const k in obj) {
    if (typeof obj[k] === 'object' && obj[k] !== null) {
      count += countKeys(obj[k]);
    } else {
      count++;
    }
  }
  return count;
}