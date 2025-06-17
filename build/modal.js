// Generic Modal System
class ModalSystem {
  constructor() {
    this.modal = document.getElementById("modal-template");
    this.modalTitle = document.getElementById("modal-title");
    this.modalBody = document.getElementById("modal-body");
    this.closeBtn = this.modal.querySelector(".close");

    this.setupEventListeners();
  }

  setupEventListeners() {
    // Close button
    this.closeBtn.onclick = () => this.close();

    // Click outside modal to close
    window.onclick = (event) => {
      if (event.target === this.modal) {
        this.close();
      }
    };

    // Escape key to close
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && this.isOpen()) {
        this.close();
      }
    });
  }

  async open(title, contentFile) {
    this.modalTitle.textContent = title;

    try {
      // Fetch content from external file
      const response = await fetch(contentFile);
      if (response.ok) {
        const content = await response.text();
        this.modalBody.innerHTML = content;
      } else {
        this.modalBody.innerHTML = "<p>Content could not be loaded.</p>";
      }
    } catch (error) {
      console.error("Error loading modal content:", error);
      this.modalBody.innerHTML = "<p>Error loading content.</p>";
    }

    this.modal.style.display = "block";

    // Focus management for accessibility
    this.closeBtn.focus();
  }

  close() {
    this.modal.style.display = "none";
  }

  isOpen() {
    return this.modal.style.display === "block";
  }
}

// Initialize modal system and button handlers when DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
  const modalSystem = new ModalSystem();

  // Content warnings button
  const warningsBtn = document.getElementById("content-warnings");
  if (warningsBtn) {
    warningsBtn.onclick = function () {
      modalSystem.open("Content Warnings", "modals/content-warnings.html");
    };
  }

  // Credits button
  const creditsBtn = document.getElementById("credits");
  if (creditsBtn) {
    creditsBtn.onclick = function () {
      modalSystem.open("Credits", "modals/credits.html");
    };
  }

  // You can easily add more modals here:
  // const helpBtn = document.getElementById("help");
  // if (helpBtn) {
  //   helpBtn.onclick = function () {
  //     modalSystem.open("Help", "modals/help.html");
  //   };
  // }
});
