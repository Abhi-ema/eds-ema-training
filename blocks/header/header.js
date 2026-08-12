// media query match that indicates mobile/tablet width
const isDesktop = window.matchMedia('(min-width: 900px)');

/**
 * Fetch the nav fragment. Localhost/aem up serves /content/nav.plain.html;
 * DA/EDS production serves {navPath}.plain.html.
 * @param {string} navPath nav document path without the .plain.html suffix
 * @returns {Element|null} parsed fragment body element
 */
async function fetchNav(navPath) {
  let resp = await fetch('/content/nav.plain.html');
  if (!resp.ok) {
    resp = await fetch(`${navPath}.plain.html`);
  }
  if (!resp.ok) return null;
  const html = await resp.text();
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.body;
}

/**
 * Toggles the mobile nav open/closed.
 * @param {Element} nav the nav element
 * @param {boolean|null} forceExpanded optional forced state
 */
function toggleMenu(nav, forceExpanded = null) {
  const expanded = forceExpanded !== null
    ? !forceExpanded
    : nav.getAttribute('aria-expanded') === 'true';
  const button = nav.querySelector('.nav-hamburger button');
  document.body.style.overflowY = (expanded || isDesktop.matches) ? '' : 'hidden';
  nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  if (button) {
    button.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');
  }
}

