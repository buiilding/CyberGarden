import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import vm from 'node:vm';
import domino from '@mixmark-io/domino';
import { marked } from 'marked';
import TurndownService from 'turndown';
import { readEditorSession, editorPath } from '../src/editor-auth.js';
import { gardenPath } from '../src/routes.js';

const source = readFileSync('src/app.js', 'utf8');
function setup({ editing = false, allowed = true } = {}) {
  const template = readFileSync('index.html', 'utf8');
  const html = template.replace('<!-- EDITOR -->', editing ? readFileSync('editor.html', 'utf8') : '');
  const window = domino.createWindow(html), document = window.document;
  const $ = selector => document.querySelector(selector);
  const elementQuery = window.HTMLElement.prototype.querySelectorAll;
  const documentQuery = document.querySelectorAll.bind(document);
  Object.defineProperties(window.HTMLElement.prototype, {
    querySelectorAll: { configurable: true, value(...args) { return Array.from(elementQuery.apply(this, args)); } },
    replaceChildren: { configurable: true, value(...nodes) { while (this.firstChild) this.removeChild(this.firstChild); nodes.forEach(node => this.appendChild(node)); } },
    append: { configurable: true, value(...nodes) { nodes.forEach(node => this.appendChild(node)); } },
    dataset: { configurable: true, get() { const element = this; return new Proxy({}, { get: (_, key) => element.getAttribute(`data-${key}`), set: (_, key, value) => { element.setAttribute(`data-${key}`, value); return true; } }); } }
  });
  Object.defineProperty(document, 'querySelectorAll', { value: (...args) => Array.from(documentQuery(...args)) });
  const HOME_ID = '__garden_home__';
  const homeEntry = { id: HOME_ID, title: 'My existing Home', markdown: 'My saved home [note](/page/note)' };
  const note = { id: 'note', title: 'My note', markdown: 'Existing text', order: 0 };
  const writes = [], navigations = [], requests = [];
  const location = new URL(`http://localhost:4183${editing ? '/editor/home' : '/'}`);
  location.replace = path => navigations.push(['replace', path]);
  location.assign = path => navigations.push(['assign', path]);
  window.scrollTo = () => {};
  const context = vm.createContext({
    window, document, $, location, HOME_ID, homeEntry, entries: new Map([['note', note]]),
    body: $('#writing-body'), titleInput: $('#entry-title'), activeId: null, deletingId: null,
    editorAuthorized: false, routeRevision: 0, pageReferencePicker: undefined,
    savedRange: null, pendingWrites: 0, saveFailed: false,
    gardenPath, editorPath,
    history: { pushState(_, __, path) { context.location.pathname = path; }, replaceState(_, __, path) { context.location.pathname = path; } },
    readEditorSession: async () => { requests.push('/auth/session'); return allowed ? { authenticated: true, csrf: 'test-only-csrf' } : null; },
    persist: async entry => { writes.push(structuredClone(entry)); return true; },
    ensureTrailingTextLine() {}, editorContentHTML: body => body.innerHTML,
    turndown: new TurndownService({ headingStyle: 'atx' }),
    renderMarkdown(markdown) { const element = document.createElement('div'); element.innerHTML = marked.parse(markdown); const fragment = document.createDocumentFragment(); while (element.firstChild) fragment.appendChild(element.firstChild); return fragment; },
    closeWritingMenu() {}, closeBlockMenu() {}, setBlockFormat() {},
    mountYouTubePlayers: async () => {}, unmountYouTubePlayers() {}
  });
  const slices = [
    ['const titleFor =', 'function notice('],
    ['function saveEditor()', 'function removeMedia('],
    ['function renderNavigation()', 'function migrateLegacyURL('],
    ['function migrateLegacyURL()', 'async function checkEditorAccess('],
    ['async function checkEditorAccess()', 'function rememberSelection(']
  ];
  for (const [start, end] of slices) vm.runInContext(source.slice(source.indexOf(start), source.indexOf(end, source.indexOf(start))), context);
  if (!editing) vm.runInContext(source.slice(source.indexOf('function bindEvents()'), source.indexOf('async function boot()')), context);
  return { context, $, window, document, writes, navigations, requests, homeEntry, note };
}

