/**
 * Shared site chrome: i18n, site.json, header/footer, nav, language toggle.
 */
(function () {
  "use strict";

  const DATA_BASE = "data/";
  const LANG_KEY = "lab-lang";

  let sitePromise = null;
  let lang = "zh";
  let strings = {};

  async function fetchJSON(path) {
    const res = await fetch(path);
    if (!res.ok) throw new Error("Failed to load " + path + " (" + res.status + ")");
    return res.json();
  }

  function detectLang() {
    try {
      const stored = localStorage.getItem(LANG_KEY);
      if (stored === "zh" || stored === "en") return stored;
    } catch (e) {
      /* ignore */
    }
    const nav = (
      (navigator.languages && navigator.languages[0]) ||
      navigator.language ||
      navigator.userLanguage ||
      "en"
    ).toLowerCase();
    return nav.indexOf("zh") === 0 ? "zh" : "en";
  }

  function pick(value) {
    if (value == null) return "";
    if (typeof value === "string" || typeof value === "number") return String(value);
    if (typeof value === "object") {
      if (value[lang] != null && value[lang] !== "") return String(value[lang]);
      if (value.en != null) return String(value.en);
      if (value.zh != null) return String(value.zh);
    }
    return "";
  }

  function t(path) {
    if (!path) return "";
    const parts = String(path).split(".");
    let node = strings;
    for (let i = 0; i < parts.length; i++) {
      if (node == null) return path;
      node = node[parts[i]];
    }
    const val = pick(node);
    return val || path;
  }

  function isPlaceholder(text) {
    const s = pick(text);
    if (s == null || s === "") return true;
    return (
      s.indexOf("[ADD") === 0 ||
      s.indexOf("[LAB") === 0 ||
      s.indexOf("[待") === 0 ||
      s.indexOf("[实验室") === 0
    );
  }

  function currentPage() {
    const path = window.location.pathname;
    const file = path.split("/").pop() || "index.html";
    if (!file || file === "") return "index.html";
    return file;
  }

  function pageKey(page) {
    const map = {
      "index.html": "home",
      "about.html": "about",
      "people.html": "people",
      "member.html": "member",
      "research.html": "research",
      "pi.html": "pi",
      "publications.html": "publications",
      "contact.html": "contact",
    };
    return map[page] || "home";
  }

  function applyDocumentLang() {
    document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";
    document.documentElement.setAttribute("data-lang", lang);
  }

  function fillTemplate(str, vars) {
    let out = str || "";
    Object.keys(vars || {}).forEach(function (key) {
      out = out.replace(new RegExp("\\{" + key + "\\}", "g"), vars[key] == null ? "" : vars[key]);
    });
    return out;
  }

  function applyStatic() {
    applyDocumentLang();
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      const val = t(el.getAttribute("data-i18n"));
      if (val) el.textContent = val;
    });
    document.querySelectorAll("[data-i18n-html]").forEach(function (el) {
      const val = t(el.getAttribute("data-i18n-html"));
      if (val) el.innerHTML = val;
    });
    document.querySelectorAll("[data-i18n-aria]").forEach(function (el) {
      const val = t(el.getAttribute("data-i18n-aria"));
      if (val) el.setAttribute("aria-label", val);
    });
    const site = window.LabSite.site;
    if (site) {
      const page = pageKey(currentPage());
      const labName = pick(site.labName);
      const titleTmpl = t("pages." + page + ".title");
      if (titleTmpl && page !== "member") {
        document.title = fillTemplate(titleTmpl, { labName: labName });
      }
      const descTmpl = t("pages." + page + ".description");
      const meta = document.querySelector('meta[name="description"]');
      if (meta && descTmpl && page !== "member") {
        meta.setAttribute("content", fillTemplate(descTmpl, { labName: labName }));
      }
    }
  }

  function renderHeader(site) {
    const header = document.getElementById("site-header");
    if (!header) return;

    const page = currentPage();
    const navItems = (site.nav || [])
      .map(function (item) {
        const isActive =
          item.href === page ||
          (page === "member.html" && item.href === "people.html") ||
          (page === "pi.html" && item.href === "pi.html");
        const aria = isActive ? ' aria-current="page"' : "";
        const label = item.label ? pick(item.label) : t("nav." + item.id);
        return (
          "<li><a href=\"" +
          item.href +
          "\"" +
          aria +
          ">" +
          escapeHtml(label) +
          "</a></li>"
        );
      })
      .join("");

    header.innerHTML =
      '<div class="container site-header__inner">' +
      '<a class="brand" href="index.html">' +
      (site.logo
        ? '<img class="brand__logo" src="' +
          escapeHtml(site.logo) +
          '" alt="' +
          escapeHtml(pick(site.labName)) +
          '" />'
        : "") +
      '<span class="brand__text">' +
      (site.logoIncludesWordmark
        ? ""
        : '<span class="brand__lab">' +
          escapeHtml(pick(site.labName)) +
          "</span>") +
      '<span class="brand__inst">' +
      escapeHtml(pick(site.institutionShort || site.institution)) +
      "</span>" +
      "</span>" +
      "</a>" +
      '<button type="button" class="nav-toggle" id="nav-toggle" aria-expanded="false" aria-controls="site-nav" aria-label="' +
      escapeHtml(t("openMenu")) +
      '">' +
      '<span class="nav-toggle__icon" aria-hidden="true"></span>' +
      "</button>" +
      '<nav class="site-nav" id="site-nav" aria-label="Primary">' +
      "<ul>" +
      navItems +
      "</ul>" +
      '<div class="lang-toggle" role="group" aria-label="' +
      escapeHtml(t("language")) +
      '">' +
      '<button type="button" class="lang-toggle__btn' +
      (lang === "zh" ? " is-active" : "") +
      '" data-set-lang="zh" aria-pressed="' +
      (lang === "zh" ? "true" : "false") +
      '">中文</button>' +
      '<span class="lang-toggle__sep" aria-hidden="true">|</span>' +
      '<button type="button" class="lang-toggle__btn' +
      (lang === "en" ? " is-active" : "") +
      '" data-set-lang="en" aria-pressed="' +
      (lang === "en" ? "true" : "false") +
      '">EN</button>' +
      "</div>" +
      "</nav>" +
      "</div>";

    const toggle = document.getElementById("nav-toggle");
    const nav = document.getElementById("site-nav");
    if (toggle && nav) {
      toggle.addEventListener("click", function () {
        const open = nav.classList.toggle("is-open");
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
        toggle.setAttribute("aria-label", open ? t("closeMenu") : t("openMenu"));
      });
    }

    header.querySelectorAll("[data-set-lang]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        setLang(btn.getAttribute("data-set-lang"));
      });
    });
  }

  function renderFooter(site) {
    const footer = document.getElementById("site-footer");
    if (!footer) return;

    const navLinks = (site.nav || [])
      .map(function (item) {
        const label = item.label ? pick(item.label) : t("nav." + item.id);
        return (
          '<li><a href="' +
          item.href +
          '">' +
          escapeHtml(label) +
          "</a></li>"
        );
      })
      .join("");

    const socialLinks = (site.social || [])
      .map(function (item) {
        const href = item.url && item.url !== "#" ? item.url : "#";
        return (
          '<li><a href="' +
          href +
          '">' +
          escapeHtml(pick(item.label)) +
          "</a></li>"
        );
      })
      .join("");

    const year =
      (site.footer && site.footer.copyrightYear) || new Date().getFullYear();
    const note = site.footer ? pick(site.footer.note) : "";
    const noteIsPh = site.footer ? isPlaceholder(site.footer.note) : true;

    footer.innerHTML =
      '<div class="container">' +
      '<div class="footer__grid">' +
      "<div>" +
      (site.logoLockup
        ? '<img class="footer__brand-lockup" src="' +
          escapeHtml(site.logoLockup) +
          '" alt="' +
          escapeHtml(pick(site.labName)) +
          '" />'
        : "") +
      '<p class="footer__lab' +
      (site.logoLockup ? " sr-only" : "") +
      '">' +
      escapeHtml(pick(site.labName)) +
      "</p>" +
      '<p class="footer__inst">' +
      escapeHtml(pick((site.footer && site.footer.institution) || site.institution)) +
      "</p>" +
      (note
        ? '<p class="footer__inst' +
          (noteIsPh ? " placeholder-text" : "") +
          '">' +
          escapeHtml(note) +
          "</p>"
        : "") +
      "</div>" +
      "<div>" +
      '<p class="footer__heading">' +
      escapeHtml(t("footer.explore")) +
      "</p>" +
      '<ul class="footer__list">' +
      navLinks +
      "</ul>" +
      "</div>" +
      "<div>" +
      '<p class="footer__heading">' +
      escapeHtml(t("footer.connect")) +
      "</p>" +
      '<ul class="footer__list">' +
      socialLinks +
      "</ul>" +
      "</div>" +
      "</div>" +
      '<div class="footer__bottom">' +
      "<span>&copy; " +
      year +
      " " +
      escapeHtml(pick(site.labName)) +
      "</span>" +
      "<span>" +
      escapeHtml(pick(site.institutionShort || site.institution)) +
      "</span>" +
      "</div>" +
      "</div>";
  }

  function renderChrome() {
    const site = window.LabSite.site;
    if (!site) return;
    renderHeader(site);
    renderFooter(site);
    applyStatic();
  }

  function setLang(next) {
    if (next !== "zh" && next !== "en") return;
    if (next === lang && document.documentElement.getAttribute("data-lang") === next) {
      return;
    }
    lang = next;
    try {
      localStorage.setItem(LANG_KEY, lang);
    } catch (e) {
      /* ignore */
    }
    renderChrome();
    window.dispatchEvent(new CustomEvent("lab-lang-change", { detail: { lang: lang } }));
  }

  function escapeHtml(str) {
    if (str == null) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function isPublicEmail(email) {
    if (!email || isPlaceholder(email)) return false;
    const s = String(email).trim().toLowerCase();
    const allowed = ["fanyuchuan@zafu.edu.cn", "weifang@zafu.edu.cn"];
    return allowed.indexOf(s) !== -1;
  }

  function portraitHTML(member, className) {
    const cls = className || "";
    const name = member ? pick(member.name) : "";
    if (member && member.portrait) {
      const alt = fillTemplate(t("portraitAlt"), { name: name });
      return (
        '<img src="' +
        escapeHtml(member.portrait) +
        '" alt="' +
        escapeHtml(alt) +
        '"' +
        (cls ? ' class="' + cls + '"' : "") +
        " />"
      );
    }
    const mono = member && member.monogram ? String(member.monogram) : "";
    if (mono) {
      return (
        '<div class="portrait-monogram' +
        (cls ? " " + cls : "") +
        '" role="img" aria-label="' +
        escapeHtml(mono) +
        '">' +
        escapeHtml(mono) +
        "</div>"
      );
    }
    return (
      '<div class="portrait-placeholder' +
      (cls ? " " + cls : "") +
      '" role="img" aria-label="portrait">' +
      '<span class="portrait-placeholder__icon" aria-hidden="true"></span>' +
      "</div>"
    );
  }

  function namePair(member) {
    if (!member || !member.name) {
      return { primary: "", secondary: "" };
    }
    if (typeof member.name === "string") {
      return { primary: member.name, secondary: "" };
    }
    const primary = lang === "zh" ? member.name.zh || member.name.en : member.name.en || member.name.zh;
    const secondary = lang === "zh" ? member.name.en : member.name.zh;
    return {
      primary: primary || "",
      secondary: secondary && secondary !== primary ? secondary : "",
    };
  }

  window.LabSite = {
    fetchJSON: fetchJSON,
    escapeHtml: escapeHtml,
    DATA_BASE: DATA_BASE,
    isPlaceholder: isPlaceholder,
    isPublicEmail: isPublicEmail,
    portraitHTML: portraitHTML,
    namePair: namePair,
    pick: pick,
    t: t,
    fillTemplate: fillTemplate,
    getLang: function () {
      return lang;
    },
    setLang: setLang,
    loadSite: function () {
      if (sitePromise) return sitePromise;
      sitePromise = Promise.all([
        fetchJSON(DATA_BASE + "site.json"),
        fetchJSON(DATA_BASE + "i18n.json"),
      ]).then(function (results) {
        window.LabSite.site = results[0];
        strings = results[1] || {};
        lang = detectLang();
        try {
          localStorage.setItem(LANG_KEY, lang);
        } catch (e) {
          /* ignore */
        }
        renderChrome();
        return results[0];
      });
      return sitePromise;
    },
  };

  document.addEventListener("DOMContentLoaded", function () {
    window.LabSite.loadSite().catch(function (err) {
      console.error(err);
      const header = document.getElementById("site-header");
      if (header && !header.innerHTML.trim()) {
        header.innerHTML =
          '<div class="container"><p class="status-msg status-msg--error">Unable to load site configuration. Serve this site over HTTP (see README).</p></div>';
      }
    });
  });
})();
