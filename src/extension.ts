import * as vscode from 'vscode';
import { getCurrentBranchName } from './lib/git';
import { createMergeRequest } from './lib/gitlab';
import { postToJira } from './lib/jira';

export function activate(context: vscode.ExtensionContext) {
  const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
  statusBarItem.text = '🦊';
  statusBarItem.tooltip = 'Flow automate меню';
  statusBarItem.command = 'extension.menu';
  statusBarItem.show();
  context.subscriptions.push(statusBarItem);

  const menuCommand = vscode.commands.registerCommand('extension.menu', async () => {
    const selection = await vscode.window.showQuickPick(
      [
        { label: '🔴 MR → prod', action: 'mr2prod' },
        { label: '🟡 MR → stage', action: 'mr2stage' },
        { label: '⚙️ Settings', action: 'settings' },
      ],
      { placeHolder: 'Оберіть дію' }
    );

    if (!selection) return;

    switch (selection.action) {
      case 'mr2prod':
        vscode.commands.executeCommand('extension.createMrProd');
        break;
      case 'mr2stage':
        vscode.commands.executeCommand('extension.createMrStage');
        break;
      case 'settings':
        vscode.commands.executeCommand('workbench.action.openSettings', '@ext:flowAutomate');
        break;
    }
  });
  context.subscriptions.push(menuCommand);

  const createMrProd = vscode.commands.registerCommand('extension.createMrProd', async () => {
    vscode.window.showInformationMessage('Створення MR у prod...');
    // тут твоя логіка створення MR у prod
  });

  const createMrStage = vscode.commands.registerCommand('extension.createMrStage', async () => {
    vscode.window.showInformationMessage('Створення MR у stage...');
    // тут твоя логіка створення MR у stage
  });

  context.subscriptions.push(createMrProd, createMrStage);
}


export function deactivate() {}