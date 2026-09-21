import { afterEach, describe, expect, it, vi } from 'vitest';

async function loadClientHeaders() {
  vi.resetModules();
  const { githubClient } = await import('./client');
  return githubClient.defaults.headers as unknown as Record<string, unknown>;
}

describe('githubClient authorization', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('sends a bearer token when VITE_GITHUB_TOKEN is set', async () => {
    vi.stubEnv('VITE_GITHUB_TOKEN', 'local-dev-token');

    const headers = await loadClientHeaders();

    expect(headers.Authorization).toBe('Bearer local-dev-token');
  });

  it('sends no Authorization header when VITE_GITHUB_TOKEN is unset', async () => {
    vi.stubEnv('VITE_GITHUB_TOKEN', undefined);

    const headers = await loadClientHeaders();

    expect(headers).not.toHaveProperty('Authorization');
  });

  it('ignores VITE_GITHUB_TOKEN in a production build', async () => {
    vi.stubEnv('VITE_GITHUB_TOKEN', 'local-dev-token');
    vi.stubEnv('DEV', false);

    const headers = await loadClientHeaders();

    expect(headers).not.toHaveProperty('Authorization');
  });

  it('sends no Authorization header when VITE_GITHUB_TOKEN is empty', async () => {
    vi.stubEnv('VITE_GITHUB_TOKEN', '');

    const headers = await loadClientHeaders();

    expect(headers).not.toHaveProperty('Authorization');
  });
});
