import { registerFunctionComponent } from '../webact.js';

function DerpButton () {
  const { useHTML, useCSS } = this;

  useHTML();
  useCSS();
}

export default registerFunctionComponent(DerpButton, import.meta.url);
