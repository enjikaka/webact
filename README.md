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

The following will load the HTML file in ShadoWDOM with the CSS and create a `<my-app>` component.

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