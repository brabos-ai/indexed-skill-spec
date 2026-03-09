#!/usr/bin/env node

import { log } from '@clack/prompts';
import { install, update, list } from '../src/installer.js';

function printUsage() {
  console.log(`
Usage: idx-skill [command]

Commands:
  install   Install indexed skills (default)
  update    Update installed skills
  list      List installed skills

Options:
  -h, --help     Show this help message
  -v, --version  Show version
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
    const require = createRequire(import.meta.url);
    const pkg = require('../package.json');
    console.log(pkg.version);
    process.exit(0);
  }

  const command = args[0] ?? 'install';

  try {
    if (command === 'install') {
      await install(cwd);
    } else if (command === 'update') {
      await update(cwd);
    } else if (command === 'list') {
      list(cwd);
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
