import { getCurrentBranchName } from "./lib/git";
import { createMergeRequest } from "./lib/gitlab";
import { MergeTarget } from "./lib/types";
import * as vscode from 'vscode';

const config = vscode.workspace.getConfiguration('flowAutomate');

export async function mergeRequestHandler(env: MergeTarget):Promise<void> {
    const currentBranch = await getCurrentBranchName();
    const targetBranch = config.get<string>(`branch${env}`);
    if (currentBranch && targetBranch && currentBranch !== targetBranch) {
        await createMergeRequest(currentBranch, targetBranch).then((link) => {
            vscode.window.showInformationMessage('Link copied to clipboard' + link);
            vscode.env.clipboard.writeText(link);
        }).catch((e) => {
            vscode.window.showErrorMessage(e.message);
        });
    } else {
        vscode.window.showErrorMessage(`Fail to create MR ${currentBranch}->${targetBranch}`);
    }
}