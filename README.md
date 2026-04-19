# Pipeline Notes

A very simple personal blog that is easy to host on GitHub Pages.

## What changed

This version is intentionally much simpler than the first design:

- one homepage
- one clean list of posts
- separate HTML file for each post
- no framework
- no build step

This makes it easier to understand, publish, and maintain.

## File structure

- `index.html` is the homepage and post archive.
- `styles.css` is the shared styling for the whole site.
- `posts/observability-for-data-pipelines.html` is a sample post.
- `posts/template.html` is the file you copy when writing a new post.
- `.nojekyll` keeps GitHub Pages from trying to process the site with Jekyll.

## How to write a new post

1. Copy `posts/template.html`.
2. Rename it to something like `posts/my-new-post.html`.
3. Edit the title, date, description, and article body.
4. Open `index.html`.
5. Add a new `<li class="post-row">...</li>` near the top of the post list.
6. Set the link to your new file, for example `posts/my-new-post.html`.

That is it. No build step is required.

## How to host on GitHub Pages

This repo will publish as a project site at:

`https://Harpal091.github.io/data-engineering-weekly`

To enable it:

1. Open the repository on GitHub.
2. Go to `Settings` -> `Pages`.
3. Under build and deployment, choose `Deploy from a branch`.
4. Select branch `main` and folder `/ (root)`.
5. Click `Save`.
6. Wait a minute or two for the first deployment.

## How to update the blog later

Every time you want to publish:

1. Create a new post file in `posts/`.
2. Add the new post to the list in `index.html`.
3. Commit and push to GitHub.
4. GitHub Pages will republish the site automatically.

## Good first content plan

If you feel confused about what to publish first, write only these three posts:

- One post about a pipeline incident or failure mode.
- One post about a warehouse or dbt modeling lesson.
- One post about a practical reliability checklist.

That is enough to make the site feel real.
