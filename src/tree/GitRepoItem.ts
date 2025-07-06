import path from 'path';
import { SimpleGit } from 'simple-git';
import * as vscode from 'vscode';

export class GitRepoItem extends vscode.TreeItem {
  constructor(
    public readonly repoPath: string,
    public readonly branch: string,
    public readonly hasChanges: boolean,
    public readonly localBranchCount: number,
    public readonly repo: SimpleGit,
  ) {
    super(path.basename(repoPath), vscode.TreeItemCollapsibleState.None);

    this.tooltip = `${repoPath}\nГілка: ${branch} \n${localBranchCount} локальних гілок`;
    this.description = `${branch} [${localBranchCount}]`;

    this.iconPath = new vscode.ThemeIcon(
      hasChanges ? 'warning' : 'check',
      hasChanges ? new vscode.ThemeColor('problemsWarningIcon.foreground') : new vscode.ThemeColor('charts.green')
    );

    this.contextValue = 'gitRepo'; // для context menu

    this.command = {
      command: 'flowAutomate.refreshRepo',
      title: 'Оновити статус',
      arguments: [this],
    };
  }
}