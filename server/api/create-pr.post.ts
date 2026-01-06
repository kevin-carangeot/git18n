import { deepMerge } from "~~/server/utils/merge";
import { detectIndentation } from "~~/server/utils/indent";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const body = await readBody(event);
  const { translations, owner, repo, baseBranch, folderPath } = body;

  if (!translations || !owner || !repo) throw createError({ statusCode: 400, statusMessage: 'Missing parameters' });

  const headers = {
    Authorization: `Bearer ${config.githubToken}`,
    'X-GitHub-Api-Version': '2022-11-28',
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'Nuxt-i18n-App'
  };

  const newBranchName = `feat/i18n-update-${Date.now()}`;
  const apiBase = `https://api.github.com/repos/${owner}/${repo}`;

  try {
    // 1. Get base SHA
    const refData = await $fetch<any>(`${apiBase}/git/ref/heads/${baseBranch}`, { headers });
    const baseSha = refData.object.sha;

    // 2. Create branch
    await $fetch(`${apiBase}/git/refs`, {
      method: 'POST',
      headers,
      body: { ref: `refs/heads/${newBranchName}`, sha: baseSha }
    });

    // 3. Process files
    for (const [lang, newContent] of Object.entries(translations)) {
      const cleanFolder = folderPath ? folderPath.replace(/\/$/, '') : 'locales';
      const filePath = `${cleanFolder}/${lang}.json`;

      let currentContentObj = {};
      let fileSha = undefined;
      let indentation: string | number = 2;

      try {
        const fileData = await $fetch<any>(`${apiBase}/contents/${filePath}`, {
          headers,
          query: { ref: newBranchName }
        });

        const rawContent = Buffer.from(fileData.content, 'base64').toString('utf-8');
        indentation = detectIndentation(rawContent);
        currentContentObj = JSON.parse(rawContent);
        fileSha = fileData.sha;
      } catch (e) {
        // File is new
      }

      const finalJson = deepMerge(currentContentObj, newContent);
      const jsonString = JSON.stringify(finalJson, null, indentation) + '\n';
      const encodedContent = Buffer.from(jsonString).toString('base64');

      // Update/Create file
      await $fetch(`${apiBase}/contents/${filePath}`, {
        method: 'PUT',
        headers,
        body: {
          message: `chore(i18n): update ${lang}.json`,
          content: encodedContent,
          branch: newBranchName,
          sha: fileSha
        }
      });
    }

    // 4. Create PR
    const pr = await $fetch<any>(`${apiBase}/pulls`, {
      method: 'POST',
      headers,
      body: {
        title: `chore: update translations (${Object.keys(translations).join(', ')})`,
        body: `Automated updates via Git18n.\nLanguages: ${Object.keys(translations).join(', ')}.`,
        head: newBranchName,
        base: baseBranch
      }
    });

    return { success: true, url: pr.html_url };

  } catch (error: any) {
    console.error('PR Action Failed:', error);
    throw createError({
      statusCode: error.response?.status || 500,
      statusMessage: error.message || 'Failed to create PR'
    });
  }
});