# GitHub Pages Setup Instructions

This folder contains the Privacy Policy page for Lunaria that will be published on GitHub Pages.

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

5. **Access your Privacy Policy**:
   - Your Privacy Policy will be available at:
     `https://[your-username].github.io/[repository-name]/`
   - For example: `https://louislam09.github.io/lunaria/`

## Updating the Privacy Policy

To update the Privacy Policy:

1. Edit `docs/index.html` in your repository
2. Commit and push the changes
3. GitHub Pages will automatically rebuild and deploy (usually within 1-2 minutes)

## Custom Domain (Optional)

If you want to use a custom domain:

1. Add a `CNAME` file in the `docs` folder with your domain name
2. Configure DNS settings with your domain provider
3. Update the domain in GitHub Pages settings

## Notes

- The Privacy Policy page includes both English and Spanish versions
- Users can toggle between languages using the buttons at the top
- The page is mobile-responsive and styled to match Lunaria's design
- The "Last Updated" date is automatically set to today's date when the page loads

