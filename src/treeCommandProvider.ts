import * as vscode from 'vscode';
import * as path from 'path';

export class GitCommandProvider implements vscode.TreeDataProvider<GitCommandItem> {
  private _onDidChangeTreeData: vscode.EventEmitter<GitCommandItem | undefined> = new vscode.EventEmitter();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  constructor(private readonly commands: string[]) {}

  refresh(): void {
    this._onDidChangeTreeData.fire(undefined);
  }

  getTreeItem(element: GitCommandItem): vscode.TreeItem {
    return element;
  }

  getChildren(): Thenable<GitCommandItem[]> {
    const items = this.commands.map((cmd) => new GitCommandItem(cmd));
    return Promise.resolve(items);
  }
}

export class GitCommandItem extends vscode.TreeItem {
  constructor(public readonly commandString: string) {
    super(commandString, vscode.TreeItemCollapsibleState.None);

    this.tooltip = `Виконати: ${commandString}`;
    this.description = ''; // або скорочена версія команди

    this.contextValue = 'gitCommandItem';

    this.iconPath = new vscode.ThemeIcon('terminal');

    this.command = {
      command: 'flowAutomate.runGitCommand',
      title: 'Виконати Git-команду',
      arguments: [commandString],
    };
  }
}