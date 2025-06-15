import * as vscode from 'vscode';
import { getAllGitInstances, getAllGitRepositories } from '../lib/git';
import { MergeTarget } from '../lib/types';
import { Config } from '../Config';

export const actions = {

    openSettings: {
        title: 'Налаштування розширення',
        icon: new vscode.ThemeIcon('extensions-manage', new vscode.ThemeColor('charts.green')),
        action: async () => {
            await vscode.commands.executeCommand('workbench.action.openSettings', '@ext:hrt-plk.flow-automate');
        },
    },

    refreshTree: {
        title: 'Оновити стан репозиторіїв',
        icon: new vscode.ThemeIcon('extensions-sync-enabled'),
        action: async () => {
            await vscode.commands.executeCommand('flowAutomate.refreshGitRepos');
        },
    },

    pullAllProd: {
        title: 'Оновити увесь прод',
        icon: new vscode.ThemeIcon('search-replace-all', new vscode.ThemeColor('problemsWarningIcon.foreground')),
        action: async () => {
            const repos = getAllGitInstances(getAllGitRepositories());
            const prodBranch: string = Config.read[`branch${MergeTarget.Prod}`];

            if (!prodBranch) {
                vscode.window.showErrorMessage('Не задано гілку для прод');
                return;
            }

            for (const repo of repos) {
                try {
                    const status = await repo.status();
                    const currentBranch = status.current;

                    if (!currentBranch) {
                        vscode.window.showWarningMessage(`Не вдалося визначити поточну гілку у ${repo.cwd}`);
                        continue;
                    }
                    await repo.stash();
                    await repo.checkout(prodBranch);
                    await repo.pull('origin', prodBranch);
                    await repo.checkout(currentBranch);
                    await repo.raw(['stash', 'pop']);
                } catch (error: any) {
                    console.error(`Помилка при оновленні репозиторію ${repo.cwd}:`, error);
                    vscode.window.showWarningMessage(`Помилка в ${repo.cwd}: ${error.message}`);
                    // Можна додати continue або не додавати, бо try-catch охоплює усе
                }
            }

            vscode.window.showInformationMessage('Гілки prod оновлені в усіх репозиторіях');
            await vscode.commands.executeCommand('flowAutomate.refreshGitRepos');
        },
    },

    // pullAllProdWithReset: {
    //     title: 'Скинути зміни і перейти на прод',
    //     icon: new vscode.ThemeIcon('notebook-unfold', new vscode.ThemeColor('errorForeground')),
    //     action: async () => {
    //         await vscode.commands.executeCommand('flowAutomate.refreshGitRepos');
    //     },
    // },



};

// search-replace-all
// notebook-unfold