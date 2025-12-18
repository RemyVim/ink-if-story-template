document.addEventListener("DOMContentLoaded", function () {
  const tocContainer = document.getElementById("toc");
  if (!tocContainer) return;

  const article = document.querySelector("article");
  if (!article) return;

  const headings = article.querySelectorAll("h2, h3");
  if (headings.length === 0) return;

  const list = document.createElement("ul");

  headings.forEach(function (heading) {
    if (!heading.id) {
      heading.id = heading.textContent
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
    }

    const li = document.createElement("li");
    const a = document.createElement("a");
    a.href = "#" + heading.id;
    a.textContent = heading.textContent;
    li.appendChild(a);

    if (heading.tagName === "H3") {
      li.classList.add("toc-h3");
    }

    list.appendChild(li);
  });

  tocContainer.appendChild(list);
});

// Back to top button
document.addEventListener("DOMContentLoaded", function () {
  const backToTop = document.getElementById("back-to-top");
  if (!backToTop) return;

  window.addEventListener("scroll", function () {
    if (window.scrollY > 300) {
      backToTop.classList.add("visible");
    } else {
      backToTop.classList.remove("visible");
    }
  });

  backToTop.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
});
