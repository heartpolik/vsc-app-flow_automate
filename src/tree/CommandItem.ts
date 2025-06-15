import * as vscode from 'vscode';
import { ThemeIcon } from 'vscode';

export interface ActionItem {
    title: string,
    icon: ThemeIcon,
    action: () => Promise<void>,
}

export class CommandItem extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly actionItem: ActionItem
  ) {
    super(label, vscode.TreeItemCollapsibleState.None);

    this.tooltip = `Виконати: ${label}`;
    this.iconPath = actionItem.icon;
    this.contextValue = 'commandItem';

    this.command = {
      command: 'flowAutomate.runCommand',
      title: 'Виконати команду',
      arguments: [this]
    };
  }
}