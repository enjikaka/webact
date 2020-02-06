import { Component, registerComponent } from '/pkg/dist-web/index.bundled.js';

class MyApp extends Component {
  constructor () {
    super(import.meta.url);
  }

  static get observedAttributes() {
    return ['to-whom'];
  }
}

export default registerComponent(MyApp);
