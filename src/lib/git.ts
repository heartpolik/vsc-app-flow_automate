// lib/git.ts
import simpleGit, { SimpleGit } from 'simple-git';
import * as vscode from 'vscode';

function getGitInstance():SimpleGit {
  const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) throw Error('Not a git filder');

    const repoPath = workspaceFolders[0].uri.fsPath;
    return simpleGit(repoPath);
}

export async function getCurrentBranchName(): Promise<string | null> {
  try {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) return null;

    const git = getGitInstance();
    const branchSummary = await git.branchLocal();
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

  const url =  await git.remote(['get-url', 'origin']);
  console.log('GIT ORIGIN', url);
  return url || '';

}