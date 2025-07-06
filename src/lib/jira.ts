// lib/jira.ts
import axios from 'axios';
import * as vscode from 'vscode';
import { Config } from '../Config';

export async function postToJira(issueKey: string | null, mrUrl: string): Promise<void> {
  if (!issueKey) throw new Error('Не вдалося визначити ID задачі Jira');

  const jiraUrl = Config.read.jiraUrl;
  const jiraEmail = Config.read.jiraEmail;
  const jiraToken = Config.read.jiraToken;

  if (!jiraUrl || !jiraEmail || !jiraToken) {
    throw new Error('Відсутні параметри Jira (URL, email або токен)');
  }

  const authHeader = {
    Authorization: 'Basic ' + Buffer.from(`${jiraEmail}:${jiraToken}`).toString('base64'),
    'Content-Type': 'application/json'
  };

  function generateImplementationDetailsSection(groupedMRs: Record<string, string[]>): string {
    const lines = ['### Деталі реалізації', ''];

    for (const [repo, urls] of Object.entries(groupedMRs)) {
      lines.push(`**${repo}**`);
      for (const url of urls) {
        const mrId = url.match(/merge_requests\/(\d+)/)?.[1] || '';
        lines.push(`- [!${mrId}](${url})`);
      }
      lines.push('');
    }

    return lines.join('\n');
  }

  const url = `${jiraUrl}/rest/api/3/issue/${issueKey}/comment`;

  const body = {
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
  };

  try {
    await axios.post(url, {
      body
    }, { headers: authHeader });

  } catch (error: any) {
    console.error('Jira comment error:', error.response?.data || error.message);
    throw new Error('Не вдалося додати коментар до Jira');
  }
}

function mergeMrIntoJiraAdfDescription(adf: any, repoName: string, mrUrl: string): any {
  const repoHeaderText = repoName;
  const sectionTitle = "Merge requests 🔀";
  const sectionHeading = {
    type: 'heading',
    attrs: { level: 3 },
    content: [{ type: 'text', text: sectionTitle }]
  };

  const mrItem = {
    type: 'paragraph',
    content: [
      { type: 'text', text: `${repoHeaderText} `, marks: [{ type: 'strong' }] },
      {
        type: 'text',
        text: mrUrl,
        marks: [{ type: 'link', attrs: { href: mrUrl } }]
      }
    ]
  };

  const content = adf.content || [];

  // Пошук секції
  let sectionIndex = content.findIndex((n: { type: string; attrs: { level: number; }; content: { text: string; }[]; }) =>
    n.type === 'heading' &&
    n.attrs?.level === 3 &&
    n.content?.[0]?.text === sectionTitle
  );

  if (sectionIndex === -1) {
    // Додаємо нову секцію
    return {
      ...adf,
      content: [...content, sectionHeading, mrItem]
    };
  }

  // Визначаємо, де починається наступна секція
  let insertIndex = sectionIndex + 1;
  while (
    insertIndex < content.length &&
    !(content[insertIndex].type === 'heading' && content[insertIndex].attrs?.level === 3)
  ) {
    insertIndex++;
  }

  // Перевіряємо, чи є блок для цього репо
  let repoHeaderIndex = -1;
  for (let i = sectionIndex + 1; i < insertIndex; i++) {
    const node = content[i];
    if (
      node.type === 'paragraph' &&
      node.content?.[0]?.text === repoHeaderText &&
      node.content?.[0]?.marks?.some((m: any) => m.type === 'strong')
    ) {
      repoHeaderIndex = i;
      break;
    }
  }

  // Перевірка на дубль
  const mrExists = content.some((n: { type: string; content: any[]; }) =>
    n.type === 'paragraph' &&
    n.content?.some((c: any) => c.marks?.some((m: any) => m.attrs?.href === mrUrl))
  );

  if (mrExists) {
    return adf;
  }

  const updated = [...content];

  if (repoHeaderIndex === -1) {
    // Додати новий блок для репо
    updated.splice(insertIndex, 0, mrItem);
  } else {
    // Вставити MR після repoHeader
    let i = repoHeaderIndex + 1;
    while (i < insertIndex && updated[i].type === 'paragraph' && updated[i].content?.[0]?.text?.startsWith('-')) {
      i++;
    }
    updated.splice(i, 0, mrItem);
  }

  return {
    ...adf,
    content: updated
  };
}

export async function addMrToJiraIssue(issueKey: string, repoName: string, mrUrl: string) {
  const section = Config.read.jiraSectionName;
  const url = `${Config.read.jiraUrl}/rest/api/3/issue/${issueKey}`;

  const authHeaders = {
    Authorization: `Basic ${Buffer.from(`${Config.read.jiraEmail}:${Config.read.jiraToken}`).toString('base64')}`,
    'Content-Type': 'application/json',
    Accept: 'application/json'
  };

  const issueResponse = await axios.get(url, { headers: authHeaders });
  const adfDoc = issueResponse.data.fields[section];

  if (!adfDoc) throw new Error(`Section ${section} does not exists. Contact to your Jira administrator`);

  const updatedAdf = mergeMrIntoJiraAdfDescription(adfDoc, repoName, mrUrl);

  const fields: any = {};
  fields[section] = updatedAdf;

  await axios.put(url, {
    fields
  }, { headers: authHeaders });

  vscode.window.showInformationMessage(`Додано MR до задачі ${issueKey}`);
}