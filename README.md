# 🛠 Webact 🌎

Webact is a tiny library that helps you create web components in a manner similar to Vue and React. Without the need for tools heavy tools like Babel and Webpack that cripples your iterative workflow. ⚙

## Examples

### With render method | Like with React class based component

The following will take the result from the render method and put it in ShadomDOM and create a `<my-app>` component.

```
import { Component, registerComponent } from 'https://unpkg.com/webact';

class MyApp extends Component {
  static get observedAttributes() {
    return ['to-whom'];
  }

  render({ toWhom }) {
    return `<b>Hello ${toWhom}</b>`;
  }
}

registerComponent(MyApp);

document.querySelector('#app').innerHTML = `
  <div>
    <my-app to-whom="world"></my-app>
  </div>
`;
```


### With HTML and CSS | Like Vue sigle file components

Having HTML, CSS and JS in separate files if kind to both you and all the tools you use! Vue-style, and also the style I used Backbone with back in the days (read 2015).

The following will load the HTML file in ShadowDOM with the CSS and create a `<my-app>` component.

```
/components
   /my-app
      /my-app.js
      /my-app.css
      /my-app.html
```

```js
import { Component, registerComponent } from 'https://unpkg.com/webact';

class MyApp extends Component {
  constructor () {
    super(import.meta.url);
  }

  static get observedAttributes() {
    return ['to-whom'];
  }
}

registerComponent(MyApp);

document.querySelector('#app').innerHTML = `
  <div>
    <my-app to-whom="world"></my-app>
  </div>
`;
```

### With methods | Like React function components

You can create components via functions as well. This is done via the `registerFunctionalComponent` helper method exposed.

```js
registerFunctionalComponent(callback: Function, metaUrl: ?string)
```

#### Hooks

Some "hooks" like methods are exposed.

```ts
postRender(callback: Function)

/*
Takes a function as input. This function is called on `connectedCallback` in the custom element lifecycle. Equivalent to the `useEffect` hook and componentDidMount lifecycle callback in React.
*/
```

```ts
html(markup: string[])
/*
Tagged template litteral. Call this with your markup and it will be injected into the shadow DOM of your component.
*/
```

```ts
useHTML(path: ?string)
/*
If there is a path specified, it will be fetched and used for the markup in the shadow DOM. If no path is specified and the second argument to registerFunctionalComponent is the path to the JS file provided you follow the recommended component structure, a file with the same name as the js file in the same folder will be fetches but with the .html extention for use as markup in the shadow DOM.
*/
```

```ts
css(styles: string[])
/*
Tagged template litteral. Call this with your styles and it will be injected as a Constructable Stylesheet into the shadow DOM of you component.
*/
```

```ts
useCSS(path: ?string)
/*
If there is a path specified, it will be fetched and used for the Constructable Stylsheet for the shadow DOM. If no path is specified and the second argument to registerFunctionalComponent is the path to the JS file provided you follow the recommended component structure, a file with the same name as the js file in the same folder will be fetches but with the .css extention for use as styles in the shadow DOM.
*/
```

```ts
$(query: ?string): HTMLElement | ShadowRoot
/*
jQuery like helper method to querying stuff in the shadow dom. An empty string or no parameter can be passed in and the method will return the custom element instance. ':host' will select the shadow DOM root, just like the CSS rule.
*/
```

```ts
$$(query: string): NodeList
/*
jQuery like helper method to querying stuff in the shadow dom. An empty string or no parameter can be passed in and the method will return the custom element instance. ':host' will select the shadow DOM root, just like the CSS rule.
*/
```

#### Example

```js
import { registerFunctionalComponent } from 'https://unpkg.com/webact';

function FancyButton() {
  const { html, css, postRender, $ } = this;

  html`
    <button type="button>
      <slot></slot>
    </button>
  `;

  css`
    button {
      background-color: pink;
      color: gold;
      padding: 0.5em 1em;
      border-radius: 4px;
    }
  `;

  postRender(() => {
    const button = $('button');

    button.addEventListener('click', () => {}, false);
  });
}

export default registerFunctionalComponent(FancyButton);
```

### Interop with React and similar

`export default` the result of the `registerComponent` method. This method returns the name of
the custom element for this component. In the example below that would be `my-app`.

my-app.js:
```js
import { Component, registerComponent } from 'https://unpkg.com/webact';

class MyApp extends Component {
  static get observedAttributes() {
    return ['to-whom'];
  }

  render({ toWhom }) {
    return `<b>Hello ${toWhom}</b>`;
  }
}

export default registerComponent(MyApp);
```

then in a React component import and use it like any other React component;

```js
import * as React from 'react';

import MyRealApp from './my-app.js';

export default function MyReactApp () {
  return (
    <div class="ugly-jsx">
      <MyRealApp to-whom="Jeremy" />
    </div>
  );
}
```

## Usage

Webact is currently running live in producation at these sites.

### Saoirse

URL: https://saoir.se/

A small website to find music ids across music services.
This site uses server site rendering with [Wext.js](https://github.com/Vufuzi/wext.js). And uses Webact for all client side component. (Which are pre-filled on the server using Wext.js).
