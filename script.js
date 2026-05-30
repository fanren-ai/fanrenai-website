const navToggle = document.querySelector(".nav-toggle");
const navMenu = document.querySelector(".nav-menu");
const themeToggle = document.querySelector("[data-theme-toggle]");

const THEME_KEY = "fanrenai-theme";

function getCurrentTheme() {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

function syncThemeToggle(theme) {
  if (!themeToggle) return;

  const isDark = theme === "dark";
  themeToggle.setAttribute("aria-pressed", String(isDark));
  themeToggle.setAttribute("aria-label", isDark ? "Switch to light theme" : "Switch to dark theme");
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
  syncThemeToggle(theme);

  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch (error) {
    // Local storage can be unavailable in private browsing or strict environments.
  }
}

function playThemeWipe(theme, event) {
  const x = event?.clientX ?? window.innerWidth - 56;
  const y = event?.clientY ?? 36;
  const layer = document.createElement("span");

  layer.className = `theme-wipe-layer theme-wipe-${theme}`;
  layer.style.setProperty("--theme-wipe-x", `${x}px`);
  layer.style.setProperty("--theme-wipe-y", `${y}px`);
  document.body.appendChild(layer);

  window.requestAnimationFrame(() => {
    layer.classList.add("is-active");
    window.setTimeout(() => applyTheme(theme), 120);
  });

  layer.addEventListener("transitionend", () => layer.remove(), { once: true });
  window.setTimeout(() => layer.remove(), 900);
}

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

syncThemeToggle(getCurrentTheme());

themeToggle?.addEventListener("click", (event) => {
  event.preventDefault();
  event.stopPropagation();

  const nextTheme = getCurrentTheme() === "dark" ? "light" : "dark";
  playThemeWipe(nextTheme, event);
});
