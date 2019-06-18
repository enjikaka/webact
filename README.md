# Webact

## Examples

### With render method

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


### Example with external HTML and CSS

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
