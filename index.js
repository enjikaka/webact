/**
 * Converts a snake-case string to camelCase
 *
 * @param {string} str kebab-cased string
 * @returns {string} camelCased string
 */
function kebabToCamelCase(str) {
  return str.replace(/(-)([a-z])/g, g => g[1].toUpperCase());
}

/**
 * Converts a camelCase string to kebab-case
 *
 * @param {string} str camelCased string
 * @returns {string} kebab-cased string
 */
function camelToKebabCase(str) {
  return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

/**
 * Takes attributes from element and creates an object
 * with the keys camelCased.
 *
 * @param {NamedNodeMap} attributes Element.attributes
 * @returns {object} Object with camelCased keys
 */
function attributesToObject(attributes) {
  return attributes ?
    Array.from(attributes).reduce(
      (cur, { localName, value }) => ({
        ...cur,
        [kebabToCamelCase(localName)]: value
      }),
      {},
    ) :
    {};
}

/**
 * Converts a string of HTML into nodes.
 *
 * @param {string} string HTML in string form
 * @returns {Node[]} Nodes parsed from the HTML string
 */
export function stringToElements(string) {
  const fragment = document.createRange().createContextualFragment(string);

  return [...fragment.children];
}

/**
 * Takes a class for an extended Component/HTMLElement
 * and registes it basedof the ClassName as class-name.
 *
 * @param {Function} classInstace Instance of a custom element to register
 * @returns {string} the kebab-case version fo ClassName
 */
export function registerComponent(classInstace) {
  const kebabName = camelToKebabCase(classInstace.prototype.constructor.name);

  customElements.define(kebabName, classInstace);

  return kebabName;
}

const ComponentCache = {};

export class Component extends HTMLElement {
  constructor(componentPath) {
    super();

    if (componentPath) {
      this.componentPath = componentPath;
    } else {
      console.warn('You did not send import.meta.url to the super method in your constructor. Thus CSS and HTML cannot be read for this component.', this);
    }
  }

  $(q) {
    return this._sDOM.querySelector(q);
  }

  set state(updates) {
    this._state = Object.freeze({
      ...(this._state || {}),
      ...updates
    });

    // @ts-ignore
    if (this.render) {
      this._render();
    }
  }

  get state() {
    return this._state;
  }

  get cssPath() {
    return this.componentPath && this.componentPath.replace(/\.js/gi, '.css');
  }

  get htmlPath() {
    return this.componentPath.replace(/\.js/gi, '.html');
  }

  get props() {
    return attributesToObject(this.attributes);
  }

  async _render() {
    const docFrag = new DocumentFragment();

    let cssText = '';

    if (this.cssPath) {
      const response = await fetch(this.cssPath);

      if (response.ok) {
        const css = await response.text();

        if (response.headers.get('content-type').indexOf('text/css') !== -1) {
          cssText = `<style>${css}</style>`;
        }
      }
    }

    // @ts-ignore
    const htmlText = this.render(this.props);

    stringToElements(`${cssText}${htmlText}`)
      .forEach(c => docFrag.appendChild(c));

    return docFrag.cloneNode(true);
  }

  async _renderHTMLFile() {
    const componentId = btoa(this.componentPath);

    if (!ComponentCache[componentId]) {
      const docFrag = new DocumentFragment();
      const fetchCSS = fetch(this.cssPath);
      const fetchHTML = fetch(this.htmlPath);

      const responseCSS = await fetchCSS;
      const responseHTML = await fetchHTML;

      const css = await responseCSS.text();
      const componentHTML = await responseHTML.text();
      const cssText = responseCSS.headers.get('content-type').indexOf('text/css') !== -1 ? css : '';

      stringToElements(`<style>${cssText}</style>${componentHTML}`)
        .forEach(c => docFrag.appendChild(c));

      ComponentCache[componentId] = docFrag;
    }

    return ComponentCache[componentId].cloneNode(true);
  }

  // eslint-disable-next-line no-unused-vars
  componentDidUpdate() { }

  componentDidMount() { }

  async attributeChangedCallback() {
    let content;

    // @ts-ignore
    if (this.render) {
      content = await this._render();
    } else {
      content = await this._renderHTMLFile();
    }

    this._sDOM.innerHTML = null;
    this._sDOM.appendChild(content);

    if (this.componentDidUpdate) {
      this.componentDidUpdate();
    }
  }

  async connectedCallback() {
    this._sDOM = this.attachShadow({ mode: 'closed' });

    let content;

    // @ts-ignore
    if (this.render) {
      content = await this._render();
    } else {
      content = await this._renderHTMLFile();
    }

    this._sDOM.innerHTML = null;
    this._sDOM.appendChild(content);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (this.componentDidMount) {
          this.componentDidMount();
        }
      });
    });
  }
}