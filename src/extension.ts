import * as vscode from 'vscode';
import { mergeRequestHandler, debug } from './handlers';
import { MergeTarget } from './lib/types';
import { GitRepoProvider } from './tree/GitRepoProvider';
import { CommandProvider } from './tree/CommandProvider';
import { CommandItem } from './tree/CommandItem';
import { actions } from './commands/actions';
import { GitRepoItem } from './tree/GitRepoItem';
import { Config } from './Config';

export function activate(context: vscode.ExtensionContext) {
  const alreadyActivated = context.globalState.get<boolean>('flowAutomateActivated');

  if (!alreadyActivated) {
    vscode.window.showInformationMessage(
      'Flow Automate extension has been installed. Reload to apply all features.',
      'Reload Window'
    ).then(selection => {
      if (selection === 'Reload Window') {
        vscode.commands.executeCommand('workbench.action.reloadWindow');
      }
    });

    context.globalState.update('flowAutomateActivated', true);
  }
  vscode.workspace.onDidChangeConfiguration(event => {
    if (event.affectsConfiguration('flowAutomate')) {
      Config.init();
    }
  });
  const repoProvider = new GitRepoProvider();
  vscode.window.registerTreeDataProvider('reposList', repoProvider);
  const cmdProvider = new CommandProvider(actions);
  vscode.window.registerTreeDataProvider('actionsList', cmdProvider);

  const refreshCmd = vscode.commands.registerCommand('flowAutomate.refreshGitRepos', () => {
    repoProvider.refresh();
  });

  const commands = [
    vscode.commands.registerCommand('flowAutomate.refreshRepo', (item: GitRepoItem) => {
      vscode.window.showInformationMessage(`Оновлення репо: ${item.repoPath}`);
      repoProvider.refresh();
    }),
    vscode.commands.registerCommand('flowAutomate.openInTerminal', (item: GitRepoItem) => {
      vscode.window.createTerminal({ cwd: item.repoPath }).show();
    }),
    vscode.commands.registerCommand('flowAutomate.mr2prod', async (item: GitRepoItem) => {
      vscode.window.showInformationMessage('Створення MR у prod...');
      await mergeRequestHandler(MergeTarget.Prod, item.repoPath);
    }),
    vscode.commands.registerCommand('flowAutomate.mr2stage', async (item: GitRepoItem) => {
      await mergeRequestHandler(MergeTarget.Stage, item.repoPath);
    }),
    vscode.commands.registerCommand('flowAutomate.runCommand', async (item: CommandItem) => {
      await item.actionItem.action();
    }),
    vscode.commands.registerCommand('flowAutomate.debug', async (item: GitRepoItem) => {
      await debug();
    }),

  ];

  context.subscriptions.push(refreshCmd, ...commands);

}


export function deactivate() { }