test('client session reader accepts only a successful server-validated response', async () => {
  const calls = [];
  const result = await readEditorSession(async (...args) => { calls.push(args); return { ok: true, json: async () => ({ authenticated: true, csrf: 'csrf' }) }; });
  assert.equal(result.csrf, 'csrf');
  assert.equal(calls[0][0], '/auth/session');
  assert.equal(calls[0][1].cache, 'no-store');
  for (const response of [{ ok: false }, { ok: true, json: async () => ({ authenticated: false }) }, { ok: true, json: async () => ({ authenticated: true }) }]) {
    assert.equal(await readEditorSession(async () => response), null);
  }
  assert.equal(await readEditorSession(async () => { throw Error('offline'); }), null);
});

test('public Home and ordinary pages work without editor markup', async () => {
  const app = setup();
  app.context.bindEvents(); // Must not register editor-only listeners on missing controls.
  await app.context.route();
  assert.equal(app.$('#editor-shell'), undefined);
  assert.equal(app.$('#home-title').textContent, 'My existing Home');
  assert.equal(app.$('#home-content a').getAttribute('href'), '/page/note');
  app.context.location.pathname = '/page/note';
  await app.context.route();
  assert.equal(app.$('#page-title').textContent, 'My note');
  assert.equal(app.$('#page-content').textContent.trim(), 'Existing text');
  assert.equal(app.requests.length, 0);
  assert.equal(app.writes.length, 0);
});

test('public-to-editor routing makes a server document request', async () => {
  const app = setup();
  app.context.location.pathname = '/editor/home';
  await app.context.route();
  assert.deepEqual(app.navigations, [['replace', '/editor/home']]);
  assert.equal(app.context.editorAuthorized, false);
  assert.equal(app.writes.length, 0);
});

test('authenticated Home edits still save title and Markdown locally', async () => {
  const app = setup({ editing: true });
  await app.context.route();
  assert.equal(app.context.editorAuthorized, true);
  assert.equal(app.$('#editor-shell').hidden, false);
  assert.equal(app.$('#entry-title').value, 'My existing Home');
  assert.equal(app.$('#sign-out-csrf').value, 'test-only-csrf');
  app.$('#entry-title').value = 'Edited Home';
  app.$('#writing-body').innerHTML = '<p>Saved <a href="/page/note">My note</a></p>';
  await app.context.saveEditor();
  assert.equal(app.writes.length, 1);
  assert.equal(app.writes[0].id, '__garden_home__');
  assert.equal(app.writes[0].title, 'Edited Home');
  assert.ok(app.writes[0].markdown.includes('[My note](/page/note)'));
  assert.equal(app.note.markdown, 'Existing text');
});

test('unauthenticated editor stays hidden and cannot save local changes', async () => {
  const app = setup({ editing: true, allowed: false });
  const before = structuredClone(app.homeEntry);
  await app.context.route();
  assert.equal(app.$('#editor-shell').hidden, true);
  assert.equal(app.context.editorAuthorized, false);
  assert.ok(app.navigations[0][1].startsWith('/auth/login?next='));
  app.$('#entry-title').value = 'Not authorized';
  await app.context.saveEditor();
  assert.deepEqual(app.homeEntry, before);
  assert.equal(app.writes.length, 0);
});

test('ordinary page editing and Save return to the public document boundary', async () => {
  const app = setup({ editing: true });
  app.context.location.pathname = '/editor/note';
  await app.context.route();
  assert.equal(app.context.activeId, 'note');
  assert.equal(app.$('#preview-entry').getAttribute('href'), '/page/note');
  app.$('#writing-body').innerHTML = '<h2>A heading</h2><p>Local content</p>';
  await app.context.saveEditor();
  assert.equal(app.writes[0].id, 'note');
  assert.ok(app.writes[0].markdown.includes('## A heading'));
  app.context.location.pathname = '/page/note';
  await app.context.route();
  assert.deepEqual(app.navigations, [['replace', '/page/note']]);
});
