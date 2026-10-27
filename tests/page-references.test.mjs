import assert from 'node:assert/strict';
import { test } from 'node:test';
import domino from '@mixmark-io/domino';
import TurndownService from 'turndown';
import { marked } from 'marked';
import { referenceAtCaret, matchingPages, pickerPosition, insertPageReference, createPageReferencePicker } from '../src/page-references.js';
import { gardenPath } from '../src/routes.js';

// DOM-only harness. Selection, geometry, and native editing are simulated;
// these checks do not drive a browser or establish visual acceptance.
function setup(html) {
  const window = domino.createWindow(`<div id="editor" contenteditable="true">${html}</div><div id="picker" hidden></div><button id="outside"></button>`);
  const document = window.document, editor = document.querySelector('#editor'), menu = document.querySelector('#picker');
  Object.defineProperties(window.HTMLElement.prototype, {
    append: { configurable: true, value(...nodes) { nodes.forEach(node => this.appendChild(node)); } },
    replaceChildren: { configurable: true, value(...nodes) { while (this.firstChild) this.removeChild(this.firstChild); this.append(...nodes); } },
    dataset: { configurable: true, get() { const node = this; return new Proxy({}, { get: (_, key) => node.getAttribute(`data-${key}`), set: (_, key, value) => { node.setAttribute(`data-${key}`, value); return true; } }); } }
  });
  const selection = { rangeCount: 0, isCollapsed: true, removeAllRanges() { this.rangeCount = 0; }, addRange(range) { this.range = range; this.rangeCount = 1; this.isCollapsed = range.startContainer === range.endContainer && range.startOffset === range.endOffset; }, getRangeAt() { return this.range; } };
  document.getSelection = () => selection;
  Object.defineProperty(document, 'activeElement', { get: () => editor });
  Object.defineProperty(window, 'innerWidth', { value: 900 });
  Object.defineProperty(window, 'innerHeight', { value: 700 });
  const textNodes = () => { const nodes = []; function walk(node) { if (node.nodeType === 3) nodes.push(node); else Array.from(node.childNodes).forEach(walk); } walk(editor); return nodes; };
  class Range {
    constructor(node, offset) { this.startContainer = this.endContainer = node; this.startOffset = this.endOffset = offset; }
    cloneRange() { const range = new Range(this.startContainer, this.startOffset); range.setEnd(this.endContainer, this.endOffset); return range; }
    setStart(node, offset) { this.startContainer = node; this.startOffset = offset; }
    setEnd(node, offset) { this.endContainer = node; this.endOffset = offset; }
    collapse(start) { if (start) this.setEnd(this.startContainer, this.startOffset); else this.setStart(this.endContainer, this.endOffset); }
    getClientRects() { return [{ left: 300, right: 300, top: 350, bottom: 374, height: 24 }]; }
    getBoundingClientRect() { return this.getClientRects()[0]; }
    deleteContents() {
      const nodes = textNodes(), from = nodes.indexOf(this.startContainer), to = nodes.indexOf(this.endContainer);
      assert.ok(from >= 0 && to >= from);
      const endOffset = this.endOffset;
      for (let i = from; i <= to; i++) {
        const value = nodes[i].data;
        nodes[i].data = value.slice(0, i === from ? this.startOffset : 0) + value.slice(i === to ? endOffset : value.length);
      }
      this.collapse(true);
    }
    insertNode(node) {
      const text = this.startContainer, tail = document.createTextNode(text.data.slice(this.startOffset));
      text.data = text.data.slice(0, this.startOffset);
      text.parentNode.insertBefore(tail, text.nextSibling);
      text.parentNode.insertBefore(node, tail);
    }
  }
  document.execCommand = () => false; // Exercise the DOM insertion fallback.
  function caret(node = textNodes().at(-1), offset = node.length) { selection.addRange(new Range(node, offset)); }
  function event(target, type, properties = {}) {
    const event = new window.Event(type, { bubbles: true, cancelable: true });
    for (const [key, value] of Object.entries(properties)) Object.defineProperty(event, key, { value });
    target.dispatchEvent(event); return event;
  }
  const pages = [
    { id: 'home', title: 'Home', href: '/' },
    { id: 'note-id', title: 'A small note', href: '/page/note-id' },
    { id: 'other-id', title: 'Another small note', href: '/page/other-id' },
    { id: 'removed', title: 'Deleted note', href: '/page/removed', deleted: true }
  ];
  let changes = 0, opened = 0;
  const picker = createPageReferencePicker({ editor, menu, getPages: () => pages, onChange: () => changes++, onOpen: () => opened++ });
  const input = data => event(editor, 'input', { data });
  const key = (key, extra = {}) => event(editor, 'keydown', { key, ...extra });
  return { window, document, editor, menu, selection, caret, event, input, key, pages, picker, textNodes, get changes() { return changes; }, get opened() { return opened; } };
}

