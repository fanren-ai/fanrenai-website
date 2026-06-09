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
    button.textContent = "已复制";
  } catch {
    button.textContent = "复制失败";
  } finally {
    window.setTimeout(() => {
      button.textContent = originalLabel;
      button.disabled = false;
    }, 1600);
  }
});

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
