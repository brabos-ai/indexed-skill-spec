import fs from 'node:fs';
import path from 'node:path';
import AdmZip from 'adm-zip';
import { intro, outro, spinner, log } from '@clack/prompts';
import { promptProviders, promptGitignore, promptVersion } from './prompt.js';
import { getInstalledDirs, writeGitignoreBlock } from './gitignore.js';
import { resolveSelected, PROVIDERS } from './providers.js';
import { fetchLatestRelease, fetchReleases, downloadTagZip } from './github.js';
import { writeManifest, readManifest } from './manifest.js';

/** Old wrong paths that may exist from previous installs (used for migration warning). */
const OLD_WRONG_PATHS = {
  codex: '.agent/skills',
  antigravity: '.agents/skills',
};

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
 * Install flow: interactive provider selection (or direct via providerKeys) → download release → extract → copy → gitignore → manifest.
 * @param {string} cwd              project root
 * @param {string[]} [providerKeys] if provided, skip provider prompts and install these directly
 * @param {string}  [version]       if provided, install this specific release tag (skips version prompt)
 */
export async function install(cwd, providerKeys, version) {
  intro('idx-skill - Install');

  let selectedKeys;

  if (providerKeys && providerKeys.length > 0) {
    selectedKeys = providerKeys;
  } else {
    selectedKeys = await promptProviders(cwd);

    if (selectedKeys.length === 0) {
      log.warn('No providers selected.');
      outro('No providers selected. Installation cancelled.');
      return;
    }
  }

  const addToGitignore = (providerKeys && providerKeys.length > 0) ? true : await promptGitignore();

  const s = spinner();

  // Resolve which release tag to download
  let resolvedTag = version;
  if (!resolvedTag) {
    const nonInteractive = providerKeys && providerKeys.length > 0;
    if (nonInteractive) {
      // Non-interactive mode (--provider used): fetch latest silently, same pattern as gitignore skip
      s.start('Fetching latest release...');
      let latest;
      try {
        latest = await fetchLatestRelease();
      } catch (err) {
        s.stop('Failed to fetch latest release.');
        log.error(err.message);
        return;
      }
      s.stop('');
      resolvedTag = latest.tag_name;
    } else {
      // Interactive mode: show version selection prompt with latest pre-selected
      s.start('Fetching releases...');
      let releases;
      try {
        releases = await fetchReleases();
      } catch (err) {
        s.stop('Failed to fetch releases.');
        log.error(err.message);
        return;
      }
      s.stop('');

      if (!releases || releases.length === 0) {
        log.error('No releases found.');
        return;
      }

      resolvedTag = await promptVersion(releases);
    }
  }

  s.start(`Downloading ${resolvedTag}...`);
  let zipBuffer;
  try {
    zipBuffer = await downloadTagZip(resolvedTag);
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

  writeManifest(cwd, selectedKeys, allFiles, resolvedTag);

  outro('Installed successfully');
}

/**
 * Update flow: reads manifest → fetches latest release → re-downloads → overwrites skills → updates manifest.
 * Shows current → latest version. Warns if old wrong paths are found in cwd.
 * @param {string} cwd  project root
 */
export async function update(cwd) {
  const manifest = readManifest(cwd);
  if (!manifest) {
    log.error('No installation found. Run `idx-skill install` first.');
    return;
  }

  intro('idx-skill - Update');

  // Migration warning: check for old wrong paths from buggy previous installs
  for (const [key, oldPath] of Object.entries(OLD_WRONG_PATHS)) {
    if (fs.existsSync(path.join(cwd, oldPath))) {
      log.warn(
        `Found old install path for ${key}: ${oldPath}/ — this path was incorrect and is no longer used.\n` +
          `  New path: ${PROVIDERS[key]?.dest ?? oldPath}\n` +
          `  You can safely delete ${oldPath}/ manually.`
      );
    }
  }

  const s = spinner();

  s.start('Checking latest release...');
  let latest;
  try {
    latest = await fetchLatestRelease();
  } catch (err) {
    s.stop('Failed to fetch latest release.');
    log.error(err.message);
    return;
  }
  s.stop('');

  const currentVersion = manifest.version ?? 'unknown';
  const latestTag = latest.tag_name;

  if (currentVersion === latestTag) {
    log.success(`Already up to date (${latestTag}).`);
    outro('Nothing to update.');
    return;
  }

  log.info(`Updating: ${currentVersion} → ${latestTag}`);

  s.start(`Downloading ${latestTag}...`);
  let zipBuffer;
  try {
    zipBuffer = await downloadTagZip(latestTag);
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

  writeManifest(cwd, manifest.providers, allFiles, latestTag);

  outro(`Updated to ${latestTag} successfully`);
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

/**
 * Check flow: scans cwd for each known provider's config folder and prints detection status.
 * @param {string} cwd  project root
 */
export function check(cwd) {
  console.log('');
  console.log('idx-skill - Provider Detection');
  console.log('─'.repeat(50));

  for (const [key, p] of Object.entries(PROVIDERS)) {
    const folderPath = path.join(cwd, p.folder);
    const found = fs.existsSync(folderPath);
    const status = found ? '✅' : '❌';
    const destInfo = found ? ` → ${p.dest}/` : ' not found';
    console.log(`  ${status} ${p.folder.padEnd(16)}${destInfo}  (${key})`);
  }

  console.log('');
}
