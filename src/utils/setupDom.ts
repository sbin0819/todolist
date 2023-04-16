import { JSDOM } from 'jsdom';

export function setupDOM(): void {
  const markup = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      ...
    </head>
    <body>
      <div id="app"></div>
    </body>
    </html>
  `;

  const dom = new JSDOM(markup);
  global.document = dom.window.document;
  //   global.window = dom.window;
}
