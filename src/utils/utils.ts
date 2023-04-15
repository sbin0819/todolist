const utils = () => {
  const doc = document;

  const $ = (selector: string): Element => {
    return doc.querySelector(selector);
  };

  const createElement = (
    tagName: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    options: { [key: string]: any } = {}
  ): HTMLElement => {
    const element = doc.createElement(tagName);
    for (const key in options) {
      element.setAttribute(key, options[key]);
    }
    return element;
  };

  const setInnerHTML = (element: Element, html: string): void => {
    element.innerHTML = html;
    Array.from(element.querySelectorAll('script')).forEach(
      (oldScript: Element) => {
        const newScript = document.createElement('script');
        Array.from(oldScript.attributes).forEach((attr: Attr) =>
          newScript.setAttribute(attr.name, attr.value)
        );
        newScript.appendChild(document.createTextNode(oldScript.innerHTML));
        oldScript.parentNode?.replaceChild(newScript, oldScript);
      }
    );
  };

  return { $, createElement, doc, setInnerHTML };
};

export default utils;
