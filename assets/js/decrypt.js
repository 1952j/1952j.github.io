(() => {
  "use strict";

  const SESSION_KEY = "ink_irony_content_key";
  const PBKDF2_ITERATIONS = 600000;

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  // Convert Base64 to Uint8Array
  function fromBase64(value) {
    return Uint8Array.from(atob(value), (char) => char.charCodeAt(0));
  }

  // Convert Uint8Array to Base64
  function toBase64(bytes) {
    let binary = "";

    for (const byte of bytes) {
      binary += String.fromCharCode(byte);
    }

    return btoa(binary);
  }

  // Derive a password-based AES key
  async function derivePasswordKey(password, salt) {
    const passwordKey = await crypto.subtle.importKey(
      "raw",
      encoder.encode(password),
      "PBKDF2",
      false,
      ["deriveKey"],
    );

    return crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: fromBase64(salt),
        iterations: PBKDF2_ITERATIONS,
        hash: "SHA-256",
      },
      passwordKey,
      {
        name: "AES-GCM",
        length: 256,
      },
      false,
      ["decrypt"],
    );
  }

  // Unlock shared content key for a user
  async function unlockContentKey(username, password) {
    const response = await fetch("/encrypted/users.json", {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Unable to load user configuration.");
    }

    const config = await response.json();

    const user = config.users.find((entry) => entry.username === username);

    if (!user) {
      throw new Error("Invalid username or password.");
    }

    const passwordKey = await derivePasswordKey(password, user.salt);

    let rawKey;

    try {
      rawKey = await crypto.subtle.decrypt(
        {
          name: "AES-GCM",
          iv: fromBase64(user.iv),
        },
        passwordKey,
        fromBase64(user.wrappedKey),
      );
    } catch {
      throw new Error("Invalid username or password.");
    }

    const contentKey = await crypto.subtle.importKey(
      "raw",
      rawKey,
      {
        name: "AES-GCM",
        length: 256,
      },
      true,
      ["decrypt"],
    );

    // Remember the key for this browser tab
    sessionStorage.setItem(SESSION_KEY, toBase64(new Uint8Array(rawKey)));

    return contentKey;
  }

  // Restore content key from session
  async function restoreContentKey() {
    const stored = sessionStorage.getItem(SESSION_KEY);

    if (!stored) {
      return null;
    }

    try {
      return await crypto.subtle.importKey(
        "raw",
        fromBase64(stored),
        {
          name: "AES-GCM",
          length: 256,
        },
        false,
        ["decrypt"],
      );
    } catch {
      sessionStorage.removeItem(SESSION_KEY);
      return null;
    }
  }

  // Determine encrypted file from current URL
  function getEncryptedPath() {
    let path = window.location.pathname;

    if (path.endsWith("/")) {
      path += "index.html";
    }

    if (!path.endsWith(".html")) {
      throw new Error("Unsupported page path.");
    }

    const jsonPath = path.replace(/\.html$/, ".json");

    return "/encrypted" + jsonPath;
  }

  // Decrypt current page
  async function decryptCurrentPage(contentKey) {
    const path = getEncryptedPath();

    const response = await fetch(path, {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Encrypted page not found.");
    }

    const encrypted = await response.json();

    const plaintext = await crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: fromBase64(encrypted.iv),
      },
      contentKey,
      fromBase64(encrypted.data),
    );

    return decoder.decode(plaintext);
  }

  // Clear stored session key
  function clearSession() {
    sessionStorage.removeItem(SESSION_KEY);
  }

  // Expose functions to auth.js
  window.InkCrypto = Object.freeze({
    unlockContentKey,
    restoreContentKey,
    decryptCurrentPage,
    clearSession,
  });
})();
