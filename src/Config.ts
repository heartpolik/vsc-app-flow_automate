import * as vscode from 'vscode';

export interface FlowAutomateConfig {
    gitlabUrl: string;
    gitlabToken: string;
    branchProd: string;
    branchStage: string;
    jiraUrl: string;
    jiraEmail: string;
    jiraToken: string;
    jiraSectionName: string;
}

export class Config {
    private static initialized = false;
    private static currentConfig: FlowAutomateConfig;

    private static ensureInitialized() {
        if (!this.initialized) {
            this.init();
        }
    }

    public static init() {
        const cfg = vscode.workspace.getConfiguration('flowAutomate');

        this.currentConfig = {
            gitlabUrl: cfg.get<string>('gitlabUrl') || '',
            gitlabToken: cfg.get<string>('gitlabToken') || '',
            branchProd: cfg.get<string>('branchProd') || '',
            branchStage: cfg.get<string>('branchStage') || '',
            jiraUrl: cfg.get<string>('jiraUrl') || '',
            jiraEmail: cfg.get<string>('jiraEmail') || '',
            jiraToken: cfg.get<string>('jiraToken') || '',
            jiraSectionName: cfg.get<string>('jiraSectionName') || '',
        };

        this.initialized = true;
        vscode.window.showInformationMessage('Налаштування Flow Automate змінено.');
    }

    public static get read(): FlowAutomateConfig {
        this.ensureInitialized();
        return this.currentConfig;
    }
}