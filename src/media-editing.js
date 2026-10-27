function meaningfulSibling(node, direction) {
  let sibling = node[direction];
  while (sibling && (sibling.nodeType === 8 || (sibling.nodeType === 3 && !sibling.textContent.trim()))) sibling = sibling[direction];
  return sibling;
}

function endsInMedia(root) {
  let node = root.lastChild;
  while (node) {
    if (node.nodeType === 8 || (node.nodeType === 3 && !node.textContent.trim())) { node = node.previousSibling; continue; }
    if (node.nodeType !== 1) return false;
    if (node.hasAttribute('data-media-kind')) return true;
    node = node.lastChild;
  }
  return false;
}

function createTextLine(document) {
  const line = document.createElement('p');
  line.setAttribute('data-editor-line', '');
  line.appendChild(document.createElement('br'));
  return line;
}

export function isEmptyTextLine(node) {
  return node?.nodeType === 1 && !node.textContent.trim() && !node.querySelector('img,video,iframe,[data-media-kind],hr');
}

export function ensureTrailingTextLine(root) {
  if (!endsInMedia(root)) return null;
  const line = createTextLine(root.ownerDocument);
  root.appendChild(line);
  return line;
}

export function caretTargetBesideMedia(media, before = false) {
  const sibling = meaningfulSibling(media, before ? 'previousSibling' : 'nextSibling');
  if (sibling?.nodeType === 3) return sibling;
  if (sibling?.nodeType === 1 && /^(P|DIV|H[1-6]|BLOCKQUOTE|LI)$/.test(sibling.tagName)
      && sibling.getAttribute('contenteditable') !== 'false' && !sibling.hasAttribute('data-media-kind') && !sibling.querySelector('[data-media-kind]')) return sibling;
  const line = createTextLine(media.ownerDocument);
  let anchor = media;
  for (let parent = media.parentElement; parent; parent = parent.parentElement) {
    if (parent.tagName === 'P') { anchor = parent; break; }
  }
  anchor.parentNode.insertBefore(line, before ? anchor : anchor.nextSibling);
  return line;
}

export function focusTextCaret(editor, target, atEnd = false) {
  editor.focus({ preventScroll: true });
  const range = editor.ownerDocument.createRange();
  range.selectNodeContents(target);
  range.collapse(!atEnd || isEmptyTextLine(target));
  const selection = editor.ownerDocument.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);
  return range;
}

export function editorContentHTML(editor) {
  const copy = editor.cloneNode(true);
  copy.querySelectorAll('[data-editor-line]').forEach(line => {
    if (isEmptyTextLine(line)) line.parentNode.removeChild(line);
    else line.removeAttribute('data-editor-line');
  });
  return copy.innerHTML;
}
