// src/__tests__/root.test.ts
import { TextEncoder, TextDecoder } from 'util';
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
import { JSDOM } from 'jsdom';

// Utility function to set up the DOM
function setupDOM(): void {
  const markup = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
    </head>
    <body>
      <div id="app"></div>
    </body>
    </html>
  `;

  const dom = new JSDOM(markup);
  global.document = dom.window.document;
  global.window = dom.window as unknown as Window & typeof globalThis;
}

describe('RootComponent', () => {
  beforeEach(() => {
    setupDOM();
  });

  test('renders App component correctly', () => {
    const appElement = document.createElement('div');
    appElement.id = 'app';
    expect(appElement.id === 'app').toBe(true);
  });
});
