const params = new URLSearchParams(window.location.search);
const filter = params.get("filter");

if (filter) {
  const radio = document.getElementById("filter-" + filter);

  if (radio) {
    radio.checked = true;
  }

  history.replaceState(
    null,
    "",
    window.location.pathname + window.location.hash,
  );
}
