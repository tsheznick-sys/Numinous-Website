import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import App, { legacyOffer } from '../src/App';

export function render(path: string) {
 return renderToStaticMarkup(createElement(MemoryRouter, { initialEntries: [path] }, createElement(App)));
}

export function lookupLegacyOffer(value: string) { return legacyOffer(value)?.id || null; }
