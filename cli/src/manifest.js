import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const MANIFEST_DIR = '.indexed-skill';
const MANIFEST_FILE = 'manifest.json';

/**
 * Compute SHA-256 hash of a file.
 * @param {string} filePath  absolute path
 * @returns {string} hex digest
 */
function hashFile(filePath) {
  const content = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(content).digest('hex');
}

/**
 * Write .indexed-skill/manifest.json.
 * Creates the directory if it does not exist.
 * Computes SHA-256 hashes for each file.
 *
 * @param {string} cwd       project root
 * @param {string[]} providers  selected provider keys
 * @param {string[]} files   relative paths (from cwd) of installed files
 * @param {string} [version]  installed release tag (e.g. "v1.2.0")
 */
export function writeManifest(cwd, providers, files, version) {
  const manifestDir = path.join(cwd, MANIFEST_DIR);
  fs.mkdirSync(manifestDir, { recursive: true });

  const hashes = {};
  for (const file of files) {
    const fullPath = path.join(cwd, file);
    if (fs.existsSync(fullPath)) {
      hashes[file] = hashFile(fullPath);
    }
  }

  const manifest = {
    installedAt: new Date().toISOString(),
    version: version ?? null,
    providers,
    files,
    hashes,
  };

  const manifestPath = path.join(manifestDir, MANIFEST_FILE);
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n', 'utf8');
}

/**
 * Read .indexed-skill/manifest.json.
 * Returns null if the file does not exist.
 *
 * @param {string} cwd  project root
 * @returns {object | null}
 */
export function readManifest(cwd) {
  const manifestPath = path.join(cwd, MANIFEST_DIR, MANIFEST_FILE);
  if (!fs.existsSync(manifestPath)) {
    return null;
  }
  try {
    const content = fs.readFileSync(manifestPath, 'utf8');
    return JSON.parse(content);
  } catch {
    return null;
  }
}
