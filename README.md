# Flow Automate

**Flow Automate** is a simple Visual Studio Code extension that streamlines your development workflow by integrating Git, GitLab, and Jira into a unified command-driven experience.

## ✨ Features

- 🔀 Create GitLab Merge Requests from your current branch with a single command
- 🚀 Automatically push local branches before creating MRs
- 🔄 Update `prod` branches across multiple repositories
- 🧠 Detect project info and branch configuration from workspace
- 📝 Automatically update the **Implementation Details** section in Jira issues with MR links
- 📋 Organize Merge Requests grouped by Jira issue
- 🧰 Command-based architecture for maximum flexibility

## ⚙️ Configuration

Set extension settings in `settings.json` or via the VS Code Settings UI:

```json
"flowAutomate.gitlabUrl": "https://gitlab.com",
"flowAutomate.gitlabToken": "<your-gitlab-token>",
"flowAutomate.branchProd": "prod",
"flowAutomate.branchStage": "stage",
"flowAutomate.jiraUrl": "https://yourcompany.atlassian.net",
"flowAutomate.jiraEmail": "<your-email>",
"flowAutomate.jiraToken": "<your-jira-api-token>"
```
#### 🧪 Beta

This extension is in active development. Feedback, bugs, and feature requests are welcome!