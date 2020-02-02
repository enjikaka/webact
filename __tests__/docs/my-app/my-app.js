import { Component, registerComponent } from '/index.js';

class MyApp extends Component {
  constructor () {
    super(import.meta.url);
  }

  static get observedAttributes() {
    return ['to-whom'];
  }
}

export default registerComponent(MyApp);
