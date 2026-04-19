const GITHUB_API = "https://api.github.com";

const corsHeaders = (origin) => ({
  "Access-Control-Allow-Origin": origin || "*",
  "Access-Control-Allow-Headers": "Content-Type, X-Admin-Secret",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
});

const escapeHtml = (value) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");

const renderInlineMarkdown = (text) => {
  let html = escapeHtml(text);
  html = html.replace(/`([^`]+)`/g, "<code>$1</code>");
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  html = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*([^*]+)\*/g, "<em>$1</em>");
  return html;
};

const renderMarkdown = (markdown) => {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const html = [];
  let paragraph = [];
  let listType = null;
  let listItems = [];
  let inCodeBlock = false;
  let codeLines = [];
  let quoteLines = [];

  const flushParagraph = () => {
    if (!paragraph.length) {
      return;
    }
    html.push(`<p>${renderInlineMarkdown(paragraph.join(" "))}</p>`);
    paragraph = [];
  };

  const flushList = () => {
    if (!listItems.length || !listType) {
      return;
    }
    const items = listItems.map((item) => `<li>${renderInlineMarkdown(item)}</li>`).join("");
    html.push(`<${listType}>${items}</${listType}>`);
    listItems = [];
    listType = null;
  };

  const flushQuote = () => {
    if (!quoteLines.length) {
      return;
    }
    html.push(`<blockquote><p>${renderInlineMarkdown(quoteLines.join(" "))}</p></blockquote>`);
    quoteLines = [];
  };

  const flushCodeBlock = () => {
    if (!inCodeBlock) {
      return;
    }
    html.push(`<pre><code>${escapeHtml(codeLines.join("\n"))}</code></pre>`);
    inCodeBlock = false;
    codeLines = [];
  };

  lines.forEach((line) => {
    const trimmed = line.trim();

    if (trimmed.startsWith("```")) {
      flushParagraph();
      flushList();
      flushQuote();
      if (inCodeBlock) {
        flushCodeBlock();
      } else {
        inCodeBlock = true;
      }
      return;
    }

    if (inCodeBlock) {
      codeLines.push(line);
      return;
    }

    if (!trimmed) {
      flushParagraph();
      flushList();
      flushQuote();
      return;
    }

    if (trimmed.startsWith("> ")) {
      flushParagraph();
      flushList();
      quoteLines.push(trimmed.slice(2));
      return;
    }

    flushQuote();

    const headingMatch = trimmed.match(/^(#{1,3})\s+(.*)$/);
    if (headingMatch) {
      flushParagraph();
      flushList();
      const level = headingMatch[1].length;
      html.push(`<h${level + 1}>${renderInlineMarkdown(headingMatch[2])}</h${level + 1}>`);
      return;
    }

    const unorderedMatch = trimmed.match(/^[-*]\s+(.*)$/);
    if (unorderedMatch) {
      flushParagraph();
      if (listType && listType !== "ul") {
        flushList();
      }
      listType = "ul";
      listItems.push(unorderedMatch[1]);
      return;
    }

    const orderedMatch = trimmed.match(/^\d+\.\s+(.*)$/);
    if (orderedMatch) {
      flushParagraph();
      if (listType && listType !== "ol") {
        flushList();
      }
      listType = "ol";
      listItems.push(orderedMatch[1]);
      return;
    }

    flushList();
    paragraph.push(trimmed);
  });

  flushParagraph();
  flushList();
  flushQuote();
  flushCodeBlock();

  return html.join("\n");
};

const slugify = (value) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

const topicLabels = {
  "data-pipelines": "Data pipelines",
  "airflow-and-orchestration": "Airflow",
  "dbt-and-modeling": "dbt and modeling",
  "data-quality": "Data quality",
  "warehouse-design": "Warehouse design",
  "platform-reliability": "Platform reliability"
};

const buildMetadataLine = (date, topics) =>
  `${date} | ${topics.map((topic) => topicLabels[topic] || topic).join(" | ")}`;

const buildPostHtml = ({ title, summary, date, topics, markdownBody }) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)} | Harpal Singh - Data Engineering Notes</title>
  <meta
    name="description"
    content="${escapeHtml(summary)}"
  >
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link
    href="https://fonts.googleapis.com/css2?family=Newsreader:opsz,wght@6..72,400;6..72,600;6..72,700&family=IBM+Plex+Sans:wght@400;500;600&display=swap"
    rel="stylesheet"
  >
  <link rel="stylesheet" href="../styles.css">
</head>
<body>
  <div class="page-shell">
    <header class="site-header">
      <div class="brand-block">
        <a class="site-brand" href="../index.html">Harpal Singh</a>
        <p class="site-kicker">Data Engineering Notes</p>
      </div>
      <nav class="site-nav" aria-label="Primary">
        <a href="../index.html#posts">Posts</a>
        <a href="../index.html#about">About</a>
        <a href="https://www.linkedin.com/in/harpal-singh091/">LinkedIn</a>
      </nav>
    </header>

    <main class="post-article">
      <div class="post-meta">${escapeHtml(buildMetadataLine(date, topics))}</div>
      <h1>${escapeHtml(title)}</h1>
      ${renderMarkdown(markdownBody)}
      <a class="back-link" href="../index.html">Back to all posts</a>
    </main>

    <footer class="site-footer">
      <p>Harpal Singh</p>
      <p>Data Engineering Notes</p>
    </footer>
  </div>
</body>
</html>
`;

const buildMarkdownSource = ({ title, summary, date, slug, topics, markdownBody }) => `---
title: "${title.replace(/\"/g, '\\"')}"
summary: "${summary.replace(/\"/g, '\\"')}"
date: "${date}"
slug: "${slug}"
topics:
${topics.map((topic) => `  - ${topic}`).join("\n")}
---

