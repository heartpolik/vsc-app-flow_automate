import { gitdebug, setupGitInstance } from "./lib/git";
import { createMergeRequest } from "./lib/gitlab";
import { MergeTarget } from "./lib/types";
import * as vscode from 'vscode';
import { Config } from './Config'
import { addMrToJiraIssue, postToJira } from "./lib/jira";

export async function mergeRequestHandler(env: MergeTarget, repoPath: string): Promise<void> {
    const repo = setupGitInstance(repoPath);
    const isProd = env === MergeTarget.Prod;

    try {
        const targetBranch = Config.read[`branch${env}`];

        if (!targetBranch) throw Error('Unable to resolve target branch');

        const mrData = await createMergeRequest(repo, targetBranch).then((response) => {
            vscode.env.clipboard.writeText(response.url);
            vscode.window.showInformationMessage('🔗 in 📋 ' + response.url);
            return response;
        });

        if (isProd) {
            await addMrToJiraIssue(mrData.sourceBranch, mrData.repoName, mrData.url);
        }
    } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        vscode.window.showErrorMessage(message);
    }
}

export async function debug(): Promise<void> {
    await gitdebug();

}