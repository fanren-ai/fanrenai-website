const navToggle = document.querySelector(".nav-toggle");
const navMenu = document.querySelector(".nav-menu");
const themeToggle = document.querySelector("[data-theme-toggle]");
const themeToggleText = document.querySelector("[data-theme-toggle-text]");

const THEME_KEY = "fanrenai-theme";

function getCurrentTheme() {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

function syncThemeToggle(theme) {
  if (!themeToggle) return;

  const isDark = theme === "dark";
  themeToggle.setAttribute("aria-pressed", String(isDark));
  themeToggle.setAttribute("aria-label", isDark ? "切换浅色模式" : "切换深色模式");

  if (themeToggleText) {
    themeToggleText.textContent = isDark ? "开灯" : "关灯";
  }
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
  syncThemeToggle(theme);

  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch (error) {
    // Local storage may be unavailable in private browsing or strict environments.
  }
}

function playThemeWipe(theme, event) {
  const x = event?.clientX ?? window.innerWidth - 92;
  const y = event?.clientY ?? 36;

  document.body.style.setProperty("--theme-wipe-x", `${x}px`);
  document.body.style.setProperty("--theme-wipe-y", `${y}px`);
  document.body.classList.remove("theme-switching", "theme-wipe-light", "theme-wipe-dark");
  void document.body.offsetWidth;
  document.body.classList.add("theme-switching", theme === "dark" ? "theme-wipe-dark" : "theme-wipe-light");

  window.setTimeout(() => {
    document.body.classList.remove("theme-switching", "theme-wipe-light", "theme-wipe-dark");
  }, 760);
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
  const nextTheme = getCurrentTheme() === "dark" ? "light" : "dark";
  playThemeWipe(nextTheme, event);
  window.requestAnimationFrame(() => applyTheme(nextTheme));
});