${markdownBody}
`;

const archiveRowHtml = ({ title, summary, date, slug, topics }) => `          <li class="post-row" data-topics="${topics.join(" ")}">
            <time datetime="${date}">${formatDateForArchive(date)}</time>
            <div class="post-main">
              <a href="posts/${slug}.html">${escapeHtml(title)}</a>
              <p>${escapeHtml(summary)}</p>
            </div>
          </li>`;

const formatDateForArchive = (dateString) => {
  const date = new Date(`${dateString}T00:00:00`);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(date);
};

const githubRequest = async (path, options = {}) => {
  const token = process.env.GITHUB_TOKEN;
  const owner = process.env.GITHUB_OWNER || "Harpal091";
  const repo = process.env.GITHUB_REPO || "data-engineering-weekly";

  const response = await fetch(`${GITHUB_API}/repos/${owner}/${repo}/contents/${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "User-Agent": "harpal-blog-publisher",
      ...(options.headers || {})
    }
  });

  return response;
};

const fetchFile = async (path) => {
  const response = await githubRequest(path);
  if (response.status === 404) {
    return null;
  }
  if (!response.ok) {
    throw new Error(`Failed to read ${path}.`);
  }

  const payload = await response.json();
  return {
    sha: payload.sha,
    content: Buffer.from(payload.content, "base64").toString("utf8")
  };
};

const writeFile = async ({ path, content, sha, message }) => {
  const response = await githubRequest(path, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      message,
      content: Buffer.from(content, "utf8").toString("base64"),
      ...(sha ? { sha } : {})
    })
  });

  if (!response.ok) {
    const payload = await response.text();
    throw new Error(`Failed to write ${path}: ${payload}`);
  }
};

const insertArchiveRow = (indexHtml, rowHtml) => {
  const startMarker = "<!-- POST_LIST_START -->";
  const endMarker = "<!-- POST_LIST_END -->";

  const start = indexHtml.indexOf(startMarker);
  const end = indexHtml.indexOf(endMarker);

  if (start === -1 || end === -1 || end <= start) {
    throw new Error("Homepage archive markers were not found.");
  }

  const before = indexHtml.slice(0, start + startMarker.length);
  const between = indexHtml.slice(start + startMarker.length, end).trim();
  const after = indexHtml.slice(end);
  const nextBetween = `${rowHtml}\n${between}`;

  return `${before}\n${nextBetween}\n          ${after.trimStart()}`;
};

exports.handler = async (event) => {
  const origin = event.headers.origin || "";

  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 204,
      headers: corsHeaders(origin),
      body: ""
    };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: corsHeaders(origin),
      body: JSON.stringify({ error: "Method not allowed." })
    };
  }

  if (!process.env.GITHUB_TOKEN || !process.env.ADMIN_SECRET) {
    return {
      statusCode: 500,
      headers: corsHeaders(origin),
      body: JSON.stringify({ error: "Server is missing required environment variables." })
    };
  }

  if ((event.headers["x-admin-secret"] || "") !== process.env.ADMIN_SECRET) {
    return {
      statusCode: 401,
      headers: corsHeaders(origin),
      body: JSON.stringify({ error: "Invalid admin secret." })
    };
  }

  try {
    const payload = JSON.parse(event.body || "{}");
    const title = (payload.title || "").trim();
    const summary = (payload.summary || "").trim();
    const date = (payload.date || "").trim();
    const markdownBody = (payload.markdownBody || "").trim();
    const topics = Array.isArray(payload.topics) ? payload.topics.filter(Boolean) : [];
    const slug = slugify(payload.slug || payload.title || "");

    if (!title || !summary || !date || !markdownBody || !slug) {
      throw new Error("Title, summary, date, body, and slug are required.");
    }

    if (!topics.length) {
      throw new Error("At least one topic is required.");
    }

    const existingHtml = await fetchFile(`posts/${slug}.html`);
    const existingMarkdown = await fetchFile(`content/posts/${slug}.md`);
    if (existingHtml || existingMarkdown) {
      return {
        statusCode: 409,
        headers: corsHeaders(origin),
        body: JSON.stringify({ error: "A post with this slug already exists." })
      };
    }

    const indexFile = await fetchFile("index.html");
    if (!indexFile) {
      throw new Error("Homepage file could not be found in the repo.");
    }

    const markdownSource = buildMarkdownSource({ title, summary, date, slug, topics, markdownBody });
    const htmlOutput = buildPostHtml({ title, summary, date, topics, markdownBody });
    const nextIndexHtml = insertArchiveRow(indexFile.content, archiveRowHtml({ title, summary, date, slug, topics }));

    await writeFile({
      path: `content/posts/${slug}.md`,
      content: markdownSource,
      message: `Add post source for ${title}`
    });

    await writeFile({
      path: `posts/${slug}.html`,
      content: htmlOutput,
      message: `Publish post ${title}`
    });

    await writeFile({
      path: "index.html",
      content: nextIndexHtml,
      sha: indexFile.sha,
      message: `Update homepage for ${title}`
    });

    const siteBaseUrl =
      process.env.SITE_BASE_URL ||
      `https://${process.env.GITHUB_OWNER || "Harpal091"}.github.io/${process.env.GITHUB_REPO || "data-engineering-weekly"}`;

    return {
      statusCode: 200,
      headers: corsHeaders(origin),
      body: JSON.stringify({
        siteUrl: `${siteBaseUrl}/posts/${slug}.html`,
        repoPath: `posts/${slug}.html`,
        sourcePath: `content/posts/${slug}.md`
      })
    };
  } catch (error) {
    return {
      statusCode: 400,
      headers: corsHeaders(origin),
      body: JSON.stringify({ error: error.message || "Publishing failed." })
    };
  }
};
