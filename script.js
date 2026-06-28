const navToggle = document.querySelector(".nav-toggle");
const navMenu = document.querySelector(".nav-menu");

navToggle?.addEventListener("click", () => {
  const isOpen = navMenu?.classList.toggle("is-open") ?? false;
  navToggle.setAttribute("aria-expanded", String(isOpen));
});

navMenu?.addEventListener("click", (event) => {
  if (event.target instanceof HTMLAnchorElement) {
    navMenu.classList.remove("is-open");
    navToggle?.setAttribute("aria-expanded", "false");
  }
});

const prefersReducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;

function setupRevealMotion() {
  const revealSelectors = [
    ".platform-hero-copy",
    ".platform-hero-panel",
    ".platform-start-item",
    ".platform-stage-grid article",
    ".platform-task-card",
    ".platform-route-card",
    ".platform-column-grid a",
    ".platform-latest-card",
    ".platform-founder",
    ".platform-cta",
    ".tutorial-card",
    ".map-level"
  ];
  const items = Array.from(document.querySelectorAll(revealSelectors.join(",")));
  if (!items.length) return;

  items.forEach((item, index) => {
    item.classList.add("motion-reveal");
    item.style.setProperty("--reveal-delay", `${Math.min(index % 6, 5) * 70}ms`);
  });

  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    items.forEach((item) => item.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
  );

  items.forEach((item) => observer.observe(item));
}

function setupReadingProgress() {
  const bar = document.querySelector(".reading-progress span");
  const article = document.querySelector(".article-content");
  if (!(bar instanceof HTMLElement) || !(article instanceof HTMLElement)) return;

  let ticking = false;
  const update = () => {
    const rect = article.getBoundingClientRect();
    const total = Math.max(article.offsetHeight - window.innerHeight * 0.72, 1);
    const read = Math.min(Math.max(-rect.top, 0), total);
    const progress = read / total;
    bar.style.transform = `scaleX(${progress})`;
    ticking = false;
  };

  const requestUpdate = () => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(update);
  };

  update();
  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate);
}

function normalizeHeadingId(value, index) {
  const slug = String(value)
    .trim()
    .toLowerCase()
    .replace(/[^\w\u4e00-\u9fa5]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 42);
  return `section-${index + 1}${slug ? `-${slug}` : ""}`;
}

function setupArticleHeadingIds() {
  const content = document.querySelector(".article-content");
  if (!(content instanceof HTMLElement)) return;

  const headings = Array.from(content.querySelectorAll("h2, h3")).filter((heading) => heading.textContent?.trim());
  if (!headings.length) return;

  headings.forEach((heading, index) => {
    if (!heading.id) heading.id = normalizeHeadingId(heading.textContent || "", index);
  });
}

async function copyText(text) {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch {
      // Fall through to the selection-based copy path.
    }
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  textarea.remove();
}

document.addEventListener("click", async (event) => {
  const button = event.target instanceof Element ? event.target.closest("[data-copy-button], [data-copy-code]") : null;
  if (!(button instanceof HTMLButtonElement)) return;

  const block = button.closest(".copy-block, .copy-code-block");
  const code = block?.querySelector("code");
  const text = code?.textContent || "";
  if (!text.trim()) return;

  const originalLabel = button.textContent || "复制";
  button.disabled = true;

  try {
    await copyText(text);
    button.textContent = button.dataset.copySuccessLabel || "已复制";
    button.classList.add("is-copied");
  } catch {
    button.textContent = "请手动复制";
  } finally {
    window.setTimeout(() => {
      button.textContent = originalLabel;
      button.disabled = false;
      button.classList.remove("is-copied");
    }, 1600);
  }
});

