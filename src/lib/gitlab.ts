import axios from 'axios';
import * as vscode from 'vscode';
import { promisify } from 'util';
import { exec } from 'child_process';

const execAsync = promisify(exec);

/**
 * Створює merge request із поточної гілки в prod
 */
export async function createMergeRequest(sourceBranch: string, mergeTarget: string): Promise<string> {
  const config = vscode.workspace.getConfiguration('flowAutomate');
  const gitlabUrl = config.get<string>('gitlabUrl')!;
  const token = config.get<string>('gitlabToken')!;
  const targetBaranch = config.get<string>(`branch${mergeTarget}`)!;

  const isProduction:Boolean = mergeTarget === 'Prod';
  
  const projectId = await resolveGitLabProjectId(gitlabUrl, token);

  const url = `${gitlabUrl}/api/v4/projects/${projectId}/merge_requests`;

  const response = await axios.post(
    url,
    {
      source_branch: sourceBranch,
      target_branch: targetBaranch,
      title: `Merge ${sourceBranch} into ${targetBaranch}`,
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
  const repoPath = await getGitRemotePath();
  const url = `${gitlabUrl}/api/v4/projects/${encodeURIComponent(repoPath)}`;

  const response = await axios.get(url, {
    headers: {
      'PRIVATE-TOKEN': token
    }
  });

  return response.data.id;
}

/**
 * Витягує шлях до репозиторію у форматі group/project
 */
async function getGitRemotePath(): Promise<string> {
  const { stdout } = await execAsync('git config --get remote.origin.url');
  const remoteUrl = stdout.trim();

  // Підтримка HTTPS та SSH URL
  // https://gitlab.com/group/project.git
  // git@gitlab.com:group/project.git
  const match = remoteUrl.match(/[:\/]([^\/:]+\/[^\/.]+)(?:\.git)?$/);
  if (!match || !match[1]) {
    throw new Error('Не вдалося визначити GitLab remote path із URL: ' + remoteUrl);
  }

  return match[1];
}