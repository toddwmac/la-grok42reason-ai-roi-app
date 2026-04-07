# GitHub Pages Deployment Guide

This document provides complete documentation for deploying this Vite/React application to GitHub Pages using GitHub Actions.

---

## Overview

This project is configured for **automatic deployment to GitHub Pages**. Every push to the `main` branch triggers a build and deployment workflow, eliminating manual deployment steps.

**Deployment URL:** `https://yourusername.github.io/la-gemini31pro-ai-roi-app/`

---

## What Was Set Up

### Files Created

#### 1. `.github/workflows/deploy.yml`
GitHub Actions workflow that automates the deployment process. It:
- Triggers on push to `main` branch
- Sets up Node.js 20 environment
- Installs dependencies using `npm ci`
- Builds the production bundle with `npm run build`
- Deploys the `dist` folder to GitHub Pages

#### 2. `gh-pages-prompt-template.md`
A reusable prompt template that can be used to set up GitHub Pages deployment on any similar Vite/React project.

### Files Modified

#### 3. `vite.config.ts`
Added `base: '/la-gemini31pro-ai-roi-app/'` configuration to ensure assets load correctly when deployed to GitHub Pages.

#### 4. `.gitignore`
Standard `.gitignore` file that excludes:
- `node_modules/` - npm dependencies
- `/dist`, `/build` - Build output directories
- `.env*` - Environment files
- Editor and OS-specific files

---

## How the Deployment Works

### Automated Workflow

```
Push to main → GitHub Actions triggers → 
Install dependencies → Build app → 
Upload dist folder → Deploy to GitHub Pages
```

### Workflow Steps

1. **Checkout** - Retrieves the latest code from the repository
2. **Setup Node.js** - Configures Node.js 20 with npm caching
3. **Install dependencies** - Runs `npm ci` for clean, reproducible installs
4. **Build** - Runs `npm run build` to create the production bundle in `dist/`
5. **Setup Pages** - Configures GitHub Pages environment
6. **Upload artifact** - Uploads the `dist` folder as a deployment artifact
7. **Deploy** - Publishes the artifact to GitHub Pages

---

## First-Time Deployment

### Step 1: Push Code to GitHub

```bash
# Add all files
git add .

# Commit changes
git commit -m "Add GitHub Pages deployment workflow"

# Push to main branch
git push origin main
```

### Step 2: Configure GitHub Pages Settings

1. Navigate to your repository on GitHub
2. Go to **Settings** → **Pages** (in the sidebar)
3. Under **Build and deployment** → **Source**, select **GitHub Actions**
4. Click **Save**

### Step 3: Monitor Deployment

1. Go to the **Actions** tab in your repository
2. You'll see the "Deploy to GitHub Pages" workflow running
3. Wait for the workflow to complete (typically 2-3 minutes)
4. Once complete, your site will be live at the deployment URL

---

## Manual Deployment

You can manually trigger a deployment without pushing code:

1. Go to the **Actions** tab in your repository
2. Select **Deploy to GitHub Pages** workflow
3. Click **Run workflow** button
4. Select the `main` branch
5. Click **Run workflow**

---

## Workflow Configuration

### Trigger Branch

The workflow triggers on the `main` branch. To change this:

```yaml
on:
  push:
    branches: [your-branch-name]
```

### Node.js Version

Currently using Node.js 20. To change:

```yaml
- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: '18'  # Change to your preferred version
```

### Package Manager

For Yarn projects, replace `npm ci` with:

```yaml
- name: Install dependencies
  run: yarn install --frozen-lockfile
```

---

## Troubleshooting

### Deployment Fails - Build Errors

**Problem:** Workflow fails during the build step

**Solutions:**
- Check the build logs in the Actions tab
- Run `npm run build` locally to reproduce the error
- Ensure all dependencies are properly listed in `package.json`

### Deployment Succeeds - Blank Page

**Problem:** Site loads but shows a blank screen

**Solution:** Check browser console for 404 errors. This usually means the `base` path in `vite.config.ts` doesn't match your repository name. Update:
```typescript
base: '/your-repository-name/',
```

### Assets Not Loading

**Problem:** CSS, images, or other assets return 404 errors

**Solution:** Ensure the `base` configuration in `vite.config.ts` includes a trailing slash:
```typescript
base: '/repository-name/',  // ✅ Correct
base: '/repository-name'    // ❌ Missing trailing slash
```

### GitHub Pages Settings Not Showing

**Problem:** Can't find Pages settings in repository

**Solutions:**
- Ensure you have repository owner or maintainer permissions
- Check if GitHub Pages is enabled for your organization
- Try accessing via direct URL: `https://github.com/username/repo/pages`

### Deployment Takes Too Long

**Problem:** Workflow runs for more than 10 minutes

**Solutions:**
- Check if `npm ci` is hanging (try clearing npm cache)
- Reduce bundle size by optimizing imports
- Consider using GitHub Actions caching for dependencies

---

## File Structure After Setup

```
your-repo/
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions workflow
├── src/                        # Source code
├── dist/                       # Build output (created during build)
├── .gitignore                  # Git ignore rules
├── vite.config.ts              # Vite configuration with base path
├── package.json                # Dependencies and scripts
└── gh-pages-deploy.md          # This documentation
```

---

## Environment Variables

If your app needs environment variables:

1. Add them to your repository under **Settings** → **Secrets and variables** → **Actions**
2. Reference them in the workflow:
```yaml
- name: Build
  run: npm run build
  env:
    VITE_API_KEY: ${{ secrets.API_KEY }}
```

3. Access them in your code:
```typescript
const apiKey = import.meta.env.VITE_API_KEY
```

---

## Custom Domain (Optional)

To use a custom domain with GitHub Pages:

1. Create a `CNAME` file in your project root with your domain:
   ```
   www.yourdomain.com
   ```
2. Configure DNS settings with your domain provider
3. Update GitHub Pages settings to recognize the custom domain
4. Update the `base` path in `vite.config.ts` if needed

---

## Best Practices

✅ **Do:**
- Keep the `main` branch deploy-ready
- Test builds locally before pushing
- Monitor workflow runs for failures
- Use semantic versioning for releases
- Keep dependencies up to date

❌ **Don't:**
- Push broken code to `main`
- Commit sensitive data (API keys, secrets)
- Ignore workflow failures
- Modify the workflow without testing
- Forget to update `base` path when renaming repository

---

## Additional Resources

- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html#github-pages)
- [GitHub Actions Deploy Pages Action](https://github.com/actions/deploy-pages)

---

## Support

If you encounter issues not covered in this guide:

1. Check the [GitHub Actions workflow logs](https://github.com/yourusername/repo/actions)
2. Review the [GitHub Pages status page](https://www.githubstatus.com/)
3. Search [GitHub Community Forums](https://github.community/)

---

**Last Updated:** 2026-04-07