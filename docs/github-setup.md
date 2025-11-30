# GitHub Setup Guide

Follow these steps to push your MyNest app to GitHub before deploying.

## Step 1: Initialize Git Repository

```bash
cd /Users/sarahabdulla/Desktop/mynest_app
git init
```

## Step 2: Create .gitignore (Already Created)

The `.gitignore` file has been created in the root directory. It excludes:
- `node_modules/`
- `.env` files (to protect secrets)
- `dist/` and `build/` folders
- OS and IDE files

## Step 3: Add All Files

```bash
git add .
```

## Step 4: Create Initial Commit

```bash
git commit -m "Initial commit: MyNest childcare coordination app"
```

## Step 5: Create GitHub Repository

1. Go to https://github.com
2. Click **"+"** → **"New repository"**
3. Repository name: `mynest-app` (or your preferred name)
4. Description: "AI-assisted childcare coordination platform for families and caregivers"
5. Choose **Public** or **Private**
6. **DO NOT** initialize with README, .gitignore, or license (we already have these)
7. Click **"Create repository"**

## Step 6: Connect and Push

GitHub will show you commands. Use these:

```bash
# Add remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/mynest-app.git

# Rename branch to main (if needed)
git branch -M main

# Push to GitHub
git push -u origin main
```

## Step 7: Verify

1. Go to your GitHub repository page
2. Verify all files are there
3. Check that `.env` files are NOT included (they should be ignored)

## Important: Environment Variables

**Never commit `.env` files!** They contain sensitive information:
- Firebase credentials
- Database passwords
- API keys

The `.gitignore` file should prevent this, but double-check before pushing.

## Next Steps

After pushing to GitHub:
1. Follow `DEPLOYMENT.md` for cloud deployment
2. Railway and Vercel can now connect to your GitHub repo
3. Deployments will be automatic on git push

## Troubleshooting

### If you get "repository not found"
- Check the repository URL is correct
- Verify you have access to the repository
- Try using SSH instead: `git@github.com:USERNAME/REPO.git`

### If you get authentication errors
- Use GitHub Personal Access Token instead of password
- Or set up SSH keys: https://docs.github.com/en/authentication/connecting-to-github-with-ssh

### If .env files are being tracked
```bash
# Remove from git (but keep local file)
git rm --cached backend/.env
git rm --cached frontend/.env
git commit -m "Remove .env files from tracking"
```

