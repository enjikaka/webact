/**
 * Converts a snake-case string to camelCase
 *
 * @param {string} str kebab-cased string
 * @returns {string} camelCased string
 */
export function kebabToCamelCase (str) {
  return str.replace(/(-)([a-z])/g, g => g[1].toUpperCase());
}

/**
 * Converts a camelCase string to kebab-case
 *
 * @param {string} str camelCased string
 * @returns {string} kebab-cased string
 */
export function camelToKebabCase (str) {
  return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

/**
 * Takes attributes from element and creates an object
 * with the keys camelCased.
 *
 * @param {NamedNodeMap} attributes Element.attributes
 * @returns {object} Object with camelCased keys
 */
export function attributesToObject (attributes) {
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
 * @returns {DocumentFragment} Nodes parsed from the HTML string
 */
export function stringToElements (string) {
  return document.createRange().createContextualFragment(string);
}

/**
 * @param {string[] | string} strings
 * @param {any[]} rest
 * @returns {CSSStyleSheet}
 */
export function modernCSS () {
  const sheet = new CSSStyleSheet();

  // @ts-ignore
  sheet.replace(String.raw(...arguments));

  return sheet;
}

/**
 * @param {string[] | string} strings
 * @param {any[]} rest
 * @returns {HTMLStyleElement}
 */
export function oldCSS () {
  const style = document.createElement('style');

  style.innerText = String.raw(...arguments);

  return style;
}

/**
 * @param {string[] | string} strings
 * @param {any[]} rest
 * @returns {CSSStyleSheet}
 */
export function css (strings, ...rest) {
  let modern = false;

  try {
    // eslint-disable-next-line no-new
    new CSSStyleSheet();
    modern = true;
  } catch (e) {
    modern = false;
  }

  return modern ? modernCSS(strings, ...rest) : oldCSS(strings, ...rest);
}

/**
 * @export
 * @param {string[] | string} strings
 * @param {any[]} rest
 * @returns {DocumentFragment}
 */
export function html () {
  return stringToElements(String.raw(...arguments));
}
