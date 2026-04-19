const endpointInput = document.querySelector("#endpoint");
const titleInput = document.querySelector("#title");
const dateInput = document.querySelector("#date");
const slugInput = document.querySelector("#slug");
const summaryInput = document.querySelector("#summary");
const secretInput = document.querySelector("#secret");
const bodyInput = document.querySelector("#markdownBody");
const topicsInputs = document.querySelectorAll('input[name="topics"]');
const postForm = document.querySelector("#post-form");
const publishButton = document.querySelector("#publish-button");
const formMessage = document.querySelector("#form-message");

const previewTitle = document.querySelector("#preview-title");
const previewMeta = document.querySelector("#preview-meta");
const previewBody = document.querySelector("#preview-body");

const storedEndpoint = localStorage.getItem("publishEndpoint");
const storedSecret = sessionStorage.getItem("adminSecret");

const defaultEndpoint = `${window.location.origin}/.netlify/functions/publish-post`;
endpointInput.value = storedEndpoint || defaultEndpoint;
secretInput.value = storedSecret || "";
dateInput.value = new Date().toISOString().slice(0, 10);

let slugWasEdited = false;

const slugify = (value) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

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

  const flushCodeBlock = () => {
    if (!inCodeBlock) {
      return;
    }
    html.push(`<pre><code>${escapeHtml(codeLines.join("\n"))}</code></pre>`);
    inCodeBlock = false;
    codeLines = [];
  };

  const flushQuote = () => {
    if (!quoteLines.length) {
      return;
    }
    html.push(`<blockquote><p>${renderInlineMarkdown(quoteLines.join(" "))}</p></blockquote>`);
    quoteLines = [];
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

  return html.join("");
};

const getSelectedTopics = () =>
  Array.from(topicsInputs)
    .filter((input) => input.checked)
    .map((input) => input.value);

const prettifyTopic = (topic) =>
  topic
    .split("-")
    .join(" ")
    .replace(/\bdbt\b/g, "dbt")
    .replace(/\bairflow\b/g, "Airflow")
    .replace(/\baws\b/g, "AWS")
    .replace(/\bai\b/g, "AI");

const updatePreview = () => {
  const title = titleInput.value.trim() || "Post title";
  const date = dateInput.value || "Date";
  const topics = getSelectedTopics();
  const summary = summaryInput.value.trim();
  const body = bodyInput.value.trim();
  const previewContent = body || summary || "Start typing in the editor to preview the rendered post.";

  previewTitle.textContent = title;
  previewMeta.textContent = `${date} | ${topics.length ? topics.map(prettifyTopic).join(" | ") : "Topics"}`;
  previewBody.innerHTML = renderMarkdown(previewContent);
};

const setMessage = (message, mode = "") => {
  formMessage.textContent = message;
  formMessage.classList.remove("is-error", "is-success");
  if (mode) {
    formMessage.classList.add(mode);
  }
};

titleInput.addEventListener("input", () => {
  if (!slugWasEdited) {
    slugInput.value = slugify(titleInput.value);
  }
  updatePreview();
});

slugInput.addEventListener("input", () => {
  slugWasEdited = true;
});

[dateInput, summaryInput, bodyInput].forEach((input) => {
  input.addEventListener("input", updatePreview);
});

topicsInputs.forEach((input) => {
  input.addEventListener("change", updatePreview);
});

endpointInput.addEventListener("input", () => {
  localStorage.setItem("publishEndpoint", endpointInput.value.trim());
});

secretInput.addEventListener("input", () => {
  sessionStorage.setItem("adminSecret", secretInput.value);
});

postForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  setMessage("");

  const title = titleInput.value.trim();
  const date = dateInput.value;
  const summary = summaryInput.value.trim();
  const slug = slugify(slugInput.value || title);
  const endpoint = endpointInput.value.trim();
  const adminSecret = secretInput.value.trim();
  const markdownBody = bodyInput.value.trim();
  const topics = getSelectedTopics();

  if (!title || !date || !summary || !markdownBody || !slug) {
    setMessage("Title, date, summary, slug, and Markdown body are all required.", "is-error");
    return;
  }

  if (!topics.length) {
    setMessage("Select at least one topic before publishing.", "is-error");
    return;
  }

  publishButton.disabled = true;
  publishButton.textContent = "Publishing...";

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Admin-Secret": adminSecret
      },
      body: JSON.stringify({
        title,
        date,
        summary,
        slug,
        topics,
        markdownBody
      })
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Publishing failed.");
    }

    slugWasEdited = false;
    setMessage(`Published successfully: ${result.siteUrl}`, "is-success");
  } catch (error) {
    setMessage(error.message, "is-error");
  } finally {
    publishButton.disabled = false;
    publishButton.textContent = "Publish post";
  }
});

updatePreview();
