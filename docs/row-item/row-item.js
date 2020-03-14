import { Component, registerComponent } from '/webact.js';

class RowItem extends Component {
  constructor () {
    super(import.meta.url);
  }

  static get observedAttributes() {
    return ['name'];
  }
}

export default registerComponent(RowItem);
