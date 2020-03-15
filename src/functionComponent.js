import { camelToKebabCase, html, css, attributesToObject } from './helpers.js';

/**
 * @param {Function} functionalComponent
 * @param {{ metaUrl: ?string, observedAttributes: string[] }} options
 * @returns {CustomElementConstructor}
 */
function generateFunctionComponent (functionalComponent, { metaUrl, observedAttributes }) {
  return class extends HTMLElement {
    constructor () {
      super();

      this._html = undefined;
      this._css = undefined;
      this._postRender = undefined;
      this._propsChanged = undefined;
      this._componentPath = metaUrl;
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
            resolve();
          });
        } else {
          console.warn('Missing HTML. Will render without it.');
        }

        resolve();
      });

      requestAnimationFrame(() => {
        if (this._postRender instanceof Function) {
          this._postRender();
        }
      });
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
          if (selector === undefined) {
            return this;
          }

          if (selector === ':host') {
            return this._sDOM;
          }

          return this._sDOM.querySelector(selector);
        },
        $$: selector => this._sDOM.querySelectorAll(selector)
      };
    }

    async attributeChangedCallback () {
      await this._render(attributesToObject(this.attributes));

      requestAnimationFrame(() => {
        if (this._propsChanged instanceof Function) {
          this._propsChanged(attributesToObject(this.attributes));
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
 * @param {{ metaUrl: ?string, observedAttributes: string[] }} options
 * @returns {string} Custom element tag name.
 */
export default function registerFunctionComponent (functionComponent, { metaUrl, observedAttributes }) {
  const kebabName = camelToKebabCase(functionComponent.name);

  customElements.define(
    kebabName,
    generateFunctionComponent(functionComponent, { metaUrl, observedAttributes })
  );

  return kebabName;
}
