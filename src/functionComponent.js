import {
  attributesToObject,
  camelToKebabCase,
  EventHub,
  html,
  modernCSS,
} from "./helpers.js";

import { CSSCache, HTMLCache } from "./state.js";

const componentsByUs = [];

const HMROverride = new Map();

const htmlFetches = new Map();
const cssFetches = new Map();

const lastPropChange = new Map();

/** @typedef FunctionComponentOptions
 * @prop {string} [metaUrl]
 * @prop {string[]} [observedAttributes]
 * @prop {string} [name]
 * @prop {ShadowRootMode} [shadowRootMode]
 */

/**
 * @param {Function} functionalComponent
 * @param {FunctionComponentOptions} options
 * @returns {CustomElementConstructor}
 */
function _generateFunctionComponen(
  functionalComponent,
  { metaUrl, observedAttributes, name: kebabName, shadowRootMode },
) {
  return class extends HTMLElement {
    constructor() {
      super();

      this._postRender = undefined;
      this._propsChanged = undefined;
      this._hmrUpdate = false;
      this._componentPath = metaUrl;
      this._customThis = null;

      this._hasRendered = false;

      document.addEventListener("esm-hmr:webact-function-component", () => {
        this._hmrUpdate = true;
        functionalComponent = HMROverride.has(kebabName)
          ? HMROverride.get(kebabName)
          : functionalComponent;
        this._render(this._props);
      });
    }

    set _html(node) {
      if (!HTMLCache.has(this.htmlPath) || this._hmrUpdate) {
        const templateElement = document.createElement("template");

        templateElement.content.appendChild(node);

        HTMLCache.set(this.htmlPath, templateElement);
      }
    }

    /**
     * @returns {Node}
     */
    get _html() {
      return HTMLCache.has(this.htmlPath)
        ? HTMLCache.get(this.htmlPath).cloneNode(true)
        : null;
    }

    set _css(cssStyleSheet) {
      if (!CSSCache.has(this.htmlPath) || this._hmrUpdate) {
        CSSCache.set(this.htmlPath, cssStyleSheet);
      }
    }

    get _css() {
      return CSSCache.has(this.htmlPath) ? CSSCache.get(this.htmlPath) : null;
    }

    get cssPath() {
      return this._componentPath?.replace(/\.(html|js)/gi, ".css");
    }

    get htmlPath() {
      return this._componentPath?.replace(/\.(css|js)/gi, ".html");
    }

    static get observedAttributes() {
      return observedAttributes;
    }

    /**
     * @param {Record<string, string>} props
     */
    async _render(props) {
      this._events?.offAll();
      this._rendering = functionalComponent.apply(this.customThis, [props]);

      if (this._rendering instanceof Promise) {
        await this._rendering;
      }

      // Consolidate all DOM updates into a single RAF for better performance
      requestAnimationFrame(() => {
        // Apply CSS stylesheets
        if (CSSCache.has(this.cssPath)) {
          if ("adoptedStyleSheets" in this._sDOM) {
            this._sDOM.adoptedStyleSheets = [CSSCache.get(this.cssPath)];
          }

          /* TODO: Make it work with old style element again maybe?
          if (this._css instanceof HTMLStyleElement) {
            this._sDOM.appendChild(this._css);
          }
            */
        } else if (document.location.href.includes("localhost")) {
          console.warn(`<${kebabName}>: Missing CSS. Will render without it.`);
        }

        // Apply HTML template
        if (HTMLCache.has(this.htmlPath)) {
          this._sDOM.appendChild(HTMLCache.get(this.htmlPath).cloneNode(true));
        } else if (document.location.href.includes("localhost")) {
          console.warn(`<${kebabName}>: Missing HTML. Will render without it.`);
        }

        // Execute post-render callback in next frame to ensure DOM is fully updated
        if (this._postRender instanceof Function) {
          requestAnimationFrame(() => {
            this._postRender();
            this._hmrUpdate = false;
            this._hasRendered = true;
          });
        }
      });
    }

    get _props() {
      return attributesToObject(this.attributes);
    }

    get customThis() {
      if (this._customThis) {
        return this._customThis;
      }

      this._customThis = {
        /**
         * @param {TemplateStringsArray} strings
         * @returns {Node}
         */
        html: (strings, ...rest) => {
          if (
            // A template has already been provided. Only allowed once. Ignore subsequent attempts.
            HTMLCache.has(this.htmlPath) &&
            // HMR is an expection though.
            this._hmrUpdate === false
          ) {
            return;
          }

          const template = document.createElement("template");
          template.innerHTML = String.raw(strings, ...rest);

          HTMLCache.set(this.htmlPath, template);

          return HTMLCache.get(this.htmlPath).cloneNode(true);
        },
        /**
         * @param {TemplateStringsArray} strings
         * @returns {CSSStyleSheet}
         */
        css: (strings, ...rest) => {
          // A stylesheet has already been provided. Only allowed once. Ignore subsequent attempts.
          if (
            // A template has already been provided. Only allowed once. Ignore subsequent attempts.
            CSSCache.has(this.cssPath) &&
            // HMR is an expection though.
            this._hmrUpdate === false
          ) {
            return;
          }

          CSSCache.set(this.cssPath, modernCSS(strings, ...rest));

          return CSSCache.get(this.cssPath);
        },
        /**
         * @param {string | URL} path
         * @returns {Promise<void>}
         */
        useHTML: (path) => {
          // If another instance of this component is fetching HTML, then don't fetch again. Wait for same HTML file.
          if (htmlFetches.has(kebabName)) {
            return htmlFetches.get(kebabName);
          }

          path = path || this.htmlPath;

          if (!path) {
            return;
          }

          if (path instanceof URL) {
            path = path.toString();
          }

          const htmlFetching = async () => {
            const response = await fetch(path);
            const text = await response.text();

            // eslint-disable-next-line no-unused-expressions
            this.customThis.html`${text}`;

            htmlFetches.delete(kebabName);

            const template = document.createElement("template");
            template.innerHTML = text;

            HTMLCache.set(this.htmlPath, template);
          };

          const promise = htmlFetching();

          htmlFetches.set(kebabName, promise);

          return promise;
        },
        /**
         * @param {string | URL} path
         * @returns {Promise<void>}
         */
        useCSS: (path) => {
          // If another instance of this component is fetching CSS, then don't fetch again. Wait for same CSS file.
          if (cssFetches.has(kebabName)) {
            return cssFetches.get(kebabName);
          }

          path = path || this.cssPath;

          if (!path) {
            return;
          }

          if (path instanceof URL) {
            path = path.toString();
          }

          const cssFetching = async () => {
            const response = await fetch(path);
            const text = await response.text();

            CSSCache.set(this.cssPath, modernCSS`${text}`);

            cssFetches.delete(kebabName);
          };

          const promise = cssFetching();

          cssFetches.set(kebabName, promise);

          return promise;
        },
        /**
         * @param {Function} method
         */
        postRender: (method) => {
          this._postRender = method;
        },
        /**
         * @param {Function} method
         */
        deRender: (method) => {
          this._deRender = method;
        },
        /**
         * @param {Function} method
         */
        propsChanged: (method) => {
          this._propsChanged = method;
        },
        /**
         * @param {string} selector
         */
        $: (selector) => {
          if (selector === undefined || selector === ":host") {
            return this;
          }

          if (selector === ":root") {
            return this._sDOM;
          }

          return this._sDOM.querySelector(selector);
        },
        /**
         * @param {string} selector
         */
        $$: (selector) => this._sDOM.querySelectorAll(selector),
        /**
         * @param {string} type
         * @param {string} selector
         * @param {EventListener} fn
         * @param {EventListenerOptions} options
         */
        on: (type, selector, fn, options) =>
          this._events.on(type, selector, fn, options),
        offAll: () => this._events.offAll(),
      };

      return this._customThis;
    }

    async attributeChangedCallback() {
      if (this._rendering instanceof Promise) {
        await this._rendering;
      }

      // Only use RAF if we actually have a propsChanged handler
      if (this._propsChanged instanceof Function) {
        const serializedChange = JSON.stringify(
          attributesToObject(this.attributes),
        );

        // Avoid emitting propChanges when no props change, even if the attributeChangedCallback is run.
        if (lastPropChange.get(kebabName) === serializedChange) {
          return;
        }

        // Use RAF only for the actual prop change handling
        requestAnimationFrame(() => {
          this._propsChanged(attributesToObject(this.attributes));
          lastPropChange.set(kebabName, serializedChange);
        });
      } else if (document.location.href.includes("localhost")) {
        console.error(`
          <${kebabName}>: Attribute has changed and you are observing attributes, but not handling them in a propsChanged handler.
          Remove observedAttributes or or actually use them.
        `);
      }
    }

    connectedCallback() {
      this._sDOM = this.attachShadow({
        mode: shadowRootMode || "closed",
      });
      this._events = new EventHub(this._sDOM);

      this._render(this._props);
    }

    disconnectedCallback() {
      this._events?.offAll();

      if (this._deRender) {
        this._deRender();
      }
    }
  };
}

/**
 * @param {Function} functionComponent
 * @param {FunctionComponentOptions} options
 * @returns {string} Custom element tag name.
 */
export default function registerFunctionComponent(
  functionComponent,
  { metaUrl, observedAttributes, name, shadowRootMode } = {
    metaUrl: undefined,
    observedAttributes: [],
    name: undefined,
    shadowRootMode: "closed",
  },
) {
  const kebabName = name || camelToKebabCase(functionComponent.name);

  if (customElements.get(kebabName)) {
    if (componentsByUs.includes(kebabName)) {
      HMROverride.set(kebabName, functionComponent);
      document.dispatchEvent(
        new CustomEvent("esm-hmr:webact-function-component"),
      );
    } else {
      throw new Error(`
        Some else has already registered <${kebabName}> in the custom element registry.
      `);
    }
  } else {
    const customElementClass = _generateFunctionComponen(functionComponent, {
      metaUrl,
      observedAttributes,
      name: kebabName,
      shadowRootMode,
    });

    customElements.define(kebabName, customElementClass);
    componentsByUs.push(kebabName);
  }

  return kebabName;
}
