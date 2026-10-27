// Read only the current text run: links, media, and line breaks are boundaries.
const blockTags = /^(P|DIV|H[1-6]|LI|BLOCKQUOTE|UL|OL)$/;
const boundarySelector = 'a,code,pre,[contenteditable="false"],[data-media-kind]';

export function referenceAtCaret(editor, selection = editor.ownerDocument.getSelection()) {
  if (!selection?.rangeCount || !selection.isCollapsed) return null;
  const caret = selection.getRangeAt(0);
  const element = caret.startContainer.nodeType === 1 ? caret.startContainer : caret.startContainer.parentElement;
  if (!editor.contains(caret.startContainer) || element?.closest(boundarySelector)) return null;
  let block = element;
  while (block !== editor && !blockTags.test(block.tagName)) block = block.parentElement;
  let text = '', reachedCaret = false;
  const runs = [];
  function read(node) {
    if (reachedCaret) return;
    if (node.nodeType === 3) {
      const value = node.data.slice(0, node === caret.startContainer ? caret.startOffset : node.length);
      runs.push({ node, start: text.length, length: value.length });
      text += value;
      if (node === caret.startContainer) reachedCaret = true;
      return;
    }
    if (node.nodeType !== 1) return;
    if (node !== block && node.tagName === 'BR') { text += '\n'; return; }
    if (node !== block && node.matches(boundarySelector)) {
      text += node.matches('pre,figure,[data-media-kind]') ? '\n' : '\uFFFC';
      return;
    }
    if (node !== block && blockTags.test(node.tagName)) text += '\n';
    const count = node === caret.startContainer ? caret.startOffset : node.childNodes.length;
    for (let i = 0; i < count && !reachedCaret; i++) read(node.childNodes[i]);
    if (node === caret.startContainer) reachedCaret = true;
    if (!reachedCaret && node !== block && blockTags.test(node.tagName)) text += '\n';
  }
  read(block);
  const match = text.match(/(?:^|\s)!([^!\r\n\uFFFC]*)$/u);
  if (!reachedCaret || !match) return null;
  const start = text.length - match[1].length - 1;
  const run = runs.find(run => start >= run.start && start < run.start + run.length);
  if (!run) return null;
  const range = caret.cloneRange();
  range.setStart(run.node, start - run.start);
  return { range, query: match[1] };
}

export function matchingPages(pages, query) {
  const words = query.trim().toLocaleLowerCase().split(/\s+/u).filter(Boolean);
  return pages.filter(page => !page.deleted && words.every(word => page.title.toLocaleLowerCase().includes(word)));
}

// Return a viewport-clamped position, using the space above whenever it fits.
export function pickerPosition(caret, width, height, viewportWidth, viewportHeight) {
  const margin = 8, gap = 7;
  height = Math.min(height, 180);
  const above = Math.max(0, caret.top - gap - margin);
  const below = Math.max(0, viewportHeight - caret.bottom - gap - margin);
  const useAbove = above >= height || above >= below;
  const maxHeight = Math.min(180, useAbove ? above : below);
  const actualHeight = Math.min(height, maxHeight);
  return {
    left: Math.max(margin, Math.min(caret.left, viewportWidth - width - margin)),
    top: Math.max(margin, Math.min(useAbove ? caret.top - gap - actualHeight : caret.bottom + gap, viewportHeight - actualHeight - margin)),
    maxHeight
  };
}

export function insertPageReference(editor, token, page) {
  const document = editor.ownerDocument;
  const selection = document.getSelection();
  const anchor = document.createElement('a');
  anchor.setAttribute('href', page.href);
  anchor.textContent = page.title;
  editor.focus({ preventScroll: true });
  selection.removeAllRanges();
  selection.addRange(token.range);
  // Use the editor's native editing transaction so Undo can restore !query.
  // The following space also puts subsequent typing outside the link.
  if (!document.execCommand('insertHTML', false, `${anchor.outerHTML} `)) {
    const range = token.range;
    range.deleteContents();
    range.insertNode(anchor);
    const space = document.createTextNode(' ');
    anchor.parentNode.insertBefore(space, anchor.nextSibling);
    range.setStart(space, 1);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
  }
}