/**
 * loads and decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  const navPath = '/nav';
  const fragment = await fetchNav(navPath);

  block.textContent = '';
  const nav = document.createElement('nav');
  nav.id = 'nav';
  if (fragment) {
    while (fragment.firstElementChild) nav.append(fragment.firstElementChild);
  }

  // The nav fragment has 4 top-level sections: utility, brand, sections, tools.
  const classes = ['utility', 'brand', 'sections', 'tools'];
  classes.forEach((c, i) => {
    const section = nav.children[i];
    if (section) section.classList.add(`nav-${c}`);
  });

  // Normalize any relative image src (flags, logos) to a root-relative /content path.
  nav.querySelectorAll('img').forEach((img) => {
    const raw = img.getAttribute('src') || '';
    if (!raw.startsWith('http') && !raw.startsWith('/')) {
      img.setAttribute('src', `/content/${raw.replace(/^\.?\/*/, '')}`);
    }
  });

  const navUtility = nav.querySelector('.nav-utility');

  // Build the Sign In dropdown: the "Sign In" link opens a dark panel with a
  // heading, "Welcome Back", username/password fields, forgot-password link,
  // and a submit button. Copy comes from the fragment; the form controls are
  // built here (controls are not allowed in the plain fragment).
  if (navUtility) {
    const signInLink = [...navUtility.querySelectorAll(':scope > p > a')]
      .find((a) => a.textContent.trim().toLowerCase() === 'sign in');
    const heading = [...navUtility.querySelectorAll(':scope > h2')]
      .find((h) => h.textContent.trim().toLowerCase() === 'sign in');
    const welcome = navUtility.querySelector(':scope > h3');
    // The sign-in form placeholder is authored as ":signin-form:". On localhost
    // that stays literal text, but once published the ":name:" shorthand is
    // converted to an icon span (<span class="icon icon-signin-form">), so match
    // either form.
    const formToken = [...navUtility.querySelectorAll(':scope > p')]
      .find((p) => p.textContent.trim() === ':signin-form:'
        || p.querySelector(':scope > .icon-signin-form'));
    const forgot = [...navUtility.querySelectorAll(':scope > p > a')]
      .find((a) => /forgot/i.test(a.textContent));

    if (signInLink && heading && formToken) {
      const signInWrap = document.createElement('div');
      signInWrap.className = 'nav-signin';

      const trigger = document.createElement('button');
      trigger.type = 'button';
      trigger.className = 'nav-signin-trigger';
      trigger.setAttribute('aria-expanded', 'false');
      trigger.textContent = signInLink.textContent.trim();
      signInLink.closest('p').replaceWith(trigger);

      const panel = document.createElement('div');
      panel.className = 'nav-signin-panel';
      panel.hidden = true;

      heading.classList.add('nav-signin-title');
      panel.append(heading);
      if (welcome) {
        welcome.classList.add('nav-signin-welcome');
        panel.append(welcome);
      }

      // Build the form. Reading order (matches source): username → password →
      // forgot-password link → submit button.
      const form = document.createElement('form');
      form.className = 'nav-signin-form';
      form.action = '/us/en';
      const username = document.createElement('input');
      username.type = 'text';
      username.name = 'username';
      username.placeholder = 'USERNAME';
      username.setAttribute('aria-label', 'Username');
      const password = document.createElement('input');
      password.type = 'password';
      password.name = 'password';
      password.placeholder = 'PASSWORD';
      password.setAttribute('aria-label', 'Password');
      form.append(username, password);

      if (forgot) {
        forgot.classList.add('nav-signin-forgot');
        // move the forgot link (and its <p>) into the form after the fields
        form.append(forgot.closest('p'));
      }

      const submit = document.createElement('button');
      submit.type = 'submit';
      submit.className = 'nav-signin-submit';
      submit.textContent = 'Sign In';
      form.append(submit);

      // Drop the token paragraph and add the assembled form to the panel.
      formToken.closest('p').remove();
      panel.append(form);

      trigger.addEventListener('click', () => {
        const open = trigger.getAttribute('aria-expanded') === 'true';
        trigger.setAttribute('aria-expanded', open ? 'false' : 'true');
        panel.hidden = open;
      });
      document.addEventListener('click', (e) => {
        if (!signInWrap.contains(e.target)) {
          trigger.setAttribute('aria-expanded', 'false');
          panel.hidden = true;
        }
      });

      signInWrap.append(trigger, panel);
      navUtility.prepend(signInWrap);
    }
  }

  // Build the language selector in the utility bar: a toggle (current flag +
  // locale + chevron) that opens the country/language dropdown.
  if (navUtility) {
    const localeP = [...navUtility.querySelectorAll(':scope > p')].find((p) => p.querySelector('img'));
    const dropdown = navUtility.querySelector(':scope > ul');
    if (localeP && dropdown) {
      const langWrap = document.createElement('div');
      langWrap.className = 'nav-lang';

      const toggle = document.createElement('button');
      toggle.type = 'button';
      toggle.className = 'nav-lang-toggle';
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Toggle language');
      while (localeP.firstChild) toggle.append(localeP.firstChild);
      const chevron = document.createElement('span');
      chevron.className = 'nav-lang-chevron';
      toggle.append(chevron);
      localeP.remove();

      dropdown.classList.add('nav-lang-menu');
      dropdown.hidden = true;

      toggle.addEventListener('click', () => {
        const open = toggle.getAttribute('aria-expanded') === 'true';
        toggle.setAttribute('aria-expanded', open ? 'false' : 'true');
        dropdown.hidden = open;
      });
      document.addEventListener('click', (e) => {
        if (!langWrap.contains(e.target)) {
          toggle.setAttribute('aria-expanded', 'false');
          dropdown.hidden = true;
        }
      });

      langWrap.append(toggle, dropdown);
      navUtility.append(langWrap);
    }
  }

  // Mark the current page's nav link as active (source: cmp-navigation__item
  // --active + aria-current="page"). Match by pathname, ignoring the .html
  // suffix and any /content prefix so it works on localhost and production.
  const navSections = nav.querySelector('.nav-sections');
  if (navSections) {
    const normalize = (p) => (p || '')
      .replace(/^\/content/, '')
      .replace(/\.html$/, '')
      .replace(/\/index$/, '')
      .replace(/\/$/, '');
    const here = normalize(window.location.pathname);
    navSections.querySelectorAll('a[href]').forEach((a) => {
      if (normalize(new URL(a.href, window.location.origin).pathname) === here) {
        a.setAttribute('aria-current', 'page');
        a.closest('li')?.classList.add('nav-active');
      }
    });
  }

  // Brand: strip any button decoration from the logo link (image paths are
  // already normalized above for the whole nav).
  const navBrand = nav.querySelector('.nav-brand');
  if (navBrand) {
    const brandLink = navBrand.querySelector('a');
    if (brandLink) {
      brandLink.className = '';
      const container = brandLink.closest('.button-container');
      if (container) container.className = '';
    }
  }

  // Tools: replace the :search: token with a real search input built here (not
  // in the fragment). Like the sign-in token, ":search:" stays literal on
  // localhost but is published as an icon span (.icon-search), so match either.
  const navTools = nav.querySelector('.nav-tools');
  if (navTools) {
    const token = [...navTools.querySelectorAll('p')]
      .find((p) => p.textContent.trim() === ':search:'
        || p.querySelector(':scope > .icon-search'));
    if (token) {
      const form = document.createElement('form');
      form.className = 'nav-search';
      form.setAttribute('role', 'search');
      form.action = '/us/en/search';
      const input = document.createElement('input');
      input.type = 'search';
      input.name = 'q';
      input.placeholder = 'SEARCH';
      input.setAttribute('aria-label', 'Search');
      form.append(input);
      token.replaceWith(form);
    }
  }

  // Hamburger for mobile.
  const hamburger = document.createElement('div');
  hamburger.classList.add('nav-hamburger');
  hamburger.innerHTML = `<button type="button" aria-controls="nav" aria-label="Open navigation">
      <span class="nav-hamburger-icon"></span>
    </button>`;
  hamburger.addEventListener('click', () => toggleMenu(nav));
  nav.prepend(hamburger);
  nav.setAttribute('aria-expanded', 'false');

  // Reset menu state when crossing the desktop/mobile breakpoint.
  isDesktop.addEventListener('change', () => toggleMenu(nav, isDesktop.matches));

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  block.append(navWrapper);
}
