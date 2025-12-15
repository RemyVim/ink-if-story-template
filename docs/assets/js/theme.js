(function () {
  const toggle = document.getElementById("theme-toggle");
  const root = document.documentElement;

  function getSystemTheme() {
    return window.matchMedia("(prefers-color-scheme: light)").matches
      ? "light"
      : "dark";
  }

  function updatePrismTheme(theme) {
    const prismLink = document.getElementById("prism-theme");
    if (prismLink) {
      prismLink.href =
        theme === "light"
          ? "https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism.min.css"
          : "https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-tomorrow.min.css";
    }
  }

  function setTheme(theme) {
    root.classList.remove("light", "dark");
    root.classList.add(theme);
    localStorage.setItem("theme", theme);
    updatePrismTheme(theme);
  }

  const saved = localStorage.getItem("theme");
  const initialTheme = saved || getSystemTheme();
  setTheme(initialTheme);
  updatePrismTheme(initialTheme);
  toggle.setAttribute("aria-pressed", initialTheme === "dark");
  toggle.setAttribute(
    "aria-label",
    initialTheme === "dark" ? "Dark mode enabled" : "Light mode enabled"
  );
  toggle.addEventListener("click", () => {
    const current = root.classList.contains("light") ? "light" : "dark";
    const newTheme = current === "light" ? "dark" : "light";
    setTheme(newTheme);
    toggle.setAttribute("aria-pressed", newTheme === "dark");
    toggle.setAttribute(
      "aria-label",
      newTheme === "dark" ? "Dark mode enabled" : "Light mode enabled"
    );
  });

  window
    .matchMedia("(prefers-color-scheme: light)")
    .addEventListener("change", (e) => {
      if (!localStorage.getItem("theme")) {
        setTheme(e.matches ? "light" : "dark");
      }
    });

  const menuToggle = document.getElementById("menu-toggle");
  const sidebar = document.querySelector(".sidebar");
  const overlay = document.getElementById("menu-overlay");

  if (menuToggle && sidebar && overlay) {
    menuToggle.addEventListener("click", () => {
      sidebar.classList.toggle("open");
      overlay.classList.toggle("open");
      menuToggle.setAttribute(
        "aria-expanded",
        sidebar.classList.contains("open")
      );
    });

    overlay.addEventListener("click", () => {
      sidebar.classList.remove("open");
      overlay.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.focus();
    });

    sidebar.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        sidebar.classList.remove("open");
        overlay.classList.remove("open");
        menuToggle.setAttribute("aria-expanded", "false");
      });
    });
  }
  window.addEventListener("load", () => {
    document.querySelectorAll("pre[class*='language-']").forEach((pre) => {
      pre.setAttribute("role", "region");
      pre.setAttribute("aria-label", "Code example");
      pre.setAttribute("tabindex", "0");
    });
  });
})();
