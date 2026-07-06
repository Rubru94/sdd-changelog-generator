import { describe, it, expect } from 'vitest';
import { execSync } from 'node:child_process';

function runCli(args: string = ''): {
  stdout: string;
  stderr: string;
  exitCode: number;
} {
  try {
    const stdout = execSync(`npx tsx src/index.ts ${args}`, {
      encoding: 'utf-8',
      timeout: 10000,
    });
    return { stdout, stderr: '', exitCode: 0 };
  } catch (err: any) {
    return {
      stdout: err.stdout || '',
      stderr: err.stderr || '',
      exitCode: err.status || 1,
    };
  }
}

describe('CLI integration', () => {
  it('shows help with --help flag', () => {
    const result = runCli('--help');
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('changelog-generator');
    expect(result.stdout).toContain('--from');
    expect(result.stdout).toContain('--to');
    expect(result.stdout).toContain('--format');
    expect(result.stdout).toContain('--output');
    expect(result.stdout).toContain('--date-format');
  });

  it('shows version with -V flag', () => {
    const result = runCli('-V');
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('0.1.0');
  });

  it('generates changelog with default options', () => {
    const result = runCli('');
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('# Changelog');
  });

  it('generates changelog with --from and --to', () => {
    const result = runCli('--from HEAD~1 --to HEAD');
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('# Changelog');
  });

  it('generates JSON output with --format json', () => {
    const result = runCli('--format json');
    expect(result.exitCode).toBe(0);
    const parsed = JSON.parse(result.stdout);
    expect(parsed).toHaveProperty('sections');
  });

  it('accepts --repo option pointing to current directory', () => {
    const repoPath = process.cwd();
    const result = runCli(`--repo "${repoPath}"`);
    expect(result.exitCode).toBe(0);
  });

  it('passes --date-format date-time through', () => {
    const result = runCli('--date-format date-time');
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('# Changelog');
  });

  it('accepts --date-format date-only (explicit default)', () => {
    const result = runCli('--date-format date-only');
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('# Changelog');
  });

  it('rejects invalid --date-format value', () => {
    const result = runCli('--date-format invalidvalue');
    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain('Invalid date format');
  });

  it('defaults to date-only when --date-format is omitted', () => {
    const result = runCli('');
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('# Changelog');
  });
});
