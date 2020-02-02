import 'construct-style-sheets-polyfill';

/**
 * Converts a snake-case string to camelCase
 *
 * @param {string} str kebab-cased string
 * @returns {string} camelCased string
 */
function kebabToCamelCase (str) {
  return str.replace(/(-)([a-z])/g, g => g[1].toUpperCase());
}

/**
 * Converts a camelCase string to kebab-case
 *
 * @param {string} str camelCased string
 * @returns {string} kebab-cased string
 */
function camelToKebabCase (str) {
  return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

/**
 * Takes attributes from element and creates an object
 * with the keys camelCased.
 *
 * @param {NamedNodeMap} attributes Element.attributes
 * @returns {object} Object with camelCased keys
 */
function attributesToObject (attributes) {
  return attributes ?
    Array.from(attributes).reduce(
      (cur, { localName, value }) => ({
        ...cur,
        [kebabToCamelCase(localName)]: value
      }),
      {}
    ) :
    {};
}

/**
 * Converts a string of HTML into nodes.
 *
 * @param {string} string HTML in string form
 * @returns {Node[]} Nodes parsed from the HTML string
 */
export function stringToElements (string) {
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
export function registerComponent (classInstace) {
  // @ts-ignore
  const componentName = 'is' in classInstace ? classInstace.is : classInstace.prototype.constructor.name;
  const kebabName = camelToKebabCase(componentName);

  customElements.define(kebabName, classInstace);

  return kebabName;
}

const ComponentCache = {};
const CSSCache = {};

export class Component extends HTMLElement {
  constructor (componentPath) {
    super();

    if (componentPath) {
      this.componentPath = componentPath;
    } else {
      console.warn('You did not send a path to the super method in your constructor. Thus CSS and HTML cannot be read for this component.', this);
      console.warn('If shipping for modern browser, then call super with import.meta.url. If not, specify a path that is similar to import.meta.url yourself.');
      console.warn('Should be the path to the component you are making.');
    }
  }

  $ (q) {
    return this._sDOM.querySelector(q);
  }

  get cssPath () {
    return this.componentPath && this.componentPath.replace(/\.js/gi, '.css');
  }

  get htmlPath () {
    return this.componentPath && this.componentPath.replace(/\.js/gi, '.html');
  }

  get props () {
    return attributesToObject(this.attributes);
  }

  /**
   * Fetch sibling CSS if componentPath was sent in the super call.
   * Execute the render method of the component and return the result as a node
   *
   * @returns {Promise<Node>}
   */
  async _render () {
    const docFrag = new DocumentFragment();

    const cssText = CSSCache[this.cssPath];

    if (!cssText && this.cssPath) {
      const sheet = await this.fetchCSSAsStyleSheet();

      // @ts-ignore
      this._sDOM.adoptedStyleSheets = [sheet];
    }

    // @ts-ignore
    const htmlText = this.render(this.props);

    stringToElements(htmlText).forEach(c => docFrag.appendChild(c));

    return docFrag.cloneNode(true);
  }

  async fetchHTMLAsDocFrag () {
    const docFrag = new DocumentFragment();
    const response = await fetch(this.htmlPath);

    if (response.ok) {
      const text = await response.text();

      stringToElements(text).forEach(c => docFrag.appendChild(c));
    }

    return docFrag;
  }

  async fetchCSSAsStyleSheet () {
    const sheet = new CSSStyleSheet();
    const response = await fetch(this.cssPath);

    if (response.ok && response.headers.get('content-type').indexOf('text/css') !== -1) {
      const text = await response.text();

      // @ts-ignore
      await sheet.replace(text);
    }

    return sheet;
  }

  /**
   * Fetch sibling CSS and HTML if componentPath was sent in the super call.
   * If these has already been fetched (a component is initied more than one)
   * then re-use the cached document fragment instead of fethcing again.
   *
   * @returns {Promise<Node>}
   */
  async _renderHTMLFile () {
    const componentId = btoa(this.componentPath);

    if (!ComponentCache[componentId]) {
      ComponentCache[componentId] = Promise.all([
        this.fetchHTMLAsDocFrag(),
        this.fetchCSSAsStyleSheet()
      ]);
    }

    const [docFrag, sheet] = await ComponentCache[componentId];

    // @ts-ignore
    this._sDOM.adoptedStyleSheets = [sheet];

    return docFrag.cloneNode(true);
  }

  // Kinda like Reacts componentDidMount
  componentDidMount () { }

  async connectedCallback () {
    this._sDOM = this.attachShadow({ mode: 'closed' });

    let content;

    // @ts-ignore
    if (this.render) {
      content = await this._render();
    } else if (this.componentPath) {
      content = await this._renderHTMLFile();
    } else {
      console.error('No render function or component path found for static html/css.');
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
