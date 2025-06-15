import * as vscode from 'vscode';
import { ActionItem, CommandItem } from './CommandItem';




export class CommandProvider implements vscode.TreeDataProvider<CommandItem> {
  private _onDidChangeTreeData: vscode.EventEmitter<CommandItem | undefined> = new vscode.EventEmitter();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  constructor(private readonly commandMap: Record<string, ActionItem>) {}

  refresh(): void {
    this._onDidChangeTreeData.fire(undefined);
  }

  getTreeItem(element: CommandItem): vscode.TreeItem {
    return element;
  }

  getChildren(): Thenable<CommandItem[]> {
    const items = Object.entries(this.commandMap).map(([label, item ]) => new CommandItem(item.title, item));
    return Promise.resolve(items);
  }
}