# GitHub Pages Setup Instructions

This folder contains the Privacy Policy and Delete Account pages for Lunaria that will be published on GitHub Pages.

## How to Enable GitHub Pages

1. **Push this repository to GitHub** (if you haven't already)

2. **Go to your repository settings on GitHub**:
   - Navigate to your repository on GitHub
   - Click on "Settings" tab
   - Scroll down to "Pages" in the left sidebar

3. **Configure GitHub Pages**:
   - Under "Source", select "Deploy from a branch"
   - Choose "main" (or "master") branch
   - Select "/docs" folder
   - Click "Save"

4. **Wait for deployment**:
   - GitHub will build and deploy your site
   - It usually takes 1-2 minutes
   - You'll see a green checkmark when it's ready

5. **Access your pages**:
   - Privacy Policy: `https://[your-username].github.io/[repository-name]/`
   - Delete Account: `https://[your-username].github.io/[repository-name]/lunaria/delete-account.html`
   - For example: 
     - `https://louislam09.github.io/lunaria/` (Privacy Policy)
     - `https://louislam09.github.io/lunaria/lunaria/delete-account.html` (Delete Account)

## Updating Pages

To update the Privacy Policy or Delete Account page:

1. Edit the corresponding HTML file:
   - Privacy Policy: `docs/index.html`
   - Delete Account: `docs/lunaria/delete-account.html`
2. Commit and push the changes
3. GitHub Pages will automatically rebuild and deploy (usually within 1-2 minutes)

## Custom Domain (Optional)

If you want to use a custom domain:

1. Add a `CNAME` file in the `docs` folder with your domain name
2. Configure DNS settings with your domain provider
3. Update the domain in GitHub Pages settings

## Notes

- Both pages include English and Spanish versions with language toggle
- Pages are mobile-responsive and styled to match Lunaria's design
- Privacy Policy "Last Updated" date is automatically set to today's date when the page loads

## URLs for Google Play Console

When submitting to Google Play, use these URLs:

- **Privacy Policy URL**: `https://[your-username].github.io/[repository-name]/`
- **Delete Account URL**: `https://[your-username].github.io/[repository-name]/lunaria/delete-account.html`

If you configure a custom domain (e.g., `luismartinez.site`), you can use:
- `https://luismartinez.site/lunaria/delete-account` (after setting up redirect or custom domain)

