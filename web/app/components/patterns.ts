// Tileable background images drawn as SVG and used as CSS `background-image`.

const svg = (markup: string) =>
  `url("data:image/svg+xml,${encodeURIComponent(markup)}")`;

// Line-art tools (droplet, bolt, house, wrench, spanner, brush) for the services section.
export const toolsPattern = svg(`
<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160" fill="none" stroke="#002147" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M36 14c0 0-14 17-14 26a14 14 0 0 0 28 0c0-9-14-26-14-26z"/>
  <path d="M120 12l-14 26h12l-8 22 20-30h-12l8-18z"/>
  <path d="M20 132l20-18 20 18v18H20z"/><path d="M34 150v-10h12v10"/>
  <circle cx="114" cy="112" r="9"/><path d="M120 118l18 18"/>
  <path d="M76 82l12-12"/><path d="M70 88a6 6 0 1 1-8-8 6 6 0 0 1 8 8z"/><path d="M88 70a6 6 0 1 0 8-8"/>
</svg>`);

// Fine dotted grid for light sections.
export const dotGrid = svg(`
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
  <circle cx="2" cy="2" r="1" fill="#708090"/>
</svg>`);