test('only standalone ! triggers; queries support spaces and Unicode whitespace', () => {
  for (const [text, query] of [['!', ''], ['Hello !small note', 'small note'], ['Hello\u00a0!note', 'note'], ['Hello!', null], ['one!note', null], ['!!', null], ['!one\nsecond', null]]) {
    const app = setup(''); app.editor.textContent = text; app.caret();
    assert.equal(referenceAtCaret(app.editor)?.query ?? null, query, text);
  }
});

test('line starts and inline formatting produce precise replacement ranges', () => {
  const app = setup('<p>Previous line</p><p>Keep <strong>!small</strong> <em>note</em> suffix</p>');
  const end = app.editor.querySelector('em').firstChild; app.caret(end);
  const token = referenceAtCaret(app.editor);
  assert.equal(token.query, 'small note');
  assert.equal(token.range.startContainer, app.editor.querySelector('strong').firstChild);
  assert.equal(token.range.startOffset, 0);
  assert.equal(token.range.endContainer, end);
  app.editor.innerHTML = '<p>line<br>!note</p>'; app.caret();
  assert.equal(referenceAtCaret(app.editor).query, 'note');
});

test('queries never cross lines, existing links, code, or noneditable media', () => {
  for (const html of ['<p>!small</p><p>note</p>', '<p>!small<br>note</p>', '<p>!small <a href="/">existing</a> note</p>', '<p><a href="/">Hello</a>!</p>', '<p><code>Hello</code>!</p>', '<p><a href="/">!note</a></p>', '<pre>!note</pre>', '<p><code>!note</code></p>', '<figure contenteditable="false" data-media-kind="video">!note</figure>']) {
    const app = setup(html); app.caret(); assert.equal(referenceAtCaret(app.editor), null, html);
  }
});

test('rejects noncollapsed selections and caret outside editor', () => {
  const app = setup('!note'); app.caret(); app.selection.isCollapsed = false;
  assert.equal(referenceAtCaret(app.editor), null);
  app.selection.isCollapsed = true; app.caret(app.document.querySelector('#outside'), 0);
  assert.equal(referenceAtCaret(app.editor), null);
});

test('title filtering is case insensitive, supports multiple words, and excludes deletions', () => {
  const app = setup('');
  assert.deepEqual(matchingPages(app.pages, 'SMALL note').map(page => page.id), ['note-id', 'other-id']);
  assert.deepEqual(matchingPages(app.pages, 'note another').map(page => page.id), ['other-id']);
  assert.equal(matchingPages(app.pages, 'Deleted').length, 0);
});

test('arrow selection and Enter insert a stable Markdown link without consuming surrounding content', () => {
  const app = setup('<p>Keep <strong>!small</strong> <em>note</em> suffix</p><figure data-media-kind="image"><img src="local.png"></figure>');
  const media = app.editor.querySelector('figure');
  app.caret(app.editor.querySelector('em').firstChild); app.input('!');
  assert.equal(app.menu.hidden, false);
  assert.equal(app.menu.querySelectorAll('[role="option"]').length, 2);
  assert.equal(app.key('ArrowDown').defaultPrevented, true);
  assert.equal(app.menu.querySelector('[aria-selected="true"]').textContent, 'Another small note');
  app.key('Enter');
  const anchor = app.editor.querySelector('a');
  assert.equal(anchor.getAttribute('href'), '/page/other-id');
  assert.equal(anchor.textContent, 'Another small note');
  assert.equal(app.editor.textContent, 'Keep Another small note  suffix');
  assert.equal(app.editor.querySelector('figure'), media);
  assert.equal(app.editor.querySelector('strong').contains(anchor), true);
  assert.equal(app.selection.range.startContainer.nodeType, 3);
  assert.equal(app.selection.range.startContainer.data, ' ');
  assert.equal(app.selection.range.startOffset, 1);
  assert.equal(app.menu.hidden, true); assert.equal(app.changes, 1);
  const markdown = new TurndownService().turndown(app.editor.innerHTML);
  assert.ok(markdown.includes('[Another small note](/page/other-id)'));
  assert.ok(marked.parse(markdown).includes('href="/page/other-id"'));
  assert.equal(gardenPath(anchor.getAttribute('href')), '/page/other-id');
});

test('continued input filters multiple words and mouse selection keeps the live caret', () => {
  const app = setup('!'); app.caret(); app.input('!');
  const node = app.editor.firstChild;
  node.data = '!small note'; app.caret(node); app.input('note');
  assert.equal(app.menu.querySelectorAll('[role="option"]').length, 2);
  const row = app.menu.querySelector('[role="option"]');
  assert.equal(app.event(row, 'mousedown').defaultPrevented, true);
  app.event(row.querySelector('span'), 'click');
  assert.equal(app.editor.querySelector('a').getAttribute('href'), '/page/note-id');
});

