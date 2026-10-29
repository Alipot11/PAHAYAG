const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/lantern.html", label: "Lantern Making" },
  { href: "/singing.html", label: "Singing Contest" },
  { href: "/announcements.html", label: "Announcements" },
  { href: "/winners.html", label: "Past Winners" },
];

// Makes "/lantern", "/lantern.html" and "/lantern/" all look the same
function normalizePath(path) {
  return path.replace(/\/index\.html$/, "/").replace(/\.html$/, "").replace(/(.)\/$/, "$1");
}

function renderHeader() {
  const here = normalizePath(location.pathname);
  const links = NAV_LINKS.map(
    (l) => `<a href="${l.href}"${normalizePath(l.href) === here ? ' aria-current="page"' : ""}>${l.label}</a>`
  ).join("");

  document.getElementById("site-header").innerHTML = `
    <a href="/" class="nav__logos">
      <img src="/assets/Magdiwang-seal.png" alt="Municipal seal">
      <img src="/assets/tourism-logo.png" alt="Tourism Office logo">
      <span class="nav__brand">PAHAYAG</span>
    </a>
    <button class="nav__toggle" aria-label="Toggle menu">&#9776;</button>
    <nav class="nav__links">${links}</nav>`;

  document.querySelector(".nav__toggle").addEventListener("click", () => {
    document.querySelector(".nav__links").classList.toggle("open");
  });
}

function renderFooter() {
  document.getElementById("site-footer").innerHTML =
    `<div class="wrap">&copy; PAHAYAG. All rights reserved.</div>`;
}

renderHeader();
renderFooter();