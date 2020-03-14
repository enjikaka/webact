import { registerFunctionalComponent } from '/pkg/dist-web/index.bundled.js';

function DerpButton () {
  const { useHTML, useCSS } = this;

  useHTML();
  useCSS();
}

export default registerFunctionalComponent(DerpButton, import.meta.url);