test('Escape preserves the query and subsequent typing does not reopen it', () => {
  const app = setup('!small'); app.caret(); app.input('!');
  assert.equal(app.key('Escape').defaultPrevented, true);
  assert.equal(app.editor.textContent, '!small'); assert.equal(app.menu.hidden, true);
  app.editor.firstChild.data += ' note'; app.caret(); app.input('note');
  app.event(app.document, 'selectionchange');
  assert.equal(app.menu.hidden, true); assert.equal(app.changes, 0);
});

test('outside interaction and route/menu dismissal preserve literal text', () => {
  const app = setup('!small'); app.caret(); app.input('!');
  app.event(app.document.querySelector('#outside'), 'pointerdown');
  assert.equal(app.menu.hidden, true); assert.equal(app.editor.textContent, '!small');
  app.input('!'); app.picker.close();
  assert.equal(app.menu.hidden, true); assert.equal(app.editor.textContent, '!small');
});

test('removing the trigger or moving the caret out of its text closes the list', () => {
  const app = setup('<p>!small</p><p>Other text</p>');
  const trigger = app.editor.querySelector('p').firstChild;
  app.caret(trigger); app.input('!');
  trigger.data = 'small'; app.caret(trigger); app.input(null);
  assert.equal(app.menu.hidden, true);
  trigger.data = '!small'; app.caret(trigger); app.input('!');
  app.caret(); app.event(app.document, 'selectionchange');
  assert.equal(app.menu.hidden, true);
  assert.equal(app.editor.textContent, '!smallOther text');
});

test('a result deleted while the menu is open cannot be inserted', () => {
  const app = setup('!Another'); app.caret(); app.input('!');
  app.pages[2].deleted = true;
  app.key('Enter');
  assert.ok(!app.editor.querySelector('a'));
  assert.equal(app.editor.textContent, '!Another');
  assert.equal(app.changes, 0);
});

test('no matches, IME input, and ordinary punctuation leave normal editing available', () => {
  const app = setup('!missing'); app.caret(); app.input('!');
  assert.equal(app.menu.textContent, 'No matching pages');
  assert.equal(app.key('Enter').defaultPrevented, false);
  app.editor.textContent = '!small'; app.caret();
  app.event(app.editor, 'compositionstart'); app.input('!');
  assert.equal(app.menu.hidden, true);
  app.event(app.editor, 'compositionend', { data: '!small' });
  assert.equal(app.menu.hidden, false);
  assert.equal(app.key('Enter', { isComposing: true }).defaultPrevented, false);
  app.picker.close(); app.editor.textContent = 'Hello!'; app.caret(); app.input('!');
  assert.equal(app.menu.hidden, true);
});

test('native editing path safely escapes labels and uses one insertHTML transaction', () => {
  const app = setup('!unsafe'); app.caret(); const token = referenceAtCaret(app.editor);
  const calls = [];
  app.document.execCommand = (...args) => { calls.push(args); return true; };
  insertPageReference(app.editor, token, { title: '<img src=x onerror=bad> & [notes]', href: '/page/stable-id' });
  assert.equal(calls.length, 1); assert.equal(calls[0][0], 'insertHTML');
  const fragment = domino.createWindow(calls[0][2]).document.body;
  assert.ok(!fragment.querySelector('img'));
  assert.equal(fragment.querySelector('a').textContent, '<img src=x onerror=bad> & [notes]');
  assert.equal(fragment.querySelector('a').getAttribute('href'), '/page/stable-id');
  assert.ok(calls[0][2].endsWith('</a> '));
});

test('Home is available as / and title changes retain stable page destinations', () => {
  const app = setup('!home'); app.caret(); app.input('!'); app.key('Enter');
  assert.equal(app.editor.querySelector('a').getAttribute('href'), '/');
  app.pages[1].title = 'Renamed note';
  assert.equal(matchingPages(app.pages, 'Renamed')[0].href, '/page/note-id');
});

test('position prefers above, falls below near top, and clamps narrow viewports', () => {
  const above = pickerPosition({ left: 200, top: 400, bottom: 424 }, 260, 180, 900, 700);
  assert.equal(above.top, 213);
  const below = pickerPosition({ left: 200, top: 20, bottom: 44 }, 260, 180, 900, 700);
  assert.equal(below.top, 51);
  const scrollingList = pickerPosition({ left: 200, top: 200, bottom: 224 }, 260, 2000, 900, 700);
  assert.equal(scrollingList.top, 13);
  for (const [width, height, rect] of [[320, 180, { left: 310, top: 80, bottom: 104 }], [900, 700, { left: 899, top: 680, bottom: 704 }]]) {
    const placement = pickerPosition(rect, 260, 500, width, height);
    assert.ok(placement.left >= 8 && placement.left + 260 <= width - 8);
    assert.ok(placement.top >= 8 && placement.top + placement.maxHeight <= height - 8);
  }
});
