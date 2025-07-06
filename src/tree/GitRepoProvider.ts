import * as vscode from 'vscode';
import { getAllGitRepositories, setupGitInstance } from '../lib/git';
import { SimpleGit } from 'simple-git';
import { GitRepoItem } from './GitRepoItem';

export class GitRepoProvider implements vscode.TreeDataProvider<GitRepoItem> {

  private _onDidChangeTreeData: vscode.EventEmitter<GitRepoItem | undefined> = new vscode.EventEmitter();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  refresh(): void {
    this._onDidChangeTreeData.fire(undefined);
  }

  getTreeItem(element: GitRepoItem): vscode.TreeItem {
    return element;
  }

  async getChildren(): Promise<GitRepoItem[]> {
    const repoPaths = getAllGitRepositories();
    const items: GitRepoItem[] = [];

    for (const repoPath of repoPaths) {
      const git: SimpleGit = setupGitInstance(repoPath);
      try {
        const status = await git.status();
        const branch = status.current ?? 'unknown';
        const hasChanges = status.files.length > 0;

        const localBranches = await git.branchLocal();
        const localBranchCount = localBranches.all.length;

        items.push(new GitRepoItem(
          repoPath,
          branch,
          hasChanges,
          localBranchCount,
          git));
      } catch (err) {
        console.error('Git error for', repoPath, err);
      }
    }

    return items;
  }
}