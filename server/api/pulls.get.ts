export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();

  const repoUrl = config.public.githubRepoUrl;
  if (!repoUrl) {
    throw createError({ statusCode: 500, statusMessage: 'GitHub Repo URL not configured' });
  }

  const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/)
  if (!match) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid GitHub URL format' })
  }
  const [, owner, repo] = match

  try {
    const pulls = await $fetch(`https://api.github.com/repos/${owner}/${repo}/pulls`, {
      headers: {
        Authorization: `Bearer ${config.githubToken}`,
        'X-GitHub-Api-Version': '2022-11-28',
      },
      query: {
        per_page: 100,
      }
    });

    return pulls.map((pull) => ({
      label: pull.title,
      value: pull.head.ref
    }));
  } catch (error) {
    console.error('GitHub API Error:', error)
    throw createError({ statusCode: 502, statusMessage: 'Failed to fetch pulls from GitHub' })
  }
})