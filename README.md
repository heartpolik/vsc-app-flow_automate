# Flow Automate

**Flow Automate** is a simple Visual Studio Code extension that streamlines your development workflow by integrating Git, GitLab, and Jira into a unified command-driven experience.

## ✨ Features

- 🔀 Create GitLab Merge Requests from your current branch with a single command
- 🚀 (Option) Automatically push local branch before creating MRs
- 🧠 Detect project info and branch configuration from workspace
- 📝 Automatically update the **Implementation Details** section in Jira issues with MR links
<!-- - 🔄 Update `prod` branches across multiple repositories -->


## ⚙️ Configuration

Set extension settings in `settings.json` or via the VS Code Settings UI:

```json
"flowAutomate.gitlabUrl": "https://gitlab.com",
"flowAutomate.gitlabToken": "<your-gitlab-token>",
"flowAutomate.gitlabAutoPush": false,
"flowAutomate.branchProd": "prod",
"flowAutomate.branchStage": "stage",
"flowAutomate.jiraUrl": "https://yourcompany.atlassian.net",
"flowAutomate.jiraEmail": "<your-email>",
"flowAutomate.jiraToken": "<your-jira-api-token>"
"flowAutomate.jiraSectionName": "description"
```
#### 🧪 Beta

This extension is in active development. Feedback, bugs, and feature requests are welcome!