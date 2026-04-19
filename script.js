const topicPills = document.querySelectorAll(".topic-pill");
const postRows = document.querySelectorAll(".post-row");
const postsStatus = document.querySelector("#posts-status");

const statusLabel = (topic, count) => {
  if (topic === "all") {
    return "Newest first. Short titles, clear dates, easy scanning.";
  }

  const activePill = document.querySelector(`.topic-pill[data-topic="${topic}"]`);
  const label = activePill ? activePill.textContent : topic;
  const noun = count === 1 ? "post" : "posts";
  return `${count} ${noun} in ${label}.`;
};

const applyTopicFilter = (topic) => {
  let visibleCount = 0;

  topicPills.forEach((pill) => {
    const isActive = pill.dataset.topic === topic;
    pill.classList.toggle("is-active", isActive);
    pill.setAttribute("aria-pressed", String(isActive));
  });

  postRows.forEach((row) => {
    const topics = (row.dataset.topics || "").split(/\s+/).filter(Boolean);
    const shouldShow = topic === "all" || topics.includes(topic);
    row.classList.toggle("is-hidden", !shouldShow);

    if (shouldShow) {
      visibleCount += 1;
    }
  });

  if (postsStatus) {
    postsStatus.textContent = statusLabel(topic, visibleCount);
  }
};

topicPills.forEach((pill) => {
  pill.addEventListener("click", () => {
    applyTopicFilter(pill.dataset.topic || "all");
  });
});

applyTopicFilter("all");
