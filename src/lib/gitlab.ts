import * as vscode from 'vscode';
import { getCurrentBranchName } from './git';
import { SimpleGit } from 'simple-git';
import { Gitlab } from '@gitbeaker/rest';
import { Config } from '../Config';

export type mrResponce = {
  url: string;
  sourceBranch: string;
  targetBranch: string;
  repoName: string;
}
/**
 * Створює merge request
 */
export async function createMergeRequest(repo: SimpleGit, targetBranch: string, isProduction = false): Promise<mrResponce> {
  const currentBranch = await getCurrentBranchName(repo);
  if (!currentBranch || currentBranch === targetBranch) {
    throw new Error(`Fail to create MR ${currentBranch}->${targetBranch}`);
  }

  const origin = await repo.remote(['get-url', 'origin']);
  if (!origin) throw new Error('Unable to resolve origin URL');

  const projectId = await resolveGitLabProjectId(origin);

  // 🛠 Перевірка: чи поточна гілка запушена
  const remoteBranches = await repo.branch(['-r']);
  const remoteBranchFullName = `origin/${currentBranch}`;
  if (!remoteBranches.all.includes(remoteBranchFullName)) {
    const confirm = await vscode.window.showWarningMessage(
      `Гілка '${currentBranch}' ще не запушена. Запушити зараз?`,
      'Так', 'Скасувати'
    );
    if (confirm !== 'Так') throw new Error('Створення MR скасовано користувачем');

    await repo.push(['-u', 'origin', currentBranch]);
  }

  try {
    const api = new Gitlab({
      host: Config.read.gitlabUrl,
      token: Config.read.gitlabToken,
    });
    const repoName = (await api.Projects.show(projectId)).name;
    const mr = await api.MergeRequests.create(projectId, currentBranch, targetBranch, `Merge ${currentBranch} into ${targetBranch}`, {
      removeSourceBranch: !isProduction,
      squash: isProduction,
    });

    return {
      url: mr.web_url,
      sourceBranch: currentBranch,
      targetBranch,
      repoName,
    };
  } catch (error: any) {
    if (error.response?.status === 400) {
      throw new Error('MR already exists');
    } else {
      throw new Error(`GitLab API error: ${error.message}`);
    }
  }
}

/**
 * Визначає project ID GitLab проєкту автоматично
 */
async function resolveGitLabProjectId(origin: string): Promise<number> {
  const match = origin.trim().match(/[:\/]([^\/:]+\/[^\/.]+)(?:\.git)?$/);
  if (!match || !match[1]) {
    throw new Error('Не вдалося визначити GitLab remote path із URL: ' + origin);
  }
  const api = new Gitlab({
    host: Config.read.gitlabUrl,
    token: Config.read.gitlabToken,
  });
  const project = await api.Projects.show(match[1]);
  return project.id;
}