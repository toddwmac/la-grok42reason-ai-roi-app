# GitHub Pages Deployment Prompt Template

Use this prompt to prepare any Vite/React repository for automatic GitHub Pages deployment.

---

## Copy and paste this prompt to set up GitHub Pages deployment:

```
I need to set up automatic GitHub Pages deployment for this Vite/React project.

Please:

1. Create a standard .gitignore file to exclude node_modules, dist, build, and other common files that shouldn't be tracked in git

2. Create a GitHub Actions workflow file at .github/workflows/deploy.yml that:
   - Triggers on push to the main branch
   - Sets up Node.js (version 20)
   - Installs dependencies with npm ci
   - Runs npm run build
   - Deploys the dist folder to GitHub Pages using the official actions/deploy-pages@v4 action
   - Has proper permissions (contents: read, pages: write, id-token: write)
   - Uses concurrency to prevent overlapping deployments

3. Update the vite.config.ts file to add a base path configuration for GitHub Pages
   - The base path should be '/REPOSITORY_NAME/' where REPOSITORY_NAME is the name of this repository
   - This ensures assets load correctly when deployed to GitHub Pages

4. Create a gh-pages-deploy.md README file that documents:
   - Overview of the deployment setup
   - What files were created/modified
   - How the workflow works
   - Step-by-step instructions for first-time deployment
   - How to manually trigger deployments
   - Troubleshooting common issues

5. Verify that the .gitignore file includes all necessary exclusions for a Node.js/Vite project

After implementing these changes, provide a summary of what was created and the next steps to deploy.
```

---

## Customization Notes:

- Replace `REPOSITORY_NAME` with the actual repository name
- If using a different branch name (not `main`), update the workflow trigger
- If using Yarn instead of npm, change `npm ci` to `yarn install --frozen-lockfile`
- If using a different Node.js version, update `node-version: '20'` accordingly

---

## What This Prompt Will Create:

1. **.github/workflows/deploy.yml** - GitHub Actions workflow
2. **Updated vite.config.ts** - With base path for GitHub Pages
3. **gh-pages-deploy.md** - Comprehensive deployment documentation
4. **Verified .gitignore** - Complete with all necessary exclusions