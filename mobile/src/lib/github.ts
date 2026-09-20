import { WordsData } from '../types';
import { GithubConfig } from './storage';
import { utf8ToBase64 } from './base64';

export class GithubPushError extends Error {}

interface ContentsGetResponse {
  sha: string;
  content: string;
  encoding: string;
}

export async function fetchWordsFileSha(config: GithubConfig, token: string): Promise<string | null> {
  const res = await fetch(
    `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${config.path}`,
    { headers: { Authorization: `token ${token}`, Accept: 'application/vnd.github.v3+json' } }
  );
  if (res.status === 404) return null;
  if (!res.ok) {
    const body = await safeJson(res);
    throw new GithubPushError(body?.message || `Failed to read current file (HTTP ${res.status})`);
  }
  const data = (await res.json()) as ContentsGetResponse;
  return data.sha;
}

export async function pushWordsToGithub(
  words: WordsData,
  config: GithubConfig,
  token: string,
  knownSha: string | null
): Promise<string> {
  const sha = knownSha ?? (await fetchWordsFileSha(config, token));
  const content = utf8ToBase64(JSON.stringify(words, null, 2) + '\n');
  const res = await fetch(
    `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${config.path}`,
    {
      method: 'PUT',
      headers: {
        Authorization: `token ${token}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'Update words.json via in-app admin panel',
        content,
        ...(sha ? { sha } : {}),
      }),
    }
  );
  const body = await safeJson(res);
  if (!res.ok) {
    throw new GithubPushError(body?.message || `Push failed (HTTP ${res.status})`);
  }
  return body?.content?.sha as string;
}

export async function verifyGithubToken(config: GithubConfig, token: string): Promise<boolean> {
  try {
    const res = await fetch(`https://api.github.com/repos/${config.owner}/${config.repo}`, {
      headers: { Authorization: `token ${token}`, Accept: 'application/vnd.github.v3+json' },
    });
    return res.ok;
  } catch {
    return false;
  }
}

async function safeJson(res: Response): Promise<any> {
  try {
    return await res.json();
  } catch {
    return null;
  }
}
