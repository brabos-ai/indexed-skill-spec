import fs from 'node:fs';
import path from 'node:path';
import { PROVIDERS } from './providers.js';

export const BLOCK_START = '# idx-skill - managed by idx-skill';
export const BLOCK_END = '# END idx-skill';

/**
 * Get the list of directories to add to .gitignore.
 * Always includes .indexed-skill/. Adds provider dest dirs for each selected key.
 * @param {string[]} selectedKeys
 * @returns {string[]}
 */
export function getInstalledDirs(selectedKeys) {
  const dirs = ['.indexed-skill/'];
  for (const key of selectedKeys) {
    if (PROVIDERS[key]) {
      const dest = PROVIDERS[key].dest;
      dirs.push(dest.endsWith('/') ? dest : `${dest}/`);
    }
  }
  return dirs;
}

/**
 * Returns true if the managed block already exists in .gitignore.
 * @param {string} cwd
 * @returns {boolean}
 */
export function hasBlock(cwd) {
  const gitignorePath = path.join(cwd, '.gitignore');
  if (!fs.existsSync(gitignorePath)) return false;
  const content = fs.readFileSync(gitignorePath, 'utf8');
  return content.includes(BLOCK_START);
}

/**
 * Write or replace the idx-skill managed block in .gitignore.
 * Creates .gitignore if it does not exist.
 * Does not duplicate the block if already present.
 * @param {string} cwd
 * @param {string[]} dirs
 */
export function writeGitignoreBlock(cwd, dirs) {
  const gitignorePath = path.join(cwd, '.gitignore');

  let existing = '';
  if (fs.existsSync(gitignorePath)) {
    existing = fs.readFileSync(gitignorePath, 'utf8');
  }

  const blockContent = [BLOCK_START, ...dirs, BLOCK_END].join('\n');

  const startIdx = existing.indexOf(BLOCK_START);
  const endIdx = existing.indexOf(BLOCK_END);

  let newContent;
  if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
    // Replace existing block in-place
    newContent =
      existing.slice(0, startIdx) +
      blockContent +
      existing.slice(endIdx + BLOCK_END.length);
  } else {
    // Append block to end of file
    const trailingNewlines =
      existing.length === 0
        ? ''
        : existing.endsWith('\n\n')
        ? ''
        : existing.endsWith('\n')
        ? '\n'
        : '\n\n';
    newContent = existing + trailingNewlines + blockContent + '\n';
  }

  fs.writeFileSync(gitignorePath, newContent, 'utf8');
}
