/**
 * Individual member profile: reads ?id= slug and renders from people.json.
 */
(function () {
  "use strict";

  let cache = null;

  function esc(s) {
    return window.LabSite.escapeHtml(s);
  }

  function pick(v) {
    return window.LabSite.pick(v);
  }

  function t(path) {
    return window.LabSite.t(path);
  }

  function isPh(text) {
    return window.LabSite.isPlaceholder(text);
  }

  function getQueryId() {
    const params = new URLSearchParams(window.location.search);
    return params.get("id");
  }

  function pubList(pubs) {
    if (!pubs || !pubs.length) return "";
    const list = pubs
      .map(function (p) {
        const doiRaw = pick(p.doi);
        const doi =
          doiRaw && !isPh(p.doi)
            ? ' · <a href="https://doi.org/' +
              esc(doiRaw) +
              '" rel="noopener">DOI</a>'
            : "";
        const authors = pick(p.authors);
        const venue = pick(p.venue);
        const year = pick(p.year);
        const meta = [authors, venue, year].filter(Boolean).join(" · ");
        return (
          '<li class="pub-item">' +
          '<h3 class="pub-item__title">' +
          esc(pick(p.title)) +
          "</h3>" +
          '<p class="pub-item__meta">' +
          esc(meta) +
          doi +
          "</p>" +
          "</li>"
        );
      })
      .join("");
    return '<ul class="pub-list">' + list + "</ul>";
  }

  function renderMember(member, site) {
    const root = document.getElementById("member-root");
    if (!root) return;

    const names = window.LabSite.namePair(member);
    const labName = pick(site.labName);
    document.title = window.LabSite.fillTemplate(t("pages.member.title"), {
      name: names.primary,
      labName: labName,
    });
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute(
        "content",
        window.LabSite.fillTemplate(t("pages.member.description"), {
          labName: labName,
        })
      );
    }

    const kws = member.keywords || [];
    const interestBlock = kws.length
      ? '<ul class="interest-list">' +
        kws
          .map(function (k) {
            return '<li><span class="interest-chip">' + esc(pick(k)) + "</span></li>";
          })
          .join("") +
        "</ul>"
      : "";

    const bio = pick(member.bio);
    const bioClass = isPh(member.bio) ? "bio-text placeholder-text" : "bio-text";

    const education = (member.education || []).map(function (item) {
      return "<li>" + esc(pick(item)) + "</li>";
    }).join("");

    const pubs = member.selectedPublications || [];

    let contactRows = "";
    if (window.LabSite.isPublicEmail(member.email)) {
      contactRows +=
        "<dt>" +
        esc(t("member.email")) +
        '</dt><dd><a href="mailto:' +
        esc(member.email) +
        '">' +
        esc(member.email) +
        "</a></dd>";
    }

    const sidebarContact = contactRows
      ? '<dl class="member-contact">' + contactRows + "</dl>"
      : "";

    let sections = "";
    if (interestBlock) {
      sections +=
        '<section class="member-section" aria-labelledby="interests-heading">' +
        '<h2 id="interests-heading">' +
        esc(t("member.interests")) +
        "</h2>" +
        interestBlock +
        "</section>";
    }
    if (bio) {
      sections +=
        '<section class="member-section" aria-labelledby="bio-heading">' +
        '<h2 id="bio-heading">' +
        esc(t("member.biography")) +
        "</h2>" +
        '<p class="' +
        bioClass +
        '">' +
        esc(bio) +
        "</p>" +
        "</section>";
    }
    if (education) {
      sections +=
        '<section class="member-section" aria-labelledby="edu-heading">' +
        '<h2 id="edu-heading">' +
        esc(t("member.education")) +
        "</h2>" +
        '<ul class="edu-list">' +
        education +
        "</ul>" +
        "</section>";
    }
    if (pubs.length) {
      sections +=
        '<section class="member-section" aria-labelledby="pubs-heading">' +
        '<h2 id="pubs-heading">' +
        esc(t("member.publications")) +
        "</h2>" +
        pubList(pubs) +
        "</section>";
    }

    root.innerHTML =
      '<div class="member-layout">' +
      '<aside class="member-sidebar">' +
      '<div class="member-portrait">' +
      window.LabSite.portraitHTML(member) +
      "</div>" +
      sidebarContact +
      "</aside>" +
      '<div class="member-main">' +
      '<header class="member-header">' +
      '<p class="member-header__role">' +
      esc(pick(member.role)) +
      "</p>" +
      "<h1>" +
      esc(names.primary) +
      "</h1>" +
      (names.secondary
        ? '<p class="member-header__title">' + esc(names.secondary) + "</p>"
        : "") +
      "</header>" +
      sections +
      "<p><a href=\"people.html\">" +
      esc(t("member.backToPeople")) +
      "</a></p>" +
      "</div>" +
      "</div>";
  }

  function renderMissing(id, kind) {
    const root = document.getElementById("member-root");
    if (!root) return;
    const heading =
      kind === "noprofile" ? t("member.noProfile") : t("member.notFound");
    const detail =
      kind === "noprofile"
        ? ""
        : "<p>" +
          esc(t("member.notFoundDetail")) +
          (id ? " <code>?id=" + esc(id) + "</code>" : "") +
          "</p>";
    root.innerHTML =
      '<div class="status-msg status-msg--error">' +
      "<p><strong>" +
      esc(heading) +
      "</strong></p>" +
      detail +
      '<p><a href="people.html">' +
      esc(t("member.returnToPeople")) +
      "</a></p>" +
      "</div>";
  }

  function draw() {
    if (!cache) return;
    const id = getQueryId();
    const site = cache.site;
    const people = cache.people;
    if (!id) {
      renderMissing("", "missing");
      return;
    }
    const member = (people.members || []).find(function (m) {
      return m.id === id;
    });
    if (!member) {
      renderMissing(id, "missing");
      return;
    }
    if (!member.hasProfile) {
      renderMissing(id, "noprofile");
      return;
    }
    renderMember(member, site);
  }

  document.addEventListener("DOMContentLoaded", function () {
    Promise.all([
      window.LabSite.loadSite(),
      window.LabSite.fetchJSON(window.LabSite.DATA_BASE + "people.json"),
    ])
      .then(function (results) {
        cache = { site: results[0], people: results[1] };
        draw();
      })
      .catch(function (err) {
        console.error(err);
        const root = document.getElementById("member-root");
        if (root) {
          root.innerHTML =
            '<p class="status-msg status-msg--error">' +
            esc(window.LabSite.t("status.loadFail")) +
            "</p>";
        }
      });
  });

  window.addEventListener("lab-lang-change", draw);
})();
