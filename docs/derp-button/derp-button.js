import { registerFunctionComponent } from '../webact.js';

async function DerpButton () {
  const { useHTML, useCSS } = this;

  await useHTML();
  await useCSS();
}

export default registerFunctionComponent(DerpButton, {
  metaUrl: import.meta.url
});
