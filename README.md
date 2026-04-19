# Harpal Singh - Data Engineering Notes

A public blog served by GitHub Pages, with a hidden admin workflow for publishing new
posts through a Netlify function that writes back to the repo.

## What is in this repo

- `index.html` is the public homepage and archive.
- `styles.css` is the shared public styling.
- `script.js` powers topic filtering on the homepage.
- `admin.html` is the hidden writing UI.
- `admin.css` and `admin.js` power the admin experience.
- `posts/` contains published HTML posts served by GitHub Pages.
- `content/posts/` stores Markdown source for posts published through the admin flow.
- `netlify/functions/publish-post.js` publishes new posts into the repo.
- `netlify.toml` configures Netlify for the publishing backend.

## Public hosting

GitHub Pages can continue serving the public site from this repository.

## Admin publishing flow

The admin UI is available at:

- `admin.html`

It is intentionally not linked from the public homepage.

The publishing flow works like this:

1. Open the admin page.
2. Write a post in Markdown.
3. Preview the rendered result.
4. Publish through a Netlify function.
5. The Netlify function writes:
   - a Markdown source file to `content/posts/`
   - a rendered HTML file to `posts/`
   - a new archive row to `index.html`

## Netlify setup

Deploy this repo to Netlify as well so the publishing backend has a home.

Required environment variables:

- `GITHUB_TOKEN`
- `ADMIN_SECRET`
- `GITHUB_OWNER`
- `GITHUB_REPO`
- `SITE_BASE_URL`

Recommended values for this repo:

- `GITHUB_OWNER=Harpal091`
- `GITHUB_REPO=data-engineering-weekly`
- `SITE_BASE_URL=https://harpal091.github.io/data-engineering-weekly`

`GITHUB_TOKEN` must be a GitHub token with permission to update repository contents.

`ADMIN_SECRET` is a shared secret used by the hidden admin page when publishing.

## Notes about the admin page

If you open `admin.html` on GitHub Pages, the default publishing endpoint will not be
correct for repo writes because GitHub Pages does not run Netlify functions.

You have two options:

1. Open the admin page from the Netlify deployment of this repo.
2. Or keep using the GitHub Pages version of `admin.html` and paste your Netlify function
   URL into the `Publishing endpoint` field.

Example endpoint:

`https://YOUR-NETLIFY-SITE.netlify.app/.netlify/functions/publish-post`

## Current limitations

- v1 supports creating new posts only
- no post editing UI yet
- no draft management UI yet
- no rich text editor yet
- markdown preview is lightweight but practical
