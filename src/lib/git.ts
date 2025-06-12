// lib/git.ts
import simpleGit from 'simple-git';
import * as vscode from 'vscode';

export async function getCurrentBranchName(): Promise<string | null> {
  try {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) return null;

    const repoPath = workspaceFolders[0].uri.fsPath;
    const git = simpleGit(repoPath);
    const branchSummary = await git.branchLocal();
    return branchSummary.current;
  } catch (error) {
    console.error('Git error:', error);
    return null;
  }
}