function setupAiTaskPlanner() {
  const form = document.querySelector("[data-ai-task-planner-form]");
  const output = document.querySelector("[data-task-planner-output]");
  const promptTarget = document.querySelector("[data-task-planner-prompt]");
  if (!(form instanceof HTMLFormElement) || !(output instanceof HTMLElement) || !(promptTarget instanceof HTMLElement)) return;

  const fallback = "请根据实际情况补充";
  const valueOf = (name) => {
    const field = form.elements.namedItem(name);
    if (field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement || field instanceof HTMLSelectElement) {
      return field.value.trim() || fallback;
    }
    return fallback;
  };

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const prompt = `请帮我处理一个具体的 AI 执行任务。

我的目标是：
${valueOf("goal")}

任务类型是：
${valueOf("type")}

我现在卡住的问题是：
${valueOf("stuck")}

我希望最终得到：
${valueOf("result")}

这次允许你处理的范围是：
${valueOf("allowed")}

这次不能修改或处理的内容是：
${valueOf("forbidden")}

完成后请按下面方式帮助我验收：
${valueOf("acceptance")}

请你完成后告诉我：

1. 你具体做了什么
2. 修改或生成了哪些内容
3. 是否影响其他页面、文件或功能
4. 是否存在风险
5. 我应该如何人工验收

要求：

不要擅自扩大任务范围。
不要替我决定项目方向。
不要处理我没有授权的隐私、账号、密钥或客户资料。
如果发现风险，请先说明，不要直接继续。`;

    promptTarget.textContent = prompt;
    output.hidden = false;
    output.classList.add("is-visible");
    output.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "start" });
  });
}

const copyProtectedArticleSelector = '[data-copy-protected="article"]';
const copyAllowedSelector = 'code, pre, input, textarea, [data-copy-unlocked="true"], .copy-block, .copy-code-block';
const copyProtectionMessage = "内容受保护，如需完整模板请关注公众号「凡人修AI」获取。";
let copyProtectionTipTimer = 0;

function elementFromNode(node) {
  if (node instanceof Element) return node;
  return node?.parentElement || null;
}

function isCopyAllowedElement(element) {
  return Boolean(element?.closest(copyAllowedSelector));
}

function getProtectedArticleFromSelection() {
  const selection = window.getSelection?.();
  if (!selection || selection.isCollapsed || selection.rangeCount === 0) return null;

  const range = selection.getRangeAt(0);
  const commonElement = elementFromNode(range.commonAncestorContainer);
  const anchorElement = elementFromNode(selection.anchorNode);
  const focusElement = elementFromNode(selection.focusNode);
  const protectedArticle = commonElement?.closest(copyProtectedArticleSelector);

  if (!protectedArticle) return null;
  if (isCopyAllowedElement(commonElement) || isCopyAllowedElement(anchorElement) || isCopyAllowedElement(focusElement)) {
    return null;
  }

  return protectedArticle;
}

function shouldProtectCopyEvent(event) {
  const target = event.target instanceof Element ? event.target : null;
  const protectedArticle = target?.closest(copyProtectedArticleSelector);

  if (protectedArticle && !isCopyAllowedElement(target)) {
    return true;
  }

  return Boolean(getProtectedArticleFromSelection());
}

function showCopyProtectionTip() {
  let tip = document.querySelector(".copy-protection-tip");

  if (!tip) {
    tip = document.createElement("div");
    tip.className = "copy-protection-tip";
    tip.setAttribute("role", "status");
    tip.setAttribute("aria-live", "polite");
    document.body.appendChild(tip);
  }

  tip.textContent = copyProtectionMessage;
  tip.classList.add("is-visible");
  window.clearTimeout(copyProtectionTipTimer);
  copyProtectionTipTimer = window.setTimeout(() => {
    tip.classList.remove("is-visible");
  }, 2200);
}

function blockProtectedCopy(event) {
  if (!shouldProtectCopyEvent(event)) return;
  event.preventDefault();
  showCopyProtectionTip();
}

document.addEventListener("contextmenu", blockProtectedCopy);
document.addEventListener("copy", blockProtectedCopy);

document.addEventListener("keydown", (event) => {
  if (event.key.toLowerCase() !== "c" || (!event.metaKey && !event.ctrlKey)) return;
  blockProtectedCopy(event);
});

setupRevealMotion();
setupReadingProgress();
setupArticleHeadingIds();
setupAiTaskPlanner();
