import https from 'node:https';

const REPO = 'brabos-ai/indexed-skill-spec';

/**
 * Fetch the latest release metadata from GitHub Releases API.
 * @param {string} [repo]
 * @returns {Promise<{tag_name: string, name: string}>}
 */
export async function fetchLatestRelease(repo = REPO) {
  const url = `https://api.github.com/repos/${repo}/releases/latest`;
  return fetchJson(url);
}

/**
 * Fetch the list of releases from GitHub Releases API.
 * @param {number} [limit=10]
 * @param {string} [repo]
 * @returns {Promise<Array<{tag_name: string, name: string}>>}
 */
export async function fetchReleases(limit = 10, repo = REPO) {
  const url = `https://api.github.com/repos/${repo}/releases?per_page=${limit}`;
  return fetchJson(url);
}

/**
 * Download a release tag zipball as a Buffer.
 * @param {string} tag  git tag (e.g. "v1.2.0")
 * @param {string} [repo]
 * @returns {Promise<Buffer>}
 */
export async function downloadTagZip(tag, repo = REPO) {
  const url = `https://github.com/${repo}/archive/refs/tags/${tag}.zip`;
  return fetchBuffer(url, tag);
}

/**
 * Download a branch zipball as a Buffer using node:https (Node 18 compatible).
 * Follows redirects automatically.
 * @param {string} [branch='main']
 * @param {string} [repo]
 * @returns {Promise<Buffer>}
 */
export async function downloadBranchZip(branch = 'main', repo = REPO) {
  const url = `https://github.com/${repo}/archive/refs/heads/${branch}.zip`;
  return fetchBuffer(url, branch);
}

/**
 * Internal: fetch a URL as JSON using node:https, following redirects.
 * @param {string} url
 * @returns {Promise<unknown>}
 */
function fetchJson(url) {
  return new Promise((resolve, reject) => {
    const options = {
      headers: { 'User-Agent': 'idx-skill', 'Accept': 'application/vnd.github.v3+json' },
    };

    const request = (currentUrl) => {
      https
        .get(currentUrl, options, (res) => {
          if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
            res.resume();
            request(res.headers.location);
            return;
          }

          if (res.statusCode === 404) {
            res.resume();
            reject(new Error('Release not found.'));
            return;
          }

          if (res.statusCode !== 200) {
            res.resume();
            reject(new Error(`GitHub API error: ${res.statusCode}`));
            return;
          }

          const chunks = [];
          res.on('data', (chunk) => chunks.push(chunk));
          res.on('end', () => {
            try {
              resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')));
            } catch {
              reject(new Error('Failed to parse GitHub API response.'));
            }
          });
          res.on('error', () =>
            reject(new Error('Could not reach GitHub. Check your connection.'))
          );
        })
        .on('error', () => {
          reject(new Error('Could not reach GitHub. Check your connection.'));
        });
    };

    request(url);
  });
}

/**
 * Internal: fetch a URL as a Buffer using node:https, following redirects.
 * @param {string} url
 * @param {string} branch  used for error messages
 * @returns {Promise<Buffer>}
 */
function fetchBuffer(url, branch) {
  return new Promise((resolve, reject) => {
    const options = {
      headers: { 'User-Agent': 'idx-skill' },
    };

    const request = (currentUrl) => {
      https
        .get(currentUrl, options, (res) => {
          // Follow redirects (301, 302, 307, 308)
          if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
            res.resume(); // discard response body
            request(res.headers.location);
            return;
          }

          if (res.statusCode === 404) {
            res.resume();
            reject(new Error(`Branch ${branch} not found.`));
            return;
          }

          if (res.statusCode !== 200) {
            res.resume();
            reject(new Error(`Download failed: ${res.statusCode}`));
            return;
          }

          const chunks = [];
          res.on('data', (chunk) => chunks.push(chunk));
          res.on('end', () => resolve(Buffer.concat(chunks)));
          res.on('error', () =>
            reject(new Error('Could not reach GitHub. Check your connection.'))
          );
        })
        .on('error', () => {
          reject(new Error('Could not reach GitHub. Check your connection.'));
        });
    };

    request(url);
  });
}
