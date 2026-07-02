import { writeFileSync } from 'node:fs';
import type { ChangelogOptions, CommitType } from '../types/commit.types.js';
import { generate } from '../services/changelog.service.js';

export interface GenerateCliOptions {
  from?: string;
  to?: string;
  output?: string;
  format?: string;
  repo?: string;
  ver?: string;
  group?: boolean;
  all?: boolean;
  type?: string;
}

/**
 * Generate command handler.
 * Wires CLI options to ChangelogService and handles output.
 */
export async function handleGenerate(
  options: GenerateCliOptions,
): Promise<void> {
  try {
    const changelogOptions = buildChangelogOptions(options);
    const result = generate(changelogOptions);

    if (changelogOptions.output) {
      writeFileSync(changelogOptions.output, result, 'utf-8');
      console.log(`Changelog written to ${changelogOptions.output}`);
    } else {
      console.log(result);
    }
  } catch (err) {
    if (err instanceof Error) {
      console.error(`Error: ${err.message}`);
    } else {
      console.error('Error: An unknown error occurred');
    }
    process.exit(1);
  }
}

function buildChangelogOptions(cli: GenerateCliOptions): ChangelogOptions {
  const options: ChangelogOptions = {
    format: 'markdown',
    group: true,
  };

  if (cli.from) options.from = cli.from;
  if (cli.to) options.to = cli.to;
  if (cli.output) options.output = cli.output;
  if (cli.repo) options.repo = cli.repo;
  if (cli.ver) options.version = cli.ver;
  if (cli.all) options.all = true;

  if (cli.format) {
    if (cli.format !== 'markdown' && cli.format !== 'json') {
      console.error(
        `Error: Invalid format "${cli.format}". Use "markdown" or "json".`,
      );
      process.exit(1);
    }
    options.format = cli.format;
  }

  if (cli.group !== undefined) {
    options.group = cli.group;
  }

  if (cli.type) {
    const types = cli.type
      .split(',')
      .map((t) => t.trim().toLowerCase()) as CommitType[];
    options.type = types;
  }

  return options;
}
