---
name: github_push
description: Robust workflow for initializing and pushing code to GitHub on Windows, handling initialization, identity, and PowerShell quirks.
---

# GitHub Push Skill

This skill provides a robust procedure for pushing changes to GitHub, specifically tailored for Windows PowerShell environments. It accounts for common errors like missing git repositories, unconfigured user identities, and shell syntax differences.

## 1. Environment & Syntax Checks
- **PowerShell Syntax**: When running multiple commands in one line, proper PowerShell syntax must be used.
  - **CORRECT**: `command1; command2`
  - **INCORRECT**: `command1 && command2`
- **Path handling**: Windows paths should be handled correctly.

## 2. Check Repository Status
Before attempting to push, always verify the current state.
```powershell
git status
```
- if "fatal: not a git repository", proceed to **Initialization**.
- if "nothing to commit, working tree clean", proceed to **Remote Check**.

## 3. Initialization (If needed)
If the project is not a git repo:
```powershell
git init
```

## 4. User Identity Configuration
Git will fail to commit if identity is unknown.
**Check identity**:
```powershell
git config user.name
git config user.email
```
If empty, set the USER specific identity (based on project history or user preference). For this user (cjlacout-ghb):
```powershell
git config user.name "cjlacout-ghb"
git config user.email "cjlacout-ghb@users.noreply.github.com"
```

## 5. Staging and Committing
Stage all files and commit.
```powershell
git add .
git commit -m "Your commit message here"
```

## 6. Remote Configuration
Check if the remote exists.
```powershell
git remote -v
```
- If no result, add the origin:
```powershell
git remote add origin <REPO_URL>
```
- If origin exists but is wrong, `git remote set-url origin <REPO_URL>` (only if requested).

## 7. Branch renaming and Pushing
Ensure the branch is named `main` (modern default) and push.
```powershell
git branch -M main
git push -u origin main
```
*Note: Using `-u` ensures the upstream is set for future pushes.*

## Example Combined Command (PowerShell)
To perform these actions efficiently in a single step (if you are confident in the state):
```powershell
git config user.name "cjlacout-ghb"; git config user.email "cjlacout-ghb@users.noreply.github.com"; git add .; git commit -m "Update"; git push origin main
```
*Note the use of semicolons `;` instead of `&&`.*
