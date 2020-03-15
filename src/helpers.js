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
export function css (strings, ...rest) {
  const text = Array.isArray(strings) ?
    strings.reduce((acc, curr, i) => {
      return acc + (rest[i] ? curr + rest[i] : curr);
    }, '') :
    strings;
  const sheet = new CSSStyleSheet();

  // @ts-ignore
  sheet.replace(text);

  return sheet;
}

/**
 * @export
 * @param {string[] | string} strings
 * @param {any[]} rest
 * @returns {DocumentFragment}
 */
export function html (strings, ...rest) {
  const text = Array.isArray(strings) ?
    strings.reduce((acc, curr, i) => {
      return acc + (rest[i] ? curr + rest[i] : curr);
    }, '') :
    strings;

  return stringToElements(text);
}
