import {
  attributesToObject,
  camelToKebabCase,
  stringToElements
} from './helpers.js';

const ComponentCache = {};
const CSSCache = {};

export class Component extends HTMLElement {
  constructor (componentPath) {
    super();

    if (componentPath) {
      this.componentPath = componentPath;
    } else {
      console.warn(
        'You did not send a path to the super method in your constructor. Thus CSS and HTML cannot be read for this component.',
        this
      );
      console.warn(
        'If shipping for modern browser, then call super with import.meta.url. If not, specify a path that is similar to import.meta.url yourself.'
      );
      console.warn('Should be the path to the component you are making.');
    }
  }

  /**
   * @abstract
   * @param {Record<string, string>} props
   * @returns {string | undefined}
 */
  render (props) {
    return undefined;
  }

  $ (q) {
    return this._sDOM.querySelector(q);
  }

  get cssPath () {
    return (
      this.componentPath && this.componentPath.replace(/\.(html|js)/gi, '.css')
    );
  }

  get htmlPath () {
    return (
      this.componentPath && this.componentPath.replace(/\.(css|js)/gi, '.html')
    );
  }

  get props () {
    return attributesToObject(this.attributes);
  }

  /**
   * Fetch sibling CSS if componentPath was sent in the super call.
   * Execute the render method of the component and return the result as a node
   *
   * @returns {Promise<DocumentFragment>}
   */
  async _render () {
    const cssText = CSSCache[this.cssPath];

    if (!cssText && this.cssPath) {
      const sheet = await this.fetchCSSAsStyleSheet();

      this._sDOM.adoptedStyleSheets = [sheet];
    }
    
    const htmlText = this.render(this.props);

    return stringToElements(htmlText);
  }

  async fetchHTMLAsDocFrag () {
    const response = await fetch(this.htmlPath);

    if (response.ok) {
      const text = await response.text();

      return stringToElements(text);
    }

    throw new Error('Fetch failed');
  }

  async fetchCSSAsStyleSheet () {
    const sheet = new CSSStyleSheet();
    const response = await fetch(this.cssPath);

    if (
      response.ok &&
      response.headers.get('content-type').indexOf('text/css') !== -1
    ) {
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
  componentDidMount () {}

  async connectedCallback () {
    this._sDOM = this.attachShadow({ mode: 'closed' });

    let content;

    if (this.render && this.render(this.props) !== undefined) {
      content = await this._render();
    } else if (this.componentPath) {
      content = await this._renderHTMLFile();
    } else {
      console.error(
        'No render function or component path found for static html/css.'
      );
    }

    this._sDOM.innerHTML = null;
    this._sDOM.appendChild(content);

    // Use single RAF for componentDidMount to avoid unnecessary frame delays
    requestAnimationFrame(() => {
      if (this.componentDidMount) {
        this.componentDidMount();
      }
    });
  }
}

/**
 * Takes a class for an extended Component/HTMLElement
 * and registes it basedof the ClassName as class-name.
 *
 * @param {CustomElementConstructor} classInstace Instance of a custom element to register
 * @param {{ name: ?string }} options
 * @returns {string} the kebab-case version fo ClassName
 */
export default function registerComponent (classInstace, { name } = { name: undefined }) {
  const componentName = 'is' in classInstace ? classInstace.is : classInstace.prototype.constructor.name;
  const kebabName = name || camelToKebabCase(componentName);

  customElements.define(
    kebabName,
    classInstace
  );

  return kebabName;
}
