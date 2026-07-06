import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

export interface GetLogOptions {
  repo?: string;
  from?: string;
  to?: string;
  all?: boolean;
}

const DELIMITER = '|---end---|';

/**
 * Get raw git log output for a repository.
 * Returns an array of raw commit strings.
 */
export function getLog(options: GetLogOptions = {}): string[] {
  const repoPath = options.repo || process.cwd();

  // Validate repo exists
  const gitDir = join(repoPath, '.git');
  if (!existsSync(gitDir)) {
    throw new Error(`Not a git repository: ${repoPath}`);
  }

  // Build git command using args array to avoid shell interpretation
  const format = `--format=%H${DELIMITER}%s${DELIMITER}%cI${DELIMITER}%b${DELIMITER}`;
  const range = buildRange(options.from, options.to);
  const args = ['-C', repoPath, 'log', format, range];

  const result = spawnSync('git', args, {
    encoding: 'utf-8',
    maxBuffer: 10 * 1024 * 1024, // 10MB
  });

  if (result.error) {
    if (result.error.message?.includes('ENOENT')) {
      throw new Error('Git is not installed or not in PATH');
    }
    throw result.error;
  }

  if (result.status !== 0) {
    const stderr = result.stderr?.trim() || 'unknown error';
    if (stderr.includes('fatal: bad revision')) {
      const badRef = extractBadRef(
        stderr,
        options.from || options.to || 'unknown',
      );
      throw new Error(`Invalid git ref: ${badRef}`);
    }
    if (stderr.includes('fatal: not a git repository')) {
      throw new Error(`Not a git repository: ${repoPath}`);
    }
    throw new Error(`Git error: ${stderr}`);
  }

  return parseLogOutput(result.stdout || '');
}

/**
 * Get list of tags in the repository.
 */
export function getTags(repo?: string): string[] {
  const repoPath = repo || process.cwd();

  const result = spawnSync(
    'git',
    ['-C', repoPath, 'tag', '--sort=-v:refname'],
    {
      encoding: 'utf-8',
      maxBuffer: 1024 * 1024,
    },
  );

  if (result.status !== 0 || result.error) {
    return [];
  }

  return (result.stdout || '').trim().split('\n').filter(Boolean);
}

function buildRange(from?: string, to?: string): string {
  if (from && to) {
    return `${from}..${to}`;
  }
  if (from) {
    return `${from}..HEAD`;
  }
  if (to) {
    return `HEAD..${to}`;
  }
  return '--root';
}

function parseLogOutput(output: string): string[] {
  const lines = output.trim().split('\n');
  const commits: string[] = [];
  let current: string[] = [];

  for (const line of lines) {
    current.push(line);
    if (line.includes(DELIMITER)) {
      commits.push(current.join('\n'));
      current = [];
    }
  }

  // Handle any remaining content
  if (current.length > 0) {
    commits.push(current.join('\n'));
  }

  return commits.filter(Boolean);
}

function extractBadRef(stderr: string, fallback: string): string {
  const match = stderr.match(/fatal: bad revision '([^']+)'/);
  return match ? match[1] : fallback;
}
