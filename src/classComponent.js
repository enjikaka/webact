import {
  attributesToObject,
  camelToKebabCase,
  EventHub,
  stringToElements,
} from "./helpers.js";

import { CSSCache, HTMLCache } from "./state.js";

export class Component extends HTMLElement {
  /**
   * @param {string} componentPath 
   */
  constructor(componentPath) {
    super();

    if (componentPath) {
      this.componentPath = componentPath;
    } else {
      console.warn(
        "You did not send a path to the super method in your constructor. Thus CSS and HTML cannot be read for this component.",
        this,
      );
      console.warn(
        "If shipping for modern browser, then call super with import.meta.url. If not, specify a path that is similar to import.meta.url yourself.",
      );
      console.warn("Should be the path to the component you are making.");
    }
  }

  /**
   * @abstract
   * @param {Record<string, string>} _props
   * @returns {string | undefined}
   */
  // eslint-disable-next-line no-unused-vars
  render(_props) {
    return undefined;
  }

  /**
   * @abstract
   * @returns {void}
   */
  // eslint-disable-next-line no-unused-vars
  deRender() {
    return;
  }

  /**
   * 
   * @param {string} q 
   * @returns {ReturnType<typeof document.querySelector>}
   */
  $(q) {
    // @ts-expect-error
    return this._sDOM?.querySelector(q);
  }

  /**
   * 
   * @param {string} q 
   * @returns {ReturnType<typeof document.querySelectorAll>}
   */
  $$(q) {
    // @ts-expect-error
    return this._sDOM?.querySelectorAll(q);
  }

  get cssPath() {
    return this.componentPath?.replace(/\.(html|js)/gi, ".css");
  }

  get htmlPath() {
    return this.componentPath?.replace(/\.(css|js)/gi, ".html");
  }

  get props() {
    return attributesToObject(this.attributes);
  }

  /**
   * Fetch sibling CSS if componentPath was sent in the super call.
   * Execute the render method of the component and return the result as a node
   *
   * @returns {Promise<DocumentFragment>}
   */
  async _render() {
    this._events?.offAll();
    const sheet = await this.fetchCSSAsStyleSheet();

    if (this._sDOM && sheet) {
      this._sDOM.adoptedStyleSheets = [sheet];
    }

    const htmlText = this.render(this.props);

    if (htmlText) {
      return stringToElements(htmlText);
    }

    return new DocumentFragment();
  }

  _deRender() {
    if (this.deRender) {
      this.deRender();
    }
  }

  /**
   * @returns {Promise<Node>}
   */
  async fetchHTMLAsDocFrag() {
    if (!this.htmlPath) {
      throw new Error("Fetch failed, no html path provided.");
    }

    if (HTMLCache.has(this.htmlPath)) {
      return /** @type {HTMLTemplateElement} */ (HTMLCache.get(this.htmlPath)).content.cloneNode(true);
    }

    const response = await fetch(this.htmlPath);

    if (
      response.ok &&
      response.headers.get("content-type")?.includes("text/html")
    ) {
      const text = await response.text();
      const template = document.createElement("template");
      template.innerHTML = text;
      const docFrag = template.content;

      HTMLCache.set(this.htmlPath, template);

      return docFrag;
    }

    throw new Error("Fetch failed");
  }

  async fetchCSSAsStyleSheet() {
    if (!this.cssPath) {
      throw new Error("Fetch failed, no css path provided.");
    }

    if (CSSCache.has(this.cssPath)) {
      return CSSCache.get(this.cssPath);
    }

    const sheet = new CSSStyleSheet();
    const response = await fetch(this.cssPath);

    if (
      response.ok &&
      response.headers.get("content-type")?.includes("text/css")
    ) {
      const text = await response.text();

      await sheet.replace(text);

      CSSCache.set(this.cssPath, sheet);
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
  async _renderHTMLFile() {
    const [docFrag, sheet] = await Promise.all([
      this.fetchHTMLAsDocFrag(),
      this.fetchCSSAsStyleSheet(),
    ]);

    if (this._sDOM && sheet) {
      this._sDOM.adoptedStyleSheets = [sheet];
    }

    return docFrag.cloneNode(true);
  }

  // Kinda like Reacts componentDidMount
  componentDidMount() {}

  /**
   * @param {string} type
   * @param {string} selector
   * @param {EventListener} fn
   * @param {EventListenerOptions} options
   * @returns
   */
  on(type, selector, fn, options) {
    return this._events?.on(type, selector, fn, options);
  }

  offAll() {
    this._events?.offAll();
  }

  async connectedCallback() {
    this._sDOM = this.attachShadow({ mode: "closed" });
    this._events = new EventHub(this._sDOM);

    let content;

    if (this.render !== Component.prototype.render) {
      content = await this._render();
    } else if (this.componentPath) {
      content = await this._renderHTMLFile();
    } else {
      console.error(
        "No render function or component path found for static html/css.",
      );
    }

    if (content) {
      this._sDOM.innerHTML = "";
      this._sDOM.appendChild(content);
    }

    // Use single RAF for componentDidMount to avoid unnecessary frame delays
    if (this.componentDidMount) {
      queueMicrotask(() => this.componentDidMount());
    }
  }

  disconnectedCallback() {
    this._events?.offAll();
    if (this._deRender) this._deRender();
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
export default function registerComponent(
  classInstace,
  { name } = { name: null },
) {
  const componentName = "is" in classInstace
    ? classInstace.is
    : classInstace.prototype.constructor.name;
  const kebabName = name || camelToKebabCase(componentName);

  customElements.define(kebabName, classInstace);

  return kebabName;
}
