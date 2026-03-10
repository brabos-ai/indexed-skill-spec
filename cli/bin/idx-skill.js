#!/usr/bin/env node

import { log } from '@clack/prompts';
import { install, update, list, check } from '../src/installer.js';
import { PROVIDERS, ALIASES } from '../src/providers.js';

function printUsage() {
  console.log(`
Usage: idx-skill [command] [options]

Commands:
  install   Install indexed skills (default)
  update    Update installed skills
  list      List installed skills
  check     Show which AI providers are detected in current directory

Options:
  --provider <key>   Install for a specific provider (repeatable, skips prompts)
  -h, --help         Show this help message
  -v, --version      Show version

Examples:
  idx-skill install
  idx-skill install --provider claudecode
  idx-skill install --provider claudecode --provider gemini
  idx-skill check
`);
}

async function main() {
  const args = process.argv.slice(2);
  const cwd = process.cwd();

  // Handle flags
  if (args.includes('--help') || args.includes('-h')) {
    printUsage();
    process.exit(0);
  }

  if (args.includes('--version') || args.includes('-v')) {
    const { createRequire } = await import('node:module');
    const req = createRequire(import.meta.url);
    const pkg = req('../package.json');
    console.log(pkg.version);
    process.exit(0);
  }

  // Parse --provider flags (collect, resolve aliases, deduplicate)
  const providerKeys = [];
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--provider' && args[i + 1]) {
      const raw = args[i + 1];
      const resolved = ALIASES[raw] ?? raw;
      if (!PROVIDERS[resolved]) {
        const validKeys = [...Object.keys(PROVIDERS), ...Object.keys(ALIASES)].join(', ');
        log.error(`Unknown provider: ${raw}. Valid providers: ${validKeys}`);
        process.exit(1);
      }
      if (!providerKeys.includes(resolved)) {
        providerKeys.push(resolved);
      }
      i++; // skip next arg
    }
  }

  const command = args.find((a) => !a.startsWith('-')) ?? 'install';

  try {
    if (command === 'install') {
      await install(cwd, providerKeys.length > 0 ? providerKeys : undefined);
    } else if (command === 'update') {
      await update(cwd);
    } else if (command === 'list') {
      list(cwd);
    } else if (command === 'check') {
      check(cwd);
    } else {
      log.error(`Unknown command: ${command}`);
      printUsage();
      process.exit(1);
    }
  } catch (err) {
    if (err instanceof Error && err.message === 'USER_CANCEL') {
      // Silent exit on user cancel
      process.exit(0);
    }
    log.error(err instanceof Error ? err.message : String(err));
    process.exit(1);
  }
}

main();
