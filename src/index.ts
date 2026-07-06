#!/usr/bin/env node

import { Command } from 'commander';
import type { GenerateCliOptions } from './commands/generate.js';
import { handleGenerate } from './commands/generate.js';

const program = new Command();

program
  .name('changelog-generator')
  .description('Generate changelogs from conventional commits')
  .version('0.1.0');

program
  .option('--from <ref>', 'Starting git ref (tag, commit, HEAD~N)')
  .option('--to <ref>', 'Ending git ref')
  .option('--output <file>', 'Output file path')
  .option('--format <format>', 'Output format: markdown or json', 'markdown')
  .option('--repo <path>', 'Repository path (default: current directory)')
  .option('--ver <semver>', 'Version number for changelog header')
  .option('--group', 'Group commits by type', true)
  .option('--no-group', 'Do not group commits')
  .option('--all', 'Include non-conventional commits')
  .option(
    '--type <types>',
    'Filter by commit types (comma-separated, e.g. feat,fix)',
  )
  .option(
    '--date-format <mode>',
    'Date format for commit dates: date-only (default), date-time, or iso',
  );

program.action(async (options: GenerateCliOptions) => {
  await handleGenerate(options);
});

program.parse(process.argv);
