import axios from 'axios';
import * as vscode from 'vscode';
import { promisify } from 'util';
import { exec } from 'child_process';
import { getGitRemoteUrl } from './git';

const execAsync = promisify(exec);

const config = vscode.workspace.getConfiguration('flowAutomate');
const workspacePath = vscode.workspace.workspaceFolders?.[0].uri.fsPath ?? process.cwd();

/**
 * Створює merge request
 */
export async function createMergeRequest(sourceBranch: string, targetBranch: string, isProduction = false): Promise<string> {
  
  const gitlabUrl = config.get<string>('gitlabUrl')!;
  const token = config.get<string>('gitlabToken')!;

  const projectId = await resolveGitLabProjectId(gitlabUrl, token);

  const url = `${gitlabUrl}/api/v4/projects/${projectId}/merge_requests`;

  const response = await axios.post(
    url,
    {
      source_branch: sourceBranch,
      target_branch: targetBranch,
      title: `Merge ${sourceBranch} into ${targetBranch}`,
      remove_source_branch: !isProduction,
      squash: isProduction
    },
    {
      headers: {
        'PRIVATE-TOKEN': token
      }
    }
  );

  return response.data.web_url;
}

/**
 * Визначає project ID GitLab проєкту автоматично
 */
async function resolveGitLabProjectId(gitlabUrl: string, token: string): Promise<number> {
  const origin = await getGitRemoteUrl();
  const match = origin.trim().match(/[:\/]([^\/:]+\/[^\/.]+)(?:\.git)?$/);

  console.log(match);
  if (!match || !match[1]) {
    throw new Error('Не вдалося визначити GitLab remote path із URL: ' + origin);
  }
  const url = `${gitlabUrl}/api/v4/projects/${encodeURIComponent(match[1])}`;

  const response = await axios.get(url, {
    headers: {
      'PRIVATE-TOKEN': token
    }
  });

  return response.data.id;
}

export async function debugg() {
  console.log(await resolveGitLabProjectId(config.get<string>('gitlabUrl')!, config.get<string>('gitlabToken')!));
}

