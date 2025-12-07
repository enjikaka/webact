/**
 * Converts a snake-case string to camelCase
 *
 * @param {string} str kebab-cased string
 * @returns {string} camelCased string
 */
export function kebabToCamelCase(str) {
  return str.replace(/(-)([a-z])/g, (g) => g[1].toUpperCase());
}

/**
 * Converts a camelCase string to kebab-case
 *
 * @param {string} str camelCased string
 * @returns {string} kebab-cased string
 */
export function camelToKebabCase(str) {
  return str.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
}

/**
 * Takes attributes from element and creates an object
 * with the keys camelCased.
 *
 * @param {NamedNodeMap} attributes Element.attributes
 * @returns {object} Object with camelCased keys
 */
export function attributesToObject(attributes) {
  return attributes
    ? Array.from(attributes).reduce(
        (acc, { localName, value }) =>
          Object.assign(acc, {
            [kebabToCamelCase(localName)]: value,
          }),
        {},
      )
    : {};
}

/**
 * Converts a string of HTML into nodes.
 *
 * @param {string} string HTML in string form
 * @returns {DocumentFragment} Nodes parsed from the HTML string
 */
export function stringToElements(string) {
  return document.createRange().createContextualFragment(string);
}

/**
 * @param {TemplateStringsArray} strings
 * @param {...any} rest
 * @returns {CSSStyleSheet}
 */
export function modernCSS(strings, ...rest) {
  const sheet = new CSSStyleSheet();
  sheet.replace(String.raw(strings, ...rest));
  return sheet;
}

/**
 * @param {TemplateStringsArray} strings
 * @param {...any} rest
 * @returns {HTMLStyleElement}
 */
export function oldCSS(strings, ...rest) {
  const style = document.createElement("style");
  style.innerText = String.raw(strings, ...rest);
  return style;
}

/**
 * @param {TemplateStringsArray} strings
 * @param {any[]} rest
 * @returns {CSSStyleSheet | HTMLStyleElement}
 */
export function css(strings, ...rest) {
  let modern = false;

  try {
    // eslint-disable-next-line no-new
    new CSSStyleSheet();
    modern = true;
  } catch (_e) {
    modern = false;
  }

  return modern ? modernCSS(strings, ...rest) : oldCSS(strings, ...rest);
}

/**
 * @export
 * @param {TemplateStringsArray} strings
 * @param {any[]} rest
 * @returns {DocumentFragment}
 */
export function html(strings, ...rest) {
  return stringToElements(String.raw(strings, ...rest));
}