export function createPageReferencePicker({ editor, menu, getPages, onChange, onOpen }) {
  const document = editor.ownerDocument, window = document.defaultView;
  let token = null, results = [], selected = 0, composing = false;
  editor.setAttribute('aria-autocomplete', 'list');
  editor.setAttribute('aria-haspopup', 'listbox');
  editor.setAttribute('aria-controls', menu.id);

  function close() {
    token = null;
    results = [];
    menu.hidden = true;
    editor.removeAttribute('aria-activedescendant');
  }
  function caretRect() {
    const range = document.getSelection().getRangeAt(0).cloneRange();
    let rect = range.getClientRects()[0] || range.getBoundingClientRect();
    if (rect?.height) return rect;
    // Some engines report no rectangle for a collapsed caret at an inline edge.
    const node = range.startContainer, offset = range.startOffset;
    if (node.nodeType === 3 && node.length) {
      range.setStart(node, offset ? offset - 1 : 0);
      range.setEnd(node, offset || 1);
      rect = range.getBoundingClientRect();
      if (rect.height) return { left: offset ? rect.right : rect.left, top: rect.top, bottom: rect.bottom, height: rect.height };
    }
    const element = node.nodeType === 1 ? node : node.parentElement;
    rect = element.getBoundingClientRect();
    return { left: rect.left, top: rect.top, bottom: rect.top + 24, height: 24 };
  }
  function position() {
    if (!token) return;
    if (!document.getSelection()?.rangeCount || document.activeElement !== editor) { close(); return; }
    const rect = caretRect();
    if (rect.bottom < 0 || rect.top > window.innerHeight) { close(); return; }
    // Reset before measuring so shrinking/expanding the available space is reversible.
    menu.style.maxHeight = '180px';
    const placement = pickerPosition(rect, menu.offsetWidth, menu.scrollHeight, window.innerWidth, window.innerHeight);
    menu.style.left = `${placement.left}px`;
    menu.style.top = `${placement.top}px`;
    menu.style.maxHeight = `${placement.maxHeight}px`;
  }
  function highlight() {
    Array.from(menu.querySelectorAll('[role="option"]')).forEach((row, index) => {
      row.setAttribute('aria-selected', String(index === selected));
      if (index === selected) {
        editor.setAttribute('aria-activedescendant', row.id);
        // Scroll the list alone; scrollIntoView can move the writing cursor away.
        if (row.offsetTop < menu.scrollTop) menu.scrollTop = row.offsetTop;
        else if (row.offsetTop + row.offsetHeight > menu.scrollTop + menu.clientHeight) menu.scrollTop = row.offsetTop + row.offsetHeight - menu.clientHeight;
      }
    });
    if (!results.length) editor.removeAttribute('aria-activedescendant');
  }
  function render() {
    menu.replaceChildren();
    for (const [index, page] of results.entries()) {
      const row = document.createElement('button');
      row.type = 'button'; row.tabIndex = -1;
      row.setAttribute('role', 'option');
      row.id = `${menu.id}-${index}`;
      row.dataset.index = index;
      row.innerHTML = '<svg width="14" height="16" viewBox="0 0 18 20" fill="none" stroke="currentColor" stroke-width="1.2" aria-hidden="true"><path d="M4 1h7l4 4v14H3V1h1zM11 1v5h4M6 10h6M6 13h6"/></svg>';
      const title = document.createElement('span'); title.textContent = page.title;
      row.append(title); menu.append(row);
    }
    if (!results.length) {
      const empty = document.createElement('div'); empty.className = 'page-reference-empty';
      empty.setAttribute('role', 'status'); empty.textContent = 'No matching pages'; menu.append(empty);
    }
    menu.hidden = false;
    position(); highlight();
  }
  function update(allowOpen = false) {
    if (composing) return;
    if (!token && !allowOpen) return;
    if (document.activeElement !== editor) { close(); return; }
    const next = referenceAtCaret(editor);
    if (!next || (token && (next.range.startContainer !== token.range.startContainer || next.range.startOffset !== token.range.startOffset))) { close(); return; }
    const opening = !token;
    const previousID = results[selected]?.id;
    token = next;
    results = matchingPages(getPages(), next.query);
    selected = Math.max(0, results.findIndex(page => page.id === previousID));
    if (opening) onOpen();
    render();
  }
  function choose(index) {
    // Recheck the live range and page list before replacing anything.
    const page = results[index];
    update();
    const currentPage = page && results.find(result => result.id === page.id);
    if (!token || !currentPage) return;
    const range = token;
    close();
    insertPageReference(editor, range, currentPage);
    onChange();
  }
  editor.addEventListener('input', event => {
    if (event.isComposing) return;
    update(!!event.data?.includes('!'));
  });
  editor.addEventListener('compositionstart', () => { composing = true; close(); });
  editor.addEventListener('compositionend', event => { composing = false; update(!!event.data?.includes('!')); });
  editor.addEventListener('keydown', event => {
    if (!token || composing || event.isComposing || event.keyCode === 229 || event.metaKey || event.ctrlKey || event.altKey) return;
    if (['ArrowDown', 'ArrowUp'].includes(event.key)) {
      event.preventDefault(); event.stopPropagation();
      update();
      if (results.length) { selected = (selected + (event.key === 'ArrowDown' ? 1 : -1) + results.length) % results.length; highlight(); }
    } else if (event.key === 'Enter' && !event.shiftKey && results.length) {
      event.preventDefault(); event.stopPropagation(); choose(selected);
    } else if (event.key === 'Escape') {
      event.preventDefault(); event.stopPropagation(); close();
    } else if (event.key === 'Tab' || event.key === 'Enter') close();
  }, true);
  menu.addEventListener('mousedown', event => event.preventDefault());
  menu.addEventListener('click', event => {
    const row = event.target.closest('[role="option"]');
    if (row && menu.contains(row)) choose(Number(row.dataset.index));
  });
  document.addEventListener('selectionchange', () => update());
  document.addEventListener('pointerdown', event => { if (!menu.contains(event.target)) close(); });
  document.addEventListener('focusin', event => { if (event.target !== editor) close(); });
  window.addEventListener('blur', close);
  window.addEventListener('resize', position);
  window.addEventListener('scroll', event => { if (!menu.contains(event.target)) position(); }, true);
  return { close };
}
