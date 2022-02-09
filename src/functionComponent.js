import { camelToKebabCase, html, css, attributesToObject } from './helpers.js';

const componentsByUs = [];

const HMROverride = new Map();

const templates = new Map();
const styleSheets = new Map();

const cssFetches = new Map();
const htmlFetches = new Map();

/**
 * @param {Function} functionalComponent
 * @param {{ metaUrl: ?string, observedAttributes: string[] }} options
 * @returns {CustomElementConstructor}
 */
function generateFunctionComponent (
  functionalComponent,
  { metaUrl, observedAttributes, kebabName }
) {
  return class extends HTMLElement {
    constructor () {
      super();

      this._postRender = undefined;
      this._propsChanged = undefined;
      this._hmrUpdate = false;
      this._componentPath = metaUrl;

      this._hasRendered = false;

      document.addEventListener('esm-hmr:webact-function-component', () => {
        this._hmrUpdate = true;
        functionalComponent = HMROverride.has(kebabName) ?
          HMROverride.get(kebabName) :
          functionalComponent;
        this._render();
      });
    }

    set _html (documentFragment) {
      if (!templates.has(kebabName) || this._hmrUpdate) {
        const templateElement = document.createElement('template');

        templateElement.content.appendChild(documentFragment);

        templates.set(kebabName, templateElement);
      }
    }

    get _html () {
      return templates.has(kebabName) ?
        templates.get(kebabName).content.cloneNode(true) :
        null;
    }

    set _css (cssStyleSheet) {
      if (!styleSheets.has(kebabName) || this._hmrUpdate) {
        styleSheets.set(kebabName, cssStyleSheet);
      }
    }

    get _css () {
      return styleSheets.has(kebabName) ? styleSheets.get(kebabName) : null;
    }

    get cssPath () {
      return (
        this._componentPath &&
        this._componentPath.replace(/\.(html|js)/gi, '.css')
      );
    }

    get htmlPath () {
      return (
        this._componentPath &&
        this._componentPath.replace(/\.(css|js)/gi, '.html')
      );
    }

    static get observedAttributes () {
      return observedAttributes;
    }

    /**
     * @param {Record<string, string>} props
     * @param {{ force: boolean }} options
     */
    async _render (props) {
      this._rendering = functionalComponent.apply(this.customThis, [props]);

      if (this._rendering instanceof Promise) {
        await this._rendering;
      }

      if (this._css) {
        if (
          'adoptedStyleSheets' in this._sDOM &&
          this._css instanceof CSSStyleSheet
        ) {
          requestAnimationFrame(() => {
            this._sDOM.adoptedStyleSheets = [this._css];
          });
        }

        if (this._css instanceof HTMLStyleElement) {
          this._sDOM.appendChild(this._css);
        }
      } else if (document.location.href.includes('localhost')) {
        console.warn(`<${kebabName}>: Missing CSS. Will render without it.`);
      }

      if (this._html) {
        requestAnimationFrame(() => this._sDOM.appendChild(this._html));
      } else if (document.location.href.includes('localhost')) {
        console.warn(`<${kebabName}>: Missing HTML. Will render without it.`);
      }

      if (this._postRender instanceof Function) {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            this._postRender();
            this._hmrUpdate = false;
            this._hasRendered = true;
          });
        });
      }
    }

    get _props () {
      return attributesToObject(this.attributes);
    }

    get customThis () {
      return {
        /**
         * @param {string[]} strings
         * @returns {DocumentFragment}
         */
        html: (strings, ...rest) => {
          if (
            // A template has already been provided. Only allowed once. Ignore subsequent attempts.
            this._html !== null &&
            // HMR is an expection though.
            this._hmrUpdate === false
          ) {
            return;
          }

          this._html = html(strings, ...rest);

          return this._html;
        },
        /**
         * @param {string[]} strings
         * @returns {CSSStyleSheet}
         */
        css: (strings, ...rest) => {
          // A stylesheet has already been provided. Only allowed once. Ignore subsequent attempts.
          if (
            // A template has already been provided. Only allowed once. Ignore subsequent attempts.
            this._css !== null &&
            // HMR is an expection though.
            this._hmrUpdate === false
          ) {
            return;
          }

          this._css = css(strings, ...rest);

          return this._css;
        },
        /**
         * @param {string | URL} path
         */
        useHTML: async path => {
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

            this.customThis.html([text]);
          };

          const promise = htmlFetching();

          htmlFetches.set(kebabName, promise);

          return promise;
        },
        /**
         * @param {string | URL} path
         */
        useCSS: async path => {
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

            this.customThis.css([text]);

            cssFetches.delete(kebabName);
          };

          const promise = cssFetching();

          cssFetches.set(kebabName, promise);

          return promise;
        },
        postRender: method => {
          this._postRender = method;
        },
        deRender: method => {
          this._deRender = method;
        },
        propsChanged: method => {
          this._propsChanged = method;
        },
        $: selector => {
          if (selector === undefined || selector === ':host') {
            return this;
          }

          if (selector === ':root') {
            return this._sDOM;
          }

          return this._sDOM.querySelector(selector);
        },
        $$: selector => this._sDOM.querySelectorAll(selector)
      };
    }

    async attributeChangedCallback () {
      if (this._rendering instanceof Promise) {
        await this._rendering;
      }

      requestAnimationFrame(() => {
        if (this._propsChanged instanceof Function) {
          this._propsChanged(attributesToObject(this.attributes));
        } else if (document.location.href.includes('localhost')) {
          console.error(`
            <${kebabName}>: Attribute has changed and you are observing attributes, but not handling them in a propsChanged handler.
            Remove observedAttributes or or actually use them.
          `);
        }
      });
    }

    async connectedCallback () {
      this._sDOM = this.attachShadow({
        mode: 'closed'
      });

      this._render(this._props);
    }

    disconnectedCallback () {
      if (this._deRender) {
        this._deRender();
      }
    }
  };
}

/**
 * @typedef FunctionComponentOptions
 * @prop {string} [metaUrl]
 * @prop {string[]} [observedAttributes]
 * @prop {string} [name]
 */

/**
 * @param {Function} functionComponent
 * @param {FunctionComponentOptions} options
 * @returns {string} Custom element tag name.
 */
export default function registerFunctionComponent (
  functionComponent,
  { metaUrl, observedAttributes, name } = {
    metaUrl: undefined,
    observedAttributes: [],
    name: undefined
  }
) {
  const kebabName = name || camelToKebabCase(functionComponent.name);

  if (customElements.get(kebabName)) {
    if (componentsByUs.includes(kebabName)) {
      HMROverride.set(kebabName, functionComponent);
      document.dispatchEvent(
        new CustomEvent('esm-hmr:webact-function-component')
      );
    } else {
      throw new Error(`
        Some else has already registered <${kebabName}> in the custom element registry.
      `);
    }
  } else {
    const customElementClass = generateFunctionComponent(functionComponent, {
      metaUrl,
      observedAttributes,
      kebabName
    });

    customElements.define(kebabName, customElementClass);
    componentsByUs.push(kebabName);
  }

  return kebabName;
}
