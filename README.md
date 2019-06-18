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

```
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

_Coming soon..._ ⏳

### Interop with React and similar

`export default` the result of the `registerComponent` method. This method returns the name of
the custom element for this component. In the example below that would be `my-app`.

my-app.js:
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

export default registerComponent(MyApp);
```

then in a React component import and use it like any other React component;

```
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
