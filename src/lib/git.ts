// lib/git.ts
import simpleGit, { SimpleGit } from 'simple-git';
import { CLIENT_RENEG_LIMIT } from 'tls';
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

const MAX_DEPTH = 5;

function findGitRoot(dir: string): string | null {
  while (dir !== path.dirname(dir)) {
    if (fs.existsSync(path.join(dir, '.git'))) {
      return dir;
    }
    dir = path.dirname(dir);
  }
  return null;
}

function getGitInstance(): SimpleGit {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders) throw Error('Not a git folder');

  const repoPath = workspaceFolders[0].uri.fsPath;
  return setupGitInstance(repoPath);
}

export function setupGitInstance(repoPath: string): SimpleGit {
  return simpleGit(repoPath);
}

function findGitReposInFolder(dir: string, depth = 0): string[] {
  const results: string[] = [];

  if (depth > MAX_DEPTH) return results;

  if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) return results;

  const entries = fs.readdirSync(dir);
  if (entries.includes('.git')) {
    results.push(dir);
    return results; // зупиняємось, бо це корінь репозиторію
  }

  for (const entry of entries) {
    const fullPath = path.join(dir, entry);
    if (fs.statSync(fullPath).isDirectory()) {
      results.push(...findGitReposInFolder(fullPath, depth + 1));
    }
  }

  return results;
}


export async function getCurrentBranchName(repo: SimpleGit): Promise<string | null> {
  try {
    const branchSummary = await repo.branchLocal();
    return branchSummary.current;
  } catch (error) {
    console.error('Git error:', error);
    return null;
  }
}

/**
 * Витягує шлях до репозиторію у форматі group/project
 */
export async function getGitRemoteUrl(): Promise<string> {
  const git = getGitInstance();
  const url = await git.remote(['get-url', 'origin']);
  return url || '';

}

export async function gitdebug(): Promise<void> {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders) throw Error('Not a git filder');


  // const repoPath = workspaceFolders[0].uri.fsPath;
}

export function getAllGitRepositories(): string[] {
  const folders = vscode.workspace.workspaceFolders ?? [];
  const allRepos = new Set<string>();

  for (const folder of folders) {
    const fsPath = folder.uri.fsPath;
    const repos = findGitReposInFolder(fsPath);
    repos.forEach(repo => allRepos.add(repo));
  }

  return Array.from(allRepos);
}

export function getAllGitInstances(repos: string[]): SimpleGit[] {
  return repos.map((repo) => setupGitInstance(repo));
}