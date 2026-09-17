/**
 * Page render helpers: people groups, research themes, publications, home, contact.
 */
(function () {
  "use strict";

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

  async function loadAll() {
    const base = window.LabSite.DATA_BASE;
    const [site, people, research, publications, about] = await Promise.all([
      window.LabSite.site
        ? Promise.resolve(window.LabSite.site)
        : window.LabSite.fetchJSON(base + "site.json"),
      window.LabSite.fetchJSON(base + "people.json"),
      window.LabSite.fetchJSON(base + "research.json"),
      window.LabSite.fetchJSON(base + "publications.json"),
      window.LabSite.fetchJSON(base + "about.json"),
    ]);
    return { site: site, people: people, research: research, publications: publications, about: about };
  }

  function iconSVG(name) {
    const common =
      ' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"';
    const paths = {
      soil: '<path d="M6 22c3-4 6-6 10-6s7 2 10 6"/><path d="M4 24h24"/><path d="M10 14c1.5-3 4-5 6-5s4.5 2 6 5"/><circle cx="16" cy="8" r="1.4"/>',
      water: '<path d="M16 6c0 0 8 10 8 14a8 8 0 1 1-16 0c0-4 8-14 8-14z"/><path d="M12.5 20.5c.8 2 2.2 3 3.5 3"/>',
      karst: '<path d="M4 24l6-10 5 6 5-8 8 12H4z"/><path d="M8 24v3M16 24v3M24 24v3"/><path d="M6 28h20"/>',
      sensing: '<circle cx="16" cy="18" r="3"/><path d="M10 14a8 8 0 0 1 12 0"/><path d="M7 11a12 12 0 0 1 18 0"/><path d="M16 21v4"/>',
      model: '<circle cx="8" cy="16" r="2.2"/><circle cx="16" cy="8" r="2.2"/><circle cx="24" cy="16" r="2.2"/><circle cx="16" cy="24" r="2.2"/><path d="M10 14.5l4-4.5M22 14.5l-4-4.5M10 17.5l4 4.5M22 17.5l-4 4.5"/>',
      field: '<path d="M4 20c4-3 8-3 12 0s8 3 12 0"/><path d="M4 24c4-3 8-3 12 0s8 3 12 0"/><path d="M16 6v8"/><path d="M12 10h8"/>',
      process: '<path d="M6 22h20"/><path d="M8 22v-6h4v6"/><path d="M16 22V10h4v12"/><path d="M6 26c6-2 14-2 20 0"/>'
    };
    const inner = paths[name] || paths.soil;
    return "<svg" + common + ">" + inner + "</svg>";
  }

  function keywordChips(member, extraClass) {
    const kws = member.keywords || [];
    if (!kws.length) return "";
    const cls = extraClass || "card__chips";
    return (
      '<ul class="' +
      cls +
      '">' +
      kws
        .map(function (k) {
          return "<li>" + esc(pick(k)) + "</li>";
        })
        .join("") +
      "</ul>"
    );
  }

  function personCard(m, featured) {
    const names = window.LabSite.namePair(m);
    const role = pick(m.role);
    const note = m.isPlaceholder ? pick(m.bio) : "";
    const href = m.profileHref
      ? m.profileHref
      : m.hasProfile
        ? "member.html?id=" + encodeURIComponent(m.id)
        : "";
    const tag = href ? "a" : "article";
    const extraClass = [
      "card",
      href ? "card--link" : "card--static",
      featured ? "card--featured" : "",
      m.isPlaceholder ? "card--placeholder" : "",
    ]
      .filter(Boolean)
      .join(" ");

    const attr = href
      ? ' href="' + href + '"'
      : ' aria-label="' + esc(names.primary) + '"';

    return (
      "<" +
      tag +
      ' class="' +
      extraClass +
      '"' +
      attr +
      ">" +
      '<div class="card__media">' +
      window.LabSite.portraitHTML(m) +
      "</div>" +
      '<div class="card__body">' +
      (role ? '<p class="card__role">' + esc(role) + "</p>" : "") +
      '<h3 class="card__title">' +
      esc(names.primary) +
      "</h3>" +
      (names.secondary
        ? '<p class="card__name-alt">' + esc(names.secondary) + "</p>"
        : "") +
      (note ? '<p class="card__meta">' + esc(note) + "</p>" : "") +
      keywordChips(m) +
      "</div>" +
      "</" +
      tag +
      ">"
    );
  }

  function renderPeopleGroups(peopleData, container) {
    if (!container) return;
    const members = (peopleData && peopleData.members) || [];
    const order =
      (peopleData && peopleData.groupOrder) || [
        "pi",
        "researcher",
        "graduate",
        "assistant",
      ];

    if (!members.length) {
      container.innerHTML =
        '<p class="status-msg">' + esc(t("people.emptyAll")) + "</p>";
      return;
    }

    container.innerHTML = order
      .map(function (groupId) {
        const groupMembers = members.filter(function (m) {
          return m.group === groupId;
        });
        const featured = groupId === "pi";
        const cards = groupMembers.length
          ? '<div class="card-grid' +
            (featured ? " card-grid--pi" : "") +
            '">' +
            groupMembers
              .map(function (m) {
                return personCard(m, featured);
              })
              .join("") +
            "</div>"
          : '<p class="status-msg">' + esc(t("people.empty")) + "</p>";

        return (
          '<section class="people-group' +
          (featured ? " people-group--pi" : "") +
          '" aria-labelledby="group-' +
          esc(groupId) +
          '">' +
          '<h2 class="people-group__title" id="group-' +
          esc(groupId) +
          '">' +
          esc(t("groups." + groupId)) +
          "</h2>" +
          cards +
          "</section>"
        );
      })
      .join("");
  }

  function renderPeopleCards(members, container) {
    renderPeopleGroups({ members: members || [], groupOrder: ["pi", "researcher", "graduate", "assistant"] }, container);
  }

  function renderThemes(themes, container) {
    if (!container) return;
    if (!themes || !themes.length) {
      container.innerHTML =
        '<p class="status-msg">' + esc(t("research.empty")) + "</p>";
      return;
    }

    container.innerHTML = themes
      .map(function (th, i) {
        const n = String(i + 1).padStart(2, "0");
        const desc = pick(th.description);
        const descClass = isPh(th.description)
          ? "theme-card__desc placeholder-text"
          : "theme-card__desc";
        return (
          '<article class="theme-card" id="' +
          esc(th.id) +
          '">' +
          '<div class="theme-card__mark" aria-hidden="true">' +
          '<span class="theme-card__index">' +
          n +
          "</span>" +
          '<span class="theme-icon">' +
          iconSVG(th.icon) +
          "</span>" +
          "</div>" +
          "<div>" +
          '<h3 class="theme-card__title">' +
          esc(pick(th.title)) +
          "</h3>" +
          '<p class="' +
          descClass +
          '">' +
          esc(desc) +
          "</p>" +
          "</div>" +
          "</article>"
        );
      })
      .join("");
  }

  function boldYuchuanFan(authorsEscaped) {
    return String(authorsEscaped || "").replace(
      /Yuchuan Fan/g,
      "<strong>Yuchuan Fan</strong>"
    );
  }

  function isRealPublication(p) {
    if (!p) return false;
    if (p.isPlaceholder) return false;
    return !isPh(p.title) && !isPh(p.authors) && !isPh(p.venue);
  }

  function pubItemHTML(p) {
    const doiRaw = pick(p.doi);
    const doi =
      doiRaw && !isPh(p.doi)
        ? ' · <a href="https://doi.org/' +
          esc(doiRaw) +
          '" rel="noopener">DOI</a>'
        : "";
    const authorsHtml = boldYuchuanFan(esc(pick(p.authors)));
    const venue = pick(p.venue);
    const year = pick(p.year);
    const metaHtml = [authorsHtml, esc(venue), esc(year)]
      .filter(Boolean)
      .join(" · ");
    return (
      '<li class="pub-item">' +
      '<h3 class="pub-item__title">' +
      esc(pick(p.title)) +
      "</h3>" +
      '<p class="pub-item__meta">' +
      metaHtml +
      doi +
      "</p>" +
      "</li>"
    );
  }

  function renderPublications(pubs, container) {
    if (!container) return;
    const real = (pubs || []).filter(isRealPublication);
    if (!real.length) {
      container.innerHTML =
        '<p class="status-msg">' + esc(t("publicationsPage.empty")) + "</p>";
      return;
    }

    const groups = {};
    const order = [];
    real.forEach(function (p) {
      const year = pick(p.year) || "";
      if (!groups[year]) {
        groups[year] = [];
        order.push(year);
      }
      groups[year].push(p);
    });
    order.sort(function (a, b) {
      const na = parseInt(a, 10);
      const nb = parseInt(b, 10);
      if (!isNaN(na) && !isNaN(nb) && na !== nb) return nb - na;
      return String(b).localeCompare(String(a));
    });

    container.innerHTML = order
      .map(function (year) {
        const heading = year
          ? '<h2 class="people-group__title">' + esc(year) + "</h2>"
          : "";
        return (
          '<section class="people-group" aria-label="' +
          esc(year) +
          '">' +
          heading +
          '<ul class="pub-list">' +
          groups[year].map(pubItemHTML).join("") +
          "</ul>" +
          "</section>"
        );
      })
      .join("");
  }

  function renderHome(data) {
    const site = data.site;
    const members = (data.people && data.people.members) || [];
    const themes = (data.research && data.research.themes) || [];
    const pi = members.find(function (m) {
      return m.group === "pi";
    }) || members.find(function (m) {
      return m.hasProfile && !m.isPlaceholder;
    });

    const labEls = document.querySelectorAll("[data-bind-lab-name]");
    labEls.forEach(function (el) {
      el.textContent = pick(site.labName);
    });

    const taglineEl = document.getElementById("home-tagline");
    if (taglineEl) {
      taglineEl.textContent = pick(site.tagline);
      taglineEl.classList.toggle("placeholder-text", isPh(site.tagline));
    }

    const instEl = document.getElementById("home-institution");
    if (instEl) instEl.textContent = pick(site.institution);

    const piBox = document.getElementById("home-pi");
    if (piBox && pi) {
      const names = window.LabSite.namePair(pi);
      const href = pi.profileHref || "pi.html";
      piBox.innerHTML =
        '<a class="pi-spotlight" href="' +
        href +
        '">' +
        '<div class="pi-spotlight__media">' +
        window.LabSite.portraitHTML(pi) +
        "</div>" +
        "<div>" +
        '<p class="card__role">' +
        esc(t("groups.pi")) +
        "</p>" +
        '<h3 class="card__title mt-0">' +
        esc(names.primary) +
        "</h3>" +
        (names.secondary
          ? '<p class="card__name-alt">' + esc(names.secondary) + "</p>"
          : "") +
        '<p class="card__meta">' +
        esc(pick(pi.role)) +
        "</p>" +
        '<p class="home-more">' +
        esc(t("home.viewPi")) +
        "</p>" +
        "</div>" +
        "</a>";
    }

    const aboutBox = document.getElementById("home-about");
    if (aboutBox && data.about && data.about.paragraphs && data.about.paragraphs.length) {
      aboutBox.innerHTML =
        '<p>' +
        esc(pick(data.about.paragraphs[0])) +
        "</p>";
    }

    const themePreview = document.getElementById("home-themes");
    if (themePreview) {
      themePreview.innerHTML = themes
        .slice(0, 5)
        .map(function (th) {
          return (
            '<a class="highlight-card highlight-card--link" href="research.html#' +
            encodeURIComponent(th.id) +
            '">' +
            '<span class="theme-icon theme-icon--sm" aria-hidden="true">' +
            iconSVG(th.icon) +
            "</span>" +
            "<h3>" +
            esc(pick(th.title)) +
            "</h3>" +
            '<p class="' +
            (isPh(th.description) ? "placeholder-text" : "") +
            '">' +
            esc(pick(th.description)) +
            "</p>" +
            "</a>"
          );
        })
        .join("");
    }

    const peoplePreview = document.getElementById("home-people");
    if (peoplePreview) {
      const preview = members.filter(function (m) {
        return !m.isPlaceholder;
      }).slice(0, 4);
      peoplePreview.innerHTML =
        '<div class="card-grid">' +
        preview.map(function (m) {
          return personCard(m, false);
        }).join("") +
        "</div>";
    }
  }

  function renderAbout(about, container) {
    if (!container || !about) return;
    const paras = (about.paragraphs || [])
      .map(function (p) {
        return '<p class="about-prose">' + esc(pick(p)) + "</p>";
      })
      .join("");
    const items = (about.approach || [])
      .map(function (item) {
        return (
          '<li class="approach-item">' +
          '<span class="theme-icon" aria-hidden="true">' +
          iconSVG(item.icon) +
          "</span>" +
          "<span>" +
          esc(pick(item)) +
          "</span>" +
          "</li>"
        );
      })
      .join("");
    const titleEl = document.getElementById("about-title");
    if (titleEl) titleEl.textContent = pick(about.title);
    container.innerHTML =
      '<div class="about-logo-wrap">' +
      '<img class="logo-mark logo-mark--about" src="assets/images/fanlab-lockup.png" alt="FAN Lab" />' +
      "</div>" +
      paras +
      '<section class="approach-section" aria-labelledby="approach-heading">' +
      '<h2 id="approach-heading">' +
      esc(pick(about.approachTitle)) +
      "</h2>" +
      '<ul class="approach-list">' +
      items +
      "</ul>" +
      "</section>";
  }

  function renderPI(profile, container) {
    if (!container || !profile) return;
    const names = window.LabSite.namePair(profile);
    const heading = pick(profile.honorific) || names.primary;
    const interests = (profile.interests || [])
      .map(function (item) {
        return "<li>" + esc(pick(item)) + "</li>";
      })
      .join("");
    const education = (profile.education || [])
      .map(function (item) {
        return "<li>" + esc(pick(item)) + "</li>";
      })
      .join("");
    const experience = (profile.experience || [])
      .map(function (item) {
        return "<li>" + esc(pick(item)) + "</li>";
      })
      .join("");
    container.innerHTML =
      '<section class="pi-hero">' +
      '<div class="pi-hero__media">' +
      '<div class="member-portrait">' +
      window.LabSite.portraitHTML(profile) +
      "</div>" +
      "</div>" +
      "<div>" +
      '<img class="logo-mark logo-mark--pi" src="assets/images/fanlab-lockup.png" alt="FAN Lab" />' +
      '<p class="member-header__role">' +
      esc(t("piPage.eyebrow")) +
      "</p>" +
      "<h1>" +
      esc(heading) +
      "</h1>" +
      (names.secondary
        ? '<p class="member-header__title">' + esc(names.secondary) + "</p>"
        : "") +
      '<p class="member-header__affil">' +
      esc(pick(profile.role)) +
      "</p>" +
      (window.LabSite.isPublicEmail(profile.email)
        ? '<p class="pi-email"><span>' +
          esc(t("piPage.email")) +
          '</span> <a href="mailto:' +
          esc(profile.email) +
          '">' +
          esc(profile.email) +
          "</a></p>"
        : "") +
      "</div>" +
      "</section>" +
      '<section class="member-section" aria-labelledby="pi-intro-heading">' +
      '<h2 id="pi-intro-heading" class="sr-only">' +
      esc(t("member.biography")) +
      "</h2>" +
      '<p class="bio-text bio-text--wide">' +
      esc(pick(profile.intro)) +
      "</p>" +
      "</section>" +
      '<section class="member-section" aria-labelledby="pi-interests-heading">' +
      '<h2 id="pi-interests-heading">' +
      esc(pick(profile.interestsTitle)) +
      "</h2>" +
      '<ul class="pi-bullets">' +
      interests +
      "</ul>" +
      "</section>" +
      '<section class="member-section" aria-labelledby="pi-edu-heading">' +
      '<h2 id="pi-edu-heading">' +
      esc(pick(profile.educationTitle)) +
      "</h2>" +
      '<ul class="edu-list">' +
      education +
      "</ul>" +
      "</section>" +
      '<section class="member-section" aria-labelledby="pi-exp-heading">' +
      '<h2 id="pi-exp-heading">' +
      esc(pick(profile.experienceTitle)) +
      "</h2>" +
      '<ul class="edu-list">' +
      experience +
      "</ul>" +
      "</section>" +
      '<section class="member-section" aria-labelledby="pi-phil-heading">' +
      '<h2 id="pi-phil-heading">' +
      esc(pick(profile.philosophyTitle)) +
      "</h2>" +
      '<p class="bio-text bio-text--wide philosophy-text">' +
      esc(pick(profile.philosophy)) +
      "</p>" +
      "</section>";
  }

  function renderContact(site) {
    const c = site.contact || {};
    const map = {
      "contact-email": c.email,
      "contact-phone": c.phone,
      "contact-address": c.address,
      "contact-office": c.office,
    };
    Object.keys(map).forEach(function (id) {
      const el = document.getElementById(id);
      if (!el) return;
      const val = pick(map[id]);
      el.textContent = val || pick({ en: "[ADD CONTACT DETAILS]", zh: "[待补充联系方式]" });
      el.classList.toggle("placeholder-text", isPh(map[id]));
    });

    const uni = document.getElementById("contact-university");
    if (uni) uni.textContent = pick(site.institution);

    const social = document.getElementById("contact-social");
    if (social && site.social) {
      social.innerHTML = site.social
        .map(function (s) {
          return (
            '<li><a href="' +
            (s.url && s.url !== "#" ? esc(s.url) : "#") +
            '">' +
            esc(pick(s.label)) +
            "</a></li>"
          );
        })
        .join("");
    }
  }

  window.LabRender = {
    loadAll: loadAll,
    renderPeopleCards: renderPeopleCards,
    renderPeopleGroups: renderPeopleGroups,
    renderThemes: renderThemes,
    renderPublications: renderPublications,
    renderHome: renderHome,
    renderContact: renderContact,
    renderAbout: renderAbout,
    renderPI: renderPI,
    personCard: personCard,
  };
})();
