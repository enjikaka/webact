import { registerFunctionalComponent } from '/webact.js';

function DerpButton () {
  const { useHTML, useCSS } = this;

  useHTML();
  useCSS();
}

export default registerFunctionalComponent(DerpButton, import.meta.url);
