import fs from 'node:fs';
import path from 'node:path';
import AdmZip from 'adm-zip';
import { intro, outro, spinner, log } from '@clack/prompts';
import { promptProviders, promptGitignore } from './prompt.js';
import { getInstalledDirs, writeGitignoreBlock } from './gitignore.js';
import { resolveSelected, PROVIDERS } from './providers.js';
import { downloadBranchZip } from './github.js';
import { writeManifest, readManifest } from './manifest.js';

/**
 * Copy entries from zip matching a source prefix to a destination directory.
 * Strips `{zipRoot}/{srcPrefix}/` from each entry name before writing.
 * Returns array of relative paths (from cwd) of files copied.
 *
 * @param {AdmZip} zip
 * @param {string} zipRoot    top-level folder name inside zip (e.g. "indexed-skill-spec-main")
 * @param {string} srcPrefix  path inside zip after zipRoot (e.g. "skills")
 * @param {string} destDir    absolute destination directory
 * @param {string} cwd        project root
 * @returns {string[]}
 */
export function copyFromZip(zip, zipRoot, srcPrefix, destDir, cwd) {
  const copied = [];
  const prefix = `${zipRoot}/${srcPrefix}/`;

  for (const entry of zip.getEntries()) {
    if (!entry.entryName.startsWith(prefix)) continue;
    if (entry.isDirectory) continue;

    const relativeToDest = entry.entryName.slice(prefix.length);
    if (!relativeToDest) continue;

    const destFile = path.join(destDir, relativeToDest);
    const destFileDir = path.dirname(destFile);

    fs.mkdirSync(destFileDir, { recursive: true });
    fs.writeFileSync(destFile, entry.getData());

    const relFromCwd = path.relative(cwd, destFile).replace(/\\/g, '/');
    copied.push(relFromCwd);
  }

  return copied;
}

/**
 * Install flow: interactive provider selection → download → extract → copy → gitignore → manifest.
 * @param {string} cwd  project root
 */
export async function install(cwd) {
  intro('idx-skill - Install');

  const selectedKeys = await promptProviders();

  if (selectedKeys.length === 0) {
    log.warn('No providers selected.');
    outro('No providers selected. Installation cancelled.');
    return;
  }

  const addToGitignore = await promptGitignore();

  const s = spinner();

  s.start('Downloading skills from GitHub...');
  let zipBuffer;
  try {
    zipBuffer = await downloadBranchZip('main');
  } catch (err) {
    s.stop('Download failed.');
    log.error(err.message);
    return;
  }
  s.stop('Downloaded.');

  s.start('Installing skills...');
  const zip = new AdmZip(zipBuffer);

  const zipRoot = zip.getEntries()[0]?.entryName.split('/')[0] ?? '';
  if (!zipRoot) {
    s.stop('Error.');
    log.error('Unexpected zip structure.');
    return;
  }

  const providers = resolveSelected(selectedKeys);
  const allFiles = [];

  for (const p of providers) {
    const destDir = path.join(cwd, p.dest);
    if (fs.existsSync(destDir) && fs.readdirSync(destDir).length > 0) {
      log.warn(`Provider ${p.key} already has files in ${p.dest}/ — overwriting.`);
    }
    const pFiles = copyFromZip(zip, zipRoot, p.src, destDir, cwd);
    if (pFiles.length === 0) {
      log.warn(`No skills found for provider ${p.key}.`);
    }
    allFiles.push(...pFiles);
  }

  s.stop(`Installed ${allFiles.length} files.`);

  if (addToGitignore) {
    writeGitignoreBlock(cwd, getInstalledDirs(selectedKeys));
    log.success('.gitignore updated.');
  }

  writeManifest(cwd, selectedKeys, allFiles);

  outro('Installed successfully');
}

/**
 * Update flow: reads manifest → re-downloads → overwrites skills → updates manifest.
 * @param {string} cwd  project root
 */
export async function update(cwd) {
  const manifest = readManifest(cwd);
  if (!manifest) {
    log.error('No installation found. Run `idx-skill install` first.');
    return;
  }

  intro('idx-skill - Update');

  const s = spinner();

  s.start('Downloading skills from GitHub...');
  let zipBuffer;
  try {
    zipBuffer = await downloadBranchZip('main');
  } catch (err) {
    s.stop('Download failed.');
    log.error(err.message);
    return;
  }
  s.stop('Downloaded.');

  s.start('Updating skills...');
  const zip = new AdmZip(zipBuffer);

  const zipRoot = zip.getEntries()[0]?.entryName.split('/')[0] ?? '';
  if (!zipRoot) {
    s.stop('Error.');
    log.error('Unexpected zip structure.');
    return;
  }

  const providers = resolveSelected(manifest.providers);
  const allFiles = [];

  for (const p of providers) {
    const destDir = path.join(cwd, p.dest);
    const pFiles = copyFromZip(zip, zipRoot, p.src, destDir, cwd);
    allFiles.push(...pFiles);
  }

  s.stop(`Updated ${allFiles.length} files.`);

  writeManifest(cwd, manifest.providers, allFiles);

  outro('Updated successfully');
}

/**
 * List flow: reads manifest and prints installed providers, dirs, date, file count.
 * @param {string} cwd  project root
 */
export function list(cwd) {
  const manifest = readManifest(cwd);
  if (!manifest) {
    log.error('No installation found.');
    return;
  }

  console.log('');
  console.log('idx-skill - Installed Skills');
  console.log('─'.repeat(50));
  console.log(`Installed at: ${manifest.installedAt}`);
  console.log(`Total files:  ${manifest.files.length}`);
  console.log('');
  console.log('Providers:');

  for (const key of manifest.providers) {
    const dest = PROVIDERS[key]?.dest ?? key;
    console.log(`  • ${key.padEnd(14)} → ${dest}/`);
  }

  console.log('');
}
