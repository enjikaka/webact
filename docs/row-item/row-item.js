import { Component, registerComponent } from 'https://unpkg.com/webact';

class RowItem extends Component {
  constructor () {
    super(import.meta.url);
  }

  static get observedAttributes() {
    return ['name'];
  }
}

export default registerComponent(RowItem);
