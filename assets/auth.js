/* ==========================================
   INK &amp; IRONY — AUTHENTICATION
   ========================================== */

(() => {
  "use strict";

  const cryptoAPI = window.InkCrypto;

  if (!cryptoAPI) {
    console.error("decrypt.js must load before auth.js");
    return;
  }

  // Display the decrypted content
  async function showContent(contentKey) {
    const html = await cryptoAPI.decryptCurrentPage(contentKey);

    const container = document.getElementById("private-content");

    if (!container) {
      throw new Error("Private content container not found.");
    }

    container.innerHTML = html;

    // Show page only after successful decryption
    document.body.classList.add("authenticated");
  }

  // Create login screen
  function createLoginScreen() {
    const loginScreen = document.createElement("div");
    loginScreen.id = "login-screen";

    loginScreen.innerHTML = `
      <article class="header-card" id="login-form-card">
        <div class="badge">1952 Journey</div>
        <h1>Ink &amp; Irony</h1>
        <p class="tagline">
        🎩 VIP Access Only
        </p>

        <form id="login-form">
          <label for="username"></label>
          <input
            type="text"
            id="username"
            placeholder="Enter username"
            autocomplete="username"
            required
          />

          <label for="password"></label>
          <input
            type="password"
            id="password"
            placeholder="Enter password"
            autocomplete="current-password"
            required
          />

          <button type="submit" id="login-button">
          🔓 Unlock Post
          </button>

          <p
            id="login-error"
            class="login-error"
            role="alert"
            aria-live="polite"
          ></p>
        </form>
      </article>

        <footer>
    <p class="copyright">
      &copy; ${new Date().getFullYear()}
      Ink &amp; Irony - All Rights Reserved.
    </p>
  </footer>
    `;

    document.body.appendChild(loginScreen);

    const form = document.getElementById("login-form");
    const button = document.getElementById("login-button");
    const errorElement = document.getElementById("login-error");

    // Handle login submission
    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      const username = document.getElementById("username").value.trim();

      const password = document.getElementById("password").value;

      errorElement.textContent = "";
      button.disabled = true;
      button.textContent = "Decrypting...";

      try {
        // Unlock the shared encryption key
        const contentKey = await cryptoAPI.unlockContentKey(username, password);

        // Decrypt and display the current page
        await showContent(contentKey);

        // Remove login screen
        loginScreen.remove();
      } catch (error) {
        console.error("Authentication failed:", error);

        errorElement.textContent = "🚫 Access Denied. The velvet rope says no.";

        document.getElementById("password").value = "";

        // Remove any stored key after a failed attempt
        cryptoAPI.clearSession();
      } finally {
        button.disabled = false;
        button.textContent = "🔓 Unlock Post";
      }
    });

    document.getElementById("username").focus();

    return loginScreen;
  }

  // Initialize authentication
  async function initializeAuth() {
    try {
      // Check whether a content key exists in this tab
      const contentKey = await cryptoAPI.restoreContentKey();

      if (contentKey) {
        try {
          await showContent(contentKey);
          return;
        } catch (error) {
          console.warn("Stored key is invalid:", error);
          cryptoAPI.clearSession();
        }
      }

      // No valid session: request credentials
      createLoginScreen();
    } catch (error) {
      console.error("Authentication initialization failed:", error);
      createLoginScreen();
    }
  }

  // Wait until HTML is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeAuth);
  } else {
    initializeAuth();
  }
})();
