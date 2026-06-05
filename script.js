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
