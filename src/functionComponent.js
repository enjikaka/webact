import { camelToKebabCase, html, css, attributesToObject } from './helpers.js';

const componentsByUs = [];

const HMROverride = new Map();

const templates = new Map();
const styleSheets = new Map();

/**
 * @param {Function} functionalComponent
 * @param {{ metaUrl: ?string, observedAttributes: string[] }} options
 * @returns {CustomElementConstructor}
 */
function generateFunctionComponent (functionalComponent, { metaUrl, observedAttributes, kebabName }) {
  return class extends HTMLElement {
    constructor () {
      super();

      this._fetchingHTML = false;
      this._fetchingCSS = false;
      this._postRender = undefined;
      this._propsChanged = undefined;
      this._componentPath = metaUrl;

      document.addEventListener('esm-hmr:webact-function-component', () => {
        functionalComponent = HMROverride.get(kebabName) ? HMROverride.get(kebabName) : functionalComponent;
        this._render();
      });
    }

    set _html (documentFragment) {
      if (!templates.has(kebabName)) {
        const templateElement = document.createElement('template');

        templateElement.content.appendChild(documentFragment);

        templates.set(kebabName, templateElement);
      } else {
        console.error('The component already has template initialized. Keep updates in postRender.');
      }
    }

    get _html () {
      return templates.get(kebabName).content.cloneNode(true);
    }

    set _css (cssStyleSheet) {
      if (!styleSheets.has(kebabName)) {
        styleSheets.set(kebabName, cssStyleSheet);
      } else {
        console.error('The component already has stylesheet initialized. Keep updates in postRender.');
      }
    }

    get _css () {
      return styleSheets.get(kebabName);
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

    async _render (props) {
      this._rendering = functionalComponent.apply(this.customThis, [props]);

      if (this._rendering instanceof Promise) {
        await this._rendering;
      }

      await new Promise(resolve => {
        if (this._css) {
          requestAnimationFrame(() => {
            // @ts-ignore
            this._sDOM.adoptedStyleSheets = [this._css];
          });
        } else {
          console.warn('Missing CSS. Will render without it.');
        }

        if (this._html) {
          requestAnimationFrame(() => {
            this._sDOM.innerHTML = null;
            this._sDOM.appendChild(this._html);
          });
        } else {
          console.warn('Missing HTML. Will render without it.');
        }

        resolve();
      });

      if (this._postRender instanceof Function) {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            this._postRender();
          });
        });
      }
    }

    get customThis () {
      return {
        /**
         * @param {string[]} strings
         * @returns {DocumentFragment}
         */
        html: (strings, ...rest) => {
          this._html = html(strings, ...rest);

          return this._html;
        },
        /**
         * @param {string[]} strings
         * @returns {CSSStyleSheet}
         */
        css: (strings, ...rest) => {
          this._css = css(strings, ...rest);

          return this._css;
        },
        /**
         * @param {string | URL} path
         */
        useHTML: async path => {
          // Do not try to fetch again if several instances are launched at once.
          if (this._fetchingHTML) {
            return;
          }

          this._fetchingHTML = true;
          path = path || this.htmlPath;

          if (!path) {
            return;
          }

          if (path instanceof URL) {
            path = path.toString();
          }

          const response = await fetch(path);
          const text = await response.text();

          return this.customThis.html([text]);
        },
        /**
         * @param {string | URL} path
         */
        useCSS: async path => {
          // Do not try to fetch again if several instances are launched at once.
          if (this._fetchingCSS) {
            return;
          }

          this._fetchingCSS = true;

          path = path || this.cssPath;

          if (!path) {
            return;
          }

          if (path instanceof URL) {
            path = path.toString();
          }

          const response = await fetch(path);
          const text = await response.text();

          return this.customThis.css([text]);
        },
        postRender: method => {
          this._postRender = method;
        },
        propsChanged: method => {
          this._propsChanged = method;
        },
        $: selector => {
          if (
            selector === undefined ||
            selector === ':host'
          ) {
            return this;
          }

          if (
            selector === ':root'
          ) {
            return this._sDOM;
          }

          return this._sDOM.querySelector(selector);
        },
        $$: selector => this._sDOM.querySelectorAll(selector)
      };
    }

    async attributeChangedCallback () {
      await this._rendering;

      requestAnimationFrame(() => {
        if (this._propsChanged instanceof Function) {
          this._propsChanged(attributesToObject(this.attributes));
        } else {
          console.error('You are observing attributes but not handling them in a propsChanged handler.');
        }
      });
    }

    async connectedCallback () {
      this._sDOM = this.attachShadow({
        mode: 'closed'
      });

      this._render(attributesToObject(this.attributes));
    }
  };
}

/**
 * @param {Function} functionComponent
 * @param {{ metaUrl: ?string, observedAttributes: string[], name: ?string }} options
 * @returns {string} Custom element tag name.
 */
export default function registerFunctionComponent (functionComponent, { metaUrl, observedAttributes, name } = { metaUrl: undefined, observedAttributes: [], name: undefined }) {
  const kebabName = name || camelToKebabCase(functionComponent.name);

  if (customElements.get(kebabName)) {
    if (componentsByUs.includes(kebabName)) {
      HMROverride.set(kebabName, functionComponent);
      document.dispatchEvent(new CustomEvent('esm-hmr:webact-function-component'));
    } else {
      throw new Error(`
        Some else has already registered <${kebabName}> in the custom element registry.
      `);
    }
  } else {
    const customElementClass = generateFunctionComponent(functionComponent, { metaUrl, observedAttributes, kebabName });

    customElements.define(kebabName, customElementClass);
    componentsByUs.push(kebabName);
  }

  return kebabName;
}
