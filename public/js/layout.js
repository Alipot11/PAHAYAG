const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/lantern.html", label: "Lantern Making" },
  { href: "/singing.html", label: "Singing Contest" },
  { href: "/announcements.html", label: "Announcements" },
  { href: "/winners.html", label: "Past Winners" },
  { href: "/admin/", label: "Staff Login", cta: true },
];

// Makes "/lantern", "/lantern.html" and "/lantern/" all look the same
function normalizePath(path) {
  return path.replace(/\/index\.html$/, "/").replace(/\.html$/, "").replace(/(.)\/$/, "$1");
}

function renderHeader() {
  const here = normalizePath(location.pathname);
  const links = NAV_LINKS.map((l) => {
    const current = normalizePath(l.href) === here ? ' aria-current="page"' : "";
    const cls = l.cta ? ' class="nav__cta"' : "";
    return `<a href="${l.href}"${cls}${current}>${l.label}</a>`;
  }).join("");

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
  document.getElementById("site-footer").innerHTML = `
    <div class="wrap footer__grid">
      <div class="footer__office">
        <div class="footer__brand">
          <img src="/assets/tourism-logo.png" alt="">
          <strong>MAGDIWANG TOURISM OFFICE</strong>
        </div>
        <p>Magdiwang Municipal Hall<br>Poblacion Magdiwang Romblon<br>Magdiwang 5511, Philippines</p>
        <p class="footer__contact"><b>Telephone: 09984555038</b></p>
        <p class="footer__contact"><b>Office Hours:</b> Mon - Fri, 8:00am - 5:00pm</p>
      </div>
      <div class="footer__col">
        <h4>COMPETITIONS</h4>
        <a href="/lantern.html">Lantern Making</a>
        <a href="/singing.html">Singing Contest</a>
        <a href="/register-lantern.html">Register: Lantern</a>
        <a href="/register-singing.html">Register: Singing</a>
      </div>
      <div class="footer__col">
        <h4>PAHAYAG</h4>
        <a href="/announcements.html">Announcements</a>
        <a href="/winners.html">Past Winners</a>
        <a href="/admin/">Staff Login</a>
      </div>
    </div>
    <div class="wrap footer__bottom">
      <span>&copy; ${new Date().getFullYear()} MAGDIWANG TOURISM OFFICE. ALL RIGHTS RESERVED.</span>
      <span class="footer__social"><a href="https://www.facebook.com/profile.php?id=61583923357666">Facebook</a></span>
    </div>`;
}

renderHeader();
renderFooter();