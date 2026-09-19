export const GITHUB_API_BASE_URL = 'https://api.github.com';

export const SEARCH_PAGE_SIZE = 10;
export const SEARCH_DEBOUNCE_MS = 300;

// GitHub's Search API never returns results past this offset, regardless of total_count.
export const GITHUB_SEARCH_MAX_RESULTS = 1000;

export const TRACKED_REPOSITORIES_STORAGE_KEY = 'repo-radar:tracked-repositories';

export const TRACKED_INITIAL_VISIBLE_COUNT = 6;
export const TRACKED_LOAD_MORE_STEP = 6;
