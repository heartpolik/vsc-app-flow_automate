// lib/jira.ts
import axios from 'axios';
import * as vscode from 'vscode';

export async function postToJira(issueKey: string | null, mrUrl: string): Promise<void> {
  if (!issueKey) throw new Error('Не вдалося визначити ID задачі Jira');

  const config = vscode.workspace.getConfiguration('flowAutomate');
  const jiraUrl = config.get<string>('jiraUrl');
  const jiraEmail = config.get<string>('jiraEmail');
  const jiraToken = config.get<string>('jiraToken');

  if (!jiraUrl || !jiraEmail || !jiraToken) {
    throw new Error('Відсутні параметри Jira (URL, email або токен)');
  }

  const authHeader = {
    Authorization: 'Basic ' + Buffer.from(`${jiraEmail}:${jiraToken}`).toString('base64'),
    'Content-Type': 'application/json'
  };

  const url = `${jiraUrl}/rest/api/3/issue/${issueKey}/comment`;

  try {
    await axios.post(url, {
      body: {
        type: 'doc',
        version: 1,
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: `Створено Merge Request: ${mrUrl}`
              }
            ]
          }
        ]
      }
    }, { headers: authHeader });
  } catch (error: any) {
    console.error('Jira comment error:', error.response?.data || error.message);
    throw new Error('Не вдалося додати коментар до Jira');
  }
}