/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-wknd-about.js
  var import_wknd_about_exports = {};
  __export(import_wknd_about_exports, {
    default: () => import_wknd_about_default
  });

  // tools/importer/parsers/cards-team.js
  function parse(element, { document }) {
    const image = element.querySelector(".cmp-image__image, .image img, img");
    const name = element.querySelector(".cmp-title__text, h3, h2, h4");
    const roleEl = element.querySelector(".cmp-title--black .cmp-title__text, h5");
    const contentCell = [];
    if (name) {
      const h3 = document.createElement("h3");
      h3.textContent = name.textContent.trim();
      contentCell.push(h3);
    }
    if (roleEl && roleEl !== name) {
      const h5 = document.createElement("h5");
      h5.textContent = roleEl.textContent.trim();
      contentCell.push(h5);
    }
    const socialLinks = Array.from(element.querySelectorAll(".cmp-button--icononly a, .cmp-button a[href]"));
    const socialParagraph = document.createElement("p");
    socialLinks.forEach((a) => {
      const href = a.getAttribute("href") || "";
      const iconSpan = a.querySelector('[class*="icon--"]');
      let platform = "";
      if (iconSpan) {
        const m = iconSpan.className.match(/cmp-button__icon--([a-z]+)/i);
        if (m) [, platform] = m;
      }
      if (!platform) {
        const hm = href.toLowerCase().match(/facebook|twitter|instagram/);
        if (hm) [platform] = hm;
      }
      if (!platform) return;
      const link = document.createElement("a");
      link.href = href;
      link.textContent = platform.charAt(0).toUpperCase() + platform.slice(1);
      socialParagraph.append(link, document.createTextNode(" "));
    });
    if (socialParagraph.querySelector("a")) contentCell.push(socialParagraph);
    if (!image && !contentCell.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [
      [image || "", contentCell.length ? contentCell : ""]
    ];
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-team", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/wknd-cleanup.js
  var TransformHook = {
    beforeTransform: "beforeTransform",
    afterTransform: "afterTransform"
  };
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.beforeTransform) {
      element.querySelectorAll(".button.cmp-button--primary a.cmp-button").forEach((a) => {
        const { document } = payload;
        const label = a.textContent.trim();
        a.textContent = label;
        if (a.parentElement && a.parentElement.tagName === "STRONG") return;
        const strong = document.createElement("strong");
        a.replaceWith(strong);
        strong.appendChild(a);
      });
    }
    if (hookName === TransformHook.afterTransform) {
      WebImporter.DOMUtils.remove(element, [
        // Auto-populated experience fragments (header/footer handled by EDS auto-blocks)
        "header.cmp-experiencefragment--header",
        "footer.cmp-experiencefragment--footer",
        // Mobile navigation chrome (toggle + duplicate mobile nav)
        "#toggleNav",
        "#mobileNav",
        // Analytics / tracking iframes
        "#destination_publishing_iframe_wkndsite_0",
        "iframe"
      ]);
    }
  }

  // tools/importer/import-wknd-about.js
  var parsers = {
    "cards-team": parse
  };
  var PAGE_TEMPLATE = {
    name: "wknd-about",
    description: "WKND About Us page: page title, an Our Contributors team grid (4-up) and a WKND Guides team grid (3-up), each person as a profile card with circular avatar, name, role and social links.",
    urls: [
      "https://wknd.site/us/en/about-us.html"
    ],
    blocks: [
      {
        name: "cards-team",
        instances: [".cmp-experience-fragment--contributor"]
      }
    ]
  };
  var transformers = [
    transform
  ];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), {
      template: PAGE_TEMPLATE
    });
    transformers.forEach((transformerFn) => {
      try {
        transformerFn.call(null, hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
  function findBlocksOnPage(document, template) {
    const pageBlocks = [];
    template.blocks.forEach((blockDef) => {
      const seen = /* @__PURE__ */ new Set();
      blockDef.instances.forEach((selector) => {
        const elements = document.querySelectorAll(selector);
        if (elements.length === 0) {
          console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
        }
        elements.forEach((element) => {
          if (seen.has(element)) return;
          seen.add(element);
          pageBlocks.push({
            name: blockDef.name,
            selector,
            element,
            section: blockDef.section || null
          });
        });
      });
    });
    console.log(`Found ${pageBlocks.length} block instances on page`);
    return pageBlocks;
  }
  var import_wknd_about_default = {
    transform: (payload) => {
      const { document, url, params } = payload;
      const main = document.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
      pageBlocks.forEach((block) => {
        if (!block.element.parentNode) return;
        const parser = parsers[block.name];
        if (parser) {
          try {
            parser(block.element, { document, url, params });
          } catch (e) {
            console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
          }
        } else {
          console.warn(`No parser found for block: ${block.name}`);
        }
      });
      executeTransformers("afterTransform", main, payload);
      const hr = document.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document);
      WebImporter.rules.transformBackgroundImages(main, document);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const path = WebImporter.FileUtils.sanitizePath(
        new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html$/, "")
      );
      return [{
        element: main,
        path,
        report: {
          title: document.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_wknd_about_exports);
})();
