async function checkGeoBlock() {
  document.documentElement.style.visibility = "hidden";

  // Configuration
  const blockedCountries = ["AT"];
  const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

  try {
    const cachedCountry = sessionStorage.getItem("countryCode");
    const cachedTime = Number(sessionStorage.getItem("countryCodeTime"));

    let countryCode = null;

    if (
      cachedCountry &&
      cachedTime &&
      Date.now() - cachedTime >= 0 &&
      Date.now() - cachedTime < CACHE_DURATION
    ) {
      countryCode = cachedCountry;
    }

    if (!countryCode) {
      const response = await fetch("https://ipapi.co/json/", {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`Location API error: ${response.status}`);
      }

      const data = await response.json();

      if (!data.country_code) {
        throw new Error("Country code unavailable");
      }

      countryCode = data.country_code.toUpperCase();

      sessionStorage.setItem("countryCode", countryCode);
      sessionStorage.setItem("countryCodeTime", Date.now().toString());
    }

    if (blockedCountries.includes(countryCode)) {
      document.body.innerHTML = `
                <div class="container">
                    <header>
                        <div>
                            <span class="status-dot"></span> Online Notebook
                        </div>
                    </header>

                    <main class="feed">
                        <article class="header-card">
                            <div class="badge">1952 Journey</div>
                            <h1>Ink &amp; Irony</h1>
                            <p class="tagline">
                                Ink on screen, irony in mind.
                            </p>

                            <div class="field-note">
                                <b style="color: #f85149;">
                                    ⛔ ACCESS DENIED
                                </b>
                                <p style="margin-top: 8px;">
                                    Sorry, this website is not
                                    accessible from your location.
                                </p>
                            </div>
                        </article>
                    </main>

                    <footer>
                        <p class="copyright">
                            &copy; ${new Date().getFullYear()}
                            Ink &amp; Irony - All Rights Reserved.
                        </p>
                    </footer>
                </div>
            `;
    }
  } catch (error) {
    console.error("Geo-blocking failed:", error);
  } finally {
    document.documentElement.style.visibility = "visible";
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", checkGeoBlock);
} else {
  checkGeoBlock();
}
