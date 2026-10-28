import { CloudPages } from './cloud-pages.js';
import { loadImageConfig, r2ImageURL, uploadR2Image } from './r2-images.js';
import { bindYouTubeUpload, restoreYouTubeUploads, uploadReference, mountUploadPlaceholder, completedUpload, stopYouTubeUpload } from './youtube-upload.js';
import { marked } from 'marked';
import TurndownService from 'turndown';
import DOMPurify from 'dompurify';
import { zipSync, unzipSync, strToU8, strFromU8 } from 'fflate';
import { mountYouTubePlayers, unmountYouTubePlayers } from './youtube.js';
import { gardenPath, cleanMarkdownLinks } from './routes.js';
import { ensureTrailingTextLine, caretTargetBesideMedia, focusTextCaret, editorContentHTML, isEmptyTextLine } from './media-editing.js';
import { createPageReferencePicker } from './page-references.js';
import { readEditorSession, editorPath } from './editor-auth.js';

const $ = selector => document.querySelector(selector);
const body = $('#writing-body');
const titleInput = $('#entry-title');
const entries = new Map();
const assets = new Map();
const urls = new Map();
const imageJobs = new Map();
const cloudPages = new CloudPages();
let browserPagesForImport = [];
const HOME_ID = '__garden_home__';
let homeEntry;
let pageReferencePicker;
let editorAuthorized = false, routeRevision = 0;
let db, activeId, savedRange, insertMode, revision = 0, pendingWrites = 0, saveFailed = false;
let noticeTimer, deletingId = null;
const escapeHTML = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const slug = value => value.normalize('NFKD').replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 90) || 'page';
const mdDestination = value => value.replace(/ /g, '%20').replace(/\(/g, '%28').replace(/\)/g, '%29');
const mdLabel = value => String(value).replace(/[\\[\]]/g, '\\$&');
const titleFor = entry => entry.title.trim() || (entry.id === HOME_ID ? 'Home' : 'Untitled page');
const currentEntry = () => activeId === HOME_ID ? homeEntry : entries.get(activeId);
function notice(message, error = false) {
  clearTimeout(noticeTimer);
  $('#notice').textContent = message;
  $('#notice').hidden = false;
  $('#notice').dataset.error = error;
  noticeTimer = setTimeout(() => { $('#notice').hidden = true; }, error ? 9000 : 4500);
}
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('cybergarden-local-v1', 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore('entries', { keyPath: 'id' });
      request.result.createObjectStore('assets', { keyPath: 'path' });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    request.onblocked = () => reject(new Error('Close other garden tabs and reload to open local storage.'));
  });
}
function allRecords(store) {
  return new Promise((resolve, reject) => {
    const request = db.transaction(store).objectStore(store).getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
function writeRecords(store, records) {
  if (store === 'entries' && cloudPages.enabled) {
    return Promise.all(records.map(record => cloudPages.save(record)));
  }
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(store, 'readwrite');
    records.forEach(record => transaction.objectStore(store).put(record));
    transaction.oncomplete = resolve;
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error || new Error('Storage write interrupted.'));
  });
}
function persist(entry) {
  const currentRevision = ++revision;
  pendingWrites++;
  if (cloudPages.enabled) {
    // Draft copies use their own key and never replace the pre-migration local garden.
    try { localStorage.setItem(`cg-cloud-draft:${entry.id}`, JSON.stringify(entry)); } catch { /* server save still attempted */ }
  }
  const snapshot = JSON.stringify(entry);
  return writeRecords('entries', [{ ...entry }]).then(() => {
    if (cloudPages.enabled) {
      try { if (localStorage.getItem(`cg-cloud-draft:${entry.id}`) === snapshot) localStorage.removeItem(`cg-cloud-draft:${entry.id}`); } catch { /* draft remains recoverable */ }
    }
    if (currentRevision === revision) {
      saveFailed = false;
    }
    return true;
  }).catch(() => {
    saveFailed = true;
    notice(cloudPages.enabled ? 'Cloud save failed. Keep this tab open and export your page before reloading.' : 'Browser storage could not save this change. Keep this tab open and export your page.', true);
    return false;
  }).finally(() => { pendingWrites--; });
}
function safeURL(value) {
  return /^(https?:\/\/|mailto:|#)/i.test(value) || /^\.?\/?assets\//.test(value) || !!gardenPath(value);
}
function youtubeID(value) {
  try {
    const url = new URL(value);
    if (!['https:', 'http:'].includes(url.protocol)) return null;
    let id;
    if (['youtu.be', 'www.youtu.be'].includes(url.hostname)) id = url.pathname.split('/')[1];
    if (['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtube-nocookie.com', 'www.youtube-nocookie.com'].includes(url.hostname)) {
      id = url.pathname === '/watch' ? url.searchParams.get('v') : /^\/(embed|shorts|live)\//.test(url.pathname) ? url.pathname.split('/')[2] : null;
    }
    return /^[a-zA-Z0-9_-]{11}$/.test(id || '') ? id : null;
  } catch { return null; }
}
function assetURL(path) {
  if (path === './sample.svg' || path === 'sample.svg') return '/sample.svg';
  if (!assets.has(path)) return null;
  if (!urls.has(path)) urls.set(path, URL.createObjectURL(assets.get(path).blob));
  return urls.get(path);
}
function mediaBlock(kind, ref, label, editing) {
  if (kind === 'image' && assets.get(ref)?.r2URL && r2ImageURL(assets.get(ref).r2URL)) ref = assets.get(ref).r2URL;
  if (uploadReference(ref) && completedUpload(ref)) return mediaBlock('youtube', completedUpload(ref), label, editing);
  const card = document.createElement('figure');
  card.className = 'media-block';
  card.dataset.mediaKind = kind;
  card.dataset.ref = ref;
  card.dataset.label = label || '';
  if (editing) {
    card.contentEditable = 'false';
    card.tabIndex = 0;
    card.setAttribute('aria-label', kind === 'youtube' ? 'YouTube video' : `${kind === 'image' ? 'Image' : 'Video'}${label ? `: ${label}` : ''}`);
    const remove = document.createElement('button');
    remove.type = 'button'; remove.className = 'media-delete';
    const action = kind === 'image' ? 'Remove image' : 'Remove video';
    remove.setAttribute('aria-label', action); remove.title = action;
    remove.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7M14 10v7"/></svg>';
    card.append(remove);
  }
  if (uploadReference(ref)) { mountUploadPlaceholder(card, ref, editing); return card; }
  const videoId = kind === 'youtube' ? youtubeID(ref) : null;
  if (videoId) {
    const player = document.createElement('iframe');
    player.dataset.youtubeSrc = `https://www.youtube-nocookie.com/embed/${videoId}?enablejsapi=1&autoplay=0&origin=${encodeURIComponent(location.origin)}`;
    player.title = 'YouTube video player';
    player.width = '560'; player.height = '315';
    player.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
    player.allowFullscreen = true;
    player.referrerPolicy = 'strict-origin-when-cross-origin';
    card.append(player);
    return card;
  }
  const media = kind === 'youtube' ? null : (kind === 'image' && r2ImageURL(ref)) || assetURL(ref);
  if (kind === 'image' && media) {
    const img = document.createElement('img'); img.src = media; img.alt = label || 'Image'; card.append(img);
  } else if (kind === 'video' && media) {
    const video = document.createElement('video'); video.src = media; video.controls = true; video.preload = 'metadata'; video.defaultMuted = true; video.muted = true; card.append(video);
  }
  if (!media) {
    const name = document.createElement('span'); name.className = 'media-title';
    name.textContent = label || (kind === 'image' ? 'Image reference' : 'Video reference');
    const detail = document.createElement('span'); detail.className = 'media-detail';
    detail.textContent = kind === 'youtube' ? 'Unsupported YouTube URL.' : `${ref} · Media file not available locally. Import its garden ZIP to restore it.`;
    card.append(name, detail);
  }
  if (kind === 'image') attachImageUpload(card, ref, editing);
  return card;
}
const renderer = new marked.Renderer();
// Raw HTML stays text. Images become inert references before any DOM is attached.
renderer.html = ({ text }) => escapeHTML(text);
renderer.image = ({ href, text }) => `<span data-image-ref="${escapeHTML(href)}" data-image-alt="${escapeHTML(text)}"></span>`;
marked.use({ renderer, breaks: true, gfm: true });
function renderMarkdown(markdown, editing = false) {
  const template = document.createElement('template');
  template.innerHTML = DOMPurify.sanitize(marked.parse(markdown), { ADD_ATTR: ['data-image-ref', 'data-image-alt'] });
  template.content.querySelectorAll('[data-image-ref]').forEach(image => {
    const card = mediaBlock('image', image.dataset.imageRef, image.dataset.imageAlt, editing);
    // Block media should not be nested inside a paragraph.
    if (image.parentElement?.tagName === 'P' && image.parentElement.childNodes.length === 1) image.parentElement.replaceWith(card);
    else image.replaceWith(card);
  });
  template.content.querySelectorAll('a').forEach(link => {
    let ref = link.getAttribute('href') || '';
    const internalPath = gardenPath(ref);
    if (internalPath) { ref = internalPath; link.setAttribute('href', ref); }
    const ownLine = link.parentElement?.tagName === 'P' && link.parentElement.textContent.trim() === link.textContent.trim();
    if (ownLine && youtubeID(ref)) link.parentElement.replaceWith(mediaBlock('youtube', ref, '', editing));
    else if (ownLine && (/^Video:/i.test(link.textContent) || /\.(mp4|webm|mov|m4v|ogv)(?:[?#]|$)/i.test(ref))) link.parentElement.replaceWith(mediaBlock('video', ref, link.textContent.replace(/^Video:\s*/i, ''), editing));
    else if (!safeURL(ref)) link.removeAttribute('href');
    else if (/^https?:/i.test(ref)) link.rel = 'noopener noreferrer';
  });
  // A URL pasted as plain text is still a video reference.
  template.content.querySelectorAll('p').forEach(p => {
    if (!p.querySelector('*') && youtubeID(p.textContent.trim())) p.replaceWith(mediaBlock('youtube', p.textContent.trim(), '', editing));
  });
  if (editing) ensureTrailingTextLine(template.content);
  return template.content;
}
const turndown = new TurndownService({ headingStyle: 'atx', bulletListMarker: '-', codeBlockStyle: 'fenced' });
turndown.addRule('gardenMedia', {
  filter: node => node.nodeType === 1 && node.hasAttribute('data-media-kind'),
  replacement: (_, node) => {
    const kind = node.dataset.mediaKind, ref = mdDestination(node.dataset.ref), label = mdLabel(node.dataset.label || '');
    return `\n\n${kind === 'youtube' ? ref : kind === 'image' ? `![${label}](${ref})` : `[Video: ${label || 'video'}](${ref})`}\n\n`;
  }
});
function saveEditor() {
  if (!editorAuthorized || !activeId || activeId === deletingId || $('#editor-shell')?.hidden) return;
  ensureTrailingTextLine(body);
  const entry = currentEntry();
  entry.title = titleInput.value;
  entry.markdown = turndown.turndown(editorContentHTML(body));
  if (activeId !== HOME_ID) document.querySelector(`#editor-pages a[data-id="${activeId}"]`).textContent = titleFor(entry);
  return persist(entry);
}
function removeMedia(media) {
  const target = caretTargetBesideMedia(media);
  if (uploadReference(media.dataset.ref)) stopYouTubeUpload(media.dataset.ref);
  const imageJob = imageJobs.get(media.dataset.ref);
  if (imageJob) { imageJob.cancelled = true; imageJob.controller?.abort(); }
  unmountYouTubePlayers(media);
  media.remove();
  savedRange = focusTextCaret(body, target).cloneRange();
  saveEditor();
}
function renderNavigation() {
  if (body) {
    if (activeId === HOME_ID) $('#editor-home').setAttribute('aria-current', 'page');
    else $('#editor-home').removeAttribute('aria-current');
    $('#import-markdown').textContent = activeId === HOME_ID ? 'Import Home Markdown…' : 'Import Markdown…';
    $('#editor-pages').replaceChildren();
  }
  $('.page-shelf nav').replaceChildren();
  $('.all-pages').replaceChildren();
  for (const entry of entries.values()) {
    const link = document.createElement('a'); link.href = `/editor/${entry.id}`; link.dataset.id = entry.id; link.textContent = titleFor(entry);
    if (activeId === entry.id) link.setAttribute('aria-current', 'page');
    $('#editor-pages')?.append(link);
    const publicLink = document.createElement('a'); publicLink.href = `/page/${entry.id}`; publicLink.dataset.page = entry.id; publicLink.textContent = titleFor(entry);
    if ($('.page-shelf nav').childElementCount < 8) $('.page-shelf nav').append(publicLink.cloneNode(true));
    const li = document.createElement('li'); li.append(publicLink); $('.all-pages').append(li);
  }
}
function updateHome() {
  $('#home-title').textContent = titleFor(homeEntry);
  $('#home-content').replaceChildren(renderMarkdown(homeEntry.markdown));
}
function migrateLegacyURL() {
  const path = location.hash ? gardenPath(location.hash) : null;
  if (path) {
    history.replaceState(null, '', path + location.search);
    return true;
  }
  if (location.href.endsWith('#')) {
    history.replaceState(null, '', location.pathname + location.search);
    return true;
  }
  return false;
}
async function checkEditorAccess() {
  const session = await readEditorSession();
  if (session) $('#sign-out-csrf').value = session.csrf;
  return !!session;
}
function lockEditor() {
  editorAuthorized = false;
  if (body) {
    $('#editor-shell').hidden = true;
    body.contentEditable = 'false';
    titleInput.disabled = true;
  }
  pageReferencePicker?.close();
  unmountYouTubePlayers();
  body?.querySelectorAll('video').forEach(video => video.pause());
  location.replace(`/auth/login?next=${encodeURIComponent(gardenPath(location.pathname) || '/editor')}`);
}
async function route(focus = false) {
  const revision = ++routeRevision;
  const path = gardenPath(location.pathname) || '/';
  const editing = editorPath(path);
  // Public HTML contains no editor markup. Crossing this boundary always makes
  // a document request so the server must authorize it before delivering the UI.
  if (editing !== !!body) { location.replace(path + location.search); return; }
  if (editing) {
    editorAuthorized = false;
    $('#editor-shell').hidden = true;
    const allowed = await checkEditorAccess();
    if (revision !== routeRevision) return;
    if (!allowed) { lockEditor(); return; }
    editorAuthorized = true;
  }
  pageReferencePicker?.close();
  closeWritingMenu();
  closeBlockMenu();
  // Unload remote players when changing views so a hidden video cannot keep playing.
  unmountYouTubePlayers();
  document.querySelectorAll('[data-media-kind="youtube"] iframe').forEach(player => player.remove());
  body?.querySelectorAll('video').forEach(video => video.pause());
  $('#page-content').querySelectorAll('video').forEach(video => video.pause());
  $('#home-content').querySelectorAll('video').forEach(video => video.pause());
  const id = (editing ? path.slice(8) : path.startsWith('/page/') ? path.slice(6) : '');
  $('.site').hidden = editing;
  if (body) $('#editor-shell').hidden = !editing;
  if (editing) {
    activeId = !id || id === 'home' ? HOME_ID : entries.has(id) ? id : entries.keys().next().value || HOME_ID;
    const entry = currentEntry();
    $('#delete-entry').hidden = activeId === HOME_ID;
    $('#editor-document').hidden = !entry;
    $('#editor-empty').hidden = !!entry;
    titleInput.value = entry?.title || '';
    body.replaceChildren(entry ? renderMarkdown(entry.markdown, true) : document.createDocumentFragment());
    savedRange = null;
    setBlockFormat('p');
    $('#preview-entry').href = activeId === HOME_ID ? '/' : entry ? `/page/${activeId}` : '/';
    document.title = entry ? `${titleFor(entry)} — Local editor` : 'Local editor — Peter';
  } else {
    activeId = null;
    const entry = entries.get(id);
    const view = entry ? 'page' : path === '/pages' ? 'pages' : 'home';
    document.querySelectorAll('.view').forEach(section => { section.hidden = section.id !== `${view}-view`; });
    if (entry) {
      $('#page-title').textContent = titleFor(entry);
      $('#page-content').replaceChildren(renderMarkdown(entry.markdown));
      const related = entries.get(entry.related) || [...entries.values()].find(item => item.id !== entry.id);
      $('.page-connections').hidden = !related;
      if (related) { $('#related-page').textContent = titleFor(related); $('#related-page').href = `/page/${related.id}`; }
    }
    document.title = `${entry ? titleFor(entry) : view === 'pages' ? 'All Pages' : titleFor(homeEntry)} — Peter`;
    if (view === 'home') updateHome();
  }
  renderNavigation();
  mountYouTubePlayers(editing ? body : $('#home-view').hidden ? $('#page-content') : $('#home-content')).catch(error => notice(error.message, true));
  document.querySelectorAll('[data-page]').forEach(link => {
    if (link.dataset.page === (entries.has(id) ? id : path === '/pages' ? 'pages' : 'home')) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
  if (focus) { window.scrollTo(0, 0); if (!editing) $('#main').focus({ preventScroll: true }); }
}
function rememberSelection() {
  const selection = window.getSelection();
  const inMedia = node => (node?.nodeType === 1 ? node : node?.parentElement)?.closest('[contenteditable="false"]');
  if (selection.rangeCount && body.contains(selection.anchorNode) && body.contains(selection.focusNode) && !inMedia(selection.anchorNode) && !inMedia(selection.focusNode)) savedRange = selection.getRangeAt(0).cloneRange();
}
function restoreSelection() {
  rememberSelection();
  body.focus();
  const range = savedRange && body.contains(savedRange.commonAncestorContainer) ? savedRange : document.createRange();
  if (range !== savedRange) { range.selectNodeContents(body); range.collapse(false); }
  const mediaParent = (range.startContainer.nodeType === 1 ? range.startContainer : range.startContainer.parentElement)?.closest('[data-media-kind]');
  if (mediaParent) { range.setStartAfter(mediaParent); range.collapse(true); }
  const selection = window.getSelection(); selection.removeAllRanges(); selection.addRange(range);
}
function setBlockFormat(value) {
  const labels = { p: 'Text', h2: 'Heading', h3: 'Small heading' };
  $('#block-format').dataset.value = value;
  $('#block-format-label').textContent = labels[value];
  document.querySelectorAll('[data-block]').forEach(button => button.setAttribute('aria-checked', String(button.dataset.block === value)));
}
function syncBlockFormat() {
  const node = window.getSelection().focusNode;
  if (!node || !body.contains(node)) return;
  const element = node.nodeType === 1 ? node : node.parentElement;
  if (element.closest('[data-media-kind]')) return;
  setBlockFormat(element.closest('h2,h3')?.tagName.toLowerCase() || 'p');
}
function closeBlockMenu(returnFocus = false) {
  const menu = $('#block-format-menu');
  if (!menu || menu.hidden) return;
  menu.hidden = true;
  $('#block-format').setAttribute('aria-expanded', 'false');
  if (returnFocus) $('#block-format').focus({ preventScroll: true });
}
function showBlockMenu(edge) {
  pageReferencePicker?.close();
  closeWritingMenu();
  rememberSelection();
  syncBlockFormat();
  $('#block-format-menu').hidden = false;
  $('#block-format').setAttribute('aria-expanded', 'true');
  const choices = [...document.querySelectorAll('[data-block]')];
  const target = edge === 'first' ? choices[0] : edge === 'last' ? choices.at(-1) : choices.find(button => button.getAttribute('aria-checked') === 'true');
  target.focus({ preventScroll: true });
}
function closeWritingMenu(returnFocus = false) {
  const menu = $('#writing-menu');
  if (!menu || menu.hidden) return;
  menu.hidden = true;
  if (returnFocus) restoreSelection();
}
function showWritingMenu(event) {
  pageReferencePicker?.close();
  event.preventDefault();
  closeBlockMenu();
  const menu = $('#writing-menu');
  let range;
  const fromKeyboard = event.clientX === 0 && event.clientY === 0;
  if (!fromKeyboard) {
    if (document.caretPositionFromPoint) {
      const caret = document.caretPositionFromPoint(event.clientX, event.clientY);
      if (caret && body.contains(caret.offsetNode)) {
        range = document.createRange(); range.setStart(caret.offsetNode, caret.offset); range.collapse(true);
      }
    } else if (document.caretRangeFromPoint) {
      const caret = document.caretRangeFromPoint(event.clientX, event.clientY);
      if (caret && body.contains(caret.startContainer)) range = caret;
    }
  } else {
    rememberSelection();
    if (savedRange && body.contains(savedRange.commonAncestorContainer)) range = savedRange.cloneRange();
  }
  if (!range) { range = document.createRange(); range.selectNodeContents(body); }
  range.collapse(false);
  const media = (range.startContainer.nodeType === 1 ? range.startContainer : range.startContainer.parentElement)?.closest('[data-media-kind]');
  if (media) { range.setStartAfter(media); range.collapse(true); }
  body.focus({ preventScroll: true });
  const selection = window.getSelection(); selection.removeAllRanges(); selection.addRange(range);
  savedRange = range.cloneRange();
  menu.hidden = false;
  const caretRect = range.getBoundingClientRect();
  const bodyRect = body.getBoundingClientRect();
  const hasCaretRect = caretRect.width || caretRect.height;
  const keyboardX = hasCaretRect ? caretRect.left : bodyRect.left;
  const keyboardY = hasCaretRect ? caretRect.bottom : bodyRect.top;
  const x = fromKeyboard ? keyboardX : event.clientX;
  const y = fromKeyboard ? keyboardY : event.clientY;
  menu.style.left = `${Math.max(8, Math.min(x, window.innerWidth - menu.offsetWidth - 8))}px`;
  menu.style.top = `${Math.max(8, Math.min(y, window.innerHeight - menu.offsetHeight - 8))}px`;
  // Pointer opening starts with no selected item; keyboard opening selects the first.
  menu.tabIndex = -1;
  (fromKeyboard ? menu.querySelector('button') : menu).focus({ preventScroll: true });
}
function insertNode(node) {
  restoreSelection();
  const selection = window.getSelection(), range = selection.getRangeAt(0);
  range.deleteContents();
  // Split a paragraph at the caret so media can sit between text without swallowing it.
  let block = range.startContainer.nodeType === 1 ? range.startContainer : range.startContainer.parentElement;
  while (block && block.parentElement !== body) block = block.parentElement;
  if (block && /^(P|H[1-6]|DIV)$/.test(block.tagName) && !block.dataset.mediaKind) {
    const tailRange = range.cloneRange(); tailRange.setEndAfter(block.lastChild || block);
    const tail = tailRange.extractContents();
    const after = document.createElement('p'); after.append(tail); if (!after.textContent && !after.querySelector('img')) after.innerHTML = '<br>';
    block.after(node, after); range.setStart(after, 0);
  } else {
    range.insertNode(node); const after = document.createElement('p'); after.innerHTML = '<br>'; node.after(after); range.setStart(after, 0);
  }
  ensureTrailingTextLine(body);
  range.collapse(true); selection.removeAllRanges(); selection.addRange(range); savedRange = range.cloneRange(); saveEditor();
  mountYouTubePlayers(node).catch(error => notice(error.message, true));
}
function textInsert(text) { restoreSelection(); document.execCommand('insertText', false, text); saveEditor(); }
function showInsert(mode) {
  rememberSelection(); insertMode = mode;
  const selection = window.getSelection().toString();
  $('#insert-form').reset(); $('#insert-error').textContent = '';
  $('#insert-title').textContent = mode === 'youtube' ? 'Add a YouTube video' : 'Add a link';
  $('#url-label').textContent = mode === 'youtube' ? 'YouTube URL' : 'URL or garden page link';
  $('#caption-label').hidden = $('#insert-caption').hidden = mode === 'youtube';
  $('#insert-caption').value = selection;
  $('#insert-help').textContent = mode === 'youtube' ? 'Paste a YouTube link to preview it here.' : 'Use https://example.com or a garden link such as /page/note.';
  $('#insert-dialog').showModal(); $('#insert-url').focus();
}
async function addFiles(files, kind) {
  if (!editorAuthorized) return;
  const owner = activeId;
  rememberSelection();
  for (const file of files) {
    if (kind === 'image' && !/^image\/(png|jpeg|gif|webp|avif)$/.test(file.type)) { notice('Choose a PNG, JPEG, GIF, WebP, or AVIF image.', true); continue; }
    if (kind === 'video' && !file.type.startsWith('video/')) { notice('Choose a video file for a local preview.', true); continue; }
    if (file.size > 40 * 1024 * 1024) { notice('For this prototype, choose a file smaller than 40 MB.', true); continue; }
    const path = `assets/${crypto.randomUUID()}-${slug(file.name)}`;
    const asset = { path, name: file.name, blob: file, ...(kind === 'image' ? {r2Pending:true} : {}) };
    try {
      await writeRecords('assets', [asset]); assets.set(path, asset);
      if (activeId !== owner || $('#editor-shell').hidden) { notice('The page changed before the file was inserted. Select it again in the intended page.'); return; }
      insertNode(mediaBlock(kind, path, file.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' '), true));
    } catch { notice('There is not enough browser storage for this file. Try a smaller one.', true); }
  }
}
function attachImageUpload(card, ref, editing) {
  const asset = assets.get(ref);
  if (!asset?.r2Pending || !asset.blob) return;
  let job = imageJobs.get(ref);
  if (!job) { job = {asset, busy:false, error:''}; imageJobs.set(ref, job); }
  const badge = document.createElement('div'); badge.className = 'upload-overlay';
  const status = document.createElement('span'); status.dataset.imageUploadStatus = ''; badge.append(status);
  if (editing) {
    const retry = document.createElement('button'); retry.type = 'button'; retry.dataset.imageUploadRetry = ''; retry.textContent = 'Retry';
    retry.addEventListener('click', () => { job.cancelled = false; runImageUpload(ref); }); badge.append(retry);
  }
  card.append(badge);
  paintImageUpload(card, job);
  if (editing && !job.busy && !job.error && !job.cancelled) queueMicrotask(() => runImageUpload(ref));
}
function paintImageUpload(card, job) {
  card.querySelector('[data-image-upload-status]').textContent = job.error || 'Uploading image…';
  const retry = card.querySelector('[data-image-upload-retry]');
  if (retry) retry.hidden = !job.error || job.busy;
}
function refreshImageUpload(ref) {
  const job = imageJobs.get(ref);
  if (!job) return;
  for (const card of document.querySelectorAll('[data-media-kind="image"]')) if (card.dataset.ref === ref && card.querySelector('[data-image-upload-status]')) paintImageUpload(card, job);
}
async function runImageUpload(ref) {
  const job = imageJobs.get(ref);
  if (!job || job.busy || job.cancelled || !editorAuthorized) return;
  job.busy = true; job.error = ''; job.controller = new AbortController(); pendingWrites++; refreshImageUpload(ref);
  try {
    const url = await uploadR2Image(job.asset.blob, $('#sign-out-csrf').value, job.controller.signal);
    if (job.cancelled) return;
    // Save the remote reference alongside the local backup before updating pages.
    job.asset.r2URL = url; job.asset.r2Pending = false;
    await writeRecords('assets', [job.asset]);
    if (job.cancelled) return;
    for (const card of document.querySelectorAll('[data-media-kind="image"]')) {
      if (card.dataset.ref !== ref) continue;
      card.dataset.ref = url; card.querySelector('img').src = url;
      card.querySelector('.upload-overlay')?.remove();
    }
    const writes = [];
    if (activeId && editorAuthorized) writes.push(saveEditor());
    for (const entry of [homeEntry, ...entries.values()]) {
      if (!entry || entry.deleted) continue;
      const markdown = entry.markdown.replaceAll(`](${mdDestination(ref)})`, `](${url})`);
      if (markdown !== entry.markdown) { entry.markdown = markdown; writes.push(persist(entry)); }
    }
    await Promise.all(writes);
    imageJobs.delete(ref);
  } catch (error) {
    if (error.name !== 'AbortError') { job.error = error.message || 'Image upload interrupted. Retry to upload again.'; }
  } finally { job.busy = false; pendingWrites--; refreshImageUpload(ref); }
}
function download(blob, name) {
  const url = URL.createObjectURL(blob), link = document.createElement('a'); link.href = url; link.download = name; link.click(); setTimeout(() => URL.revokeObjectURL(url), 30000);
}
function exportedMarkdown(entry) { return `# ${titleFor(entry).replace(/[\r\n]/g, ' ')}\n\n${cleanMarkdownLinks(entry.markdown)}\n`; }
async function exportEntry(bundle) {
  saveEditor();
  const entry = { ...currentEntry() }, filename = `${slug(titleFor(entry))}.md`;
  if (!bundle) { download(new Blob([exportedMarkdown(entry)], { type: 'text/markdown;charset=utf-8' }), filename); notice('Markdown exported. Local media paths need the matching files; use the ZIP to include them.'); return; }
  try {
    const files = { [filename]: strToU8(exportedMarkdown(entry)) };
    const fragment = renderMarkdown(entry.markdown);
    const refs = [...fragment.querySelectorAll('[data-ref]')].map(node => node.dataset.ref);
    const missing = [];
    for (const ref of new Set(refs)) {
      if (assets.get(ref)?.blob) files[ref] = new Uint8Array(await assets.get(ref).blob.arrayBuffer());
      else if (ref === './sample.svg' || ref === 'sample.svg') files['sample.svg'] = new Uint8Array(await (await fetch('/sample.svg')).arrayBuffer());
      else if (!youtubeID(ref) && !r2ImageURL(ref)) missing.push(ref);
    }
    files['README.txt'] = strToU8('This local garden export contains a Markdown page and its available local media.\nImport the ZIP into the local editor to restore both. The first # heading is the title.\nImages: ![description](assets/file.png)\nVideos: [Video: description](assets/file.mp4)\nYouTube: a plain URL on its own line; no player or upload is included.\n' + (missing.length ? `\nUnavailable media (references retained):\n${missing.join('\n')}\n` : ''));
    download(new Blob([zipSync(files, { level: 0 })], { type: 'application/zip' }), `${slug(titleFor(entry))}.zip`);
    notice(missing.length ? 'ZIP exported. Some references have no local file; see README.txt in the ZIP.' : 'Exported Markdown and local media together.');
  } catch { notice('Export failed. Try exporting Markdown alone.', true); }
}
async function createEntry(title = '', markdown = '') {
  if (!editorAuthorized) return;
  const entry = { id: crypto.randomUUID(), title, markdown, related: entries.keys().next().value, order: Math.max(-1, ...[...entries.values()].map(item => item.order ?? 0)) + 1 };
  entries.set(entry.id, entry);
  history.pushState(null, '', `/editor/${entry.id}`);
  await route(true);
  if (!editorAuthorized) return;
  titleInput.focus();
  await persist(entry);
}
async function deleteCurrentEntry() {
  if (!editorAuthorized) return;
  const id = activeId;
  if (!id || id === HOME_ID || !entries.has(id) || deletingId) return;
  deletingId = id;
  $('#delete-entry').disabled = true;
  pendingWrites++;
  try {
    // This marker prevents the starter pages returning after the final page is deleted.
    await writeRecords('entries', [{ id, deleted: true }]);
    entries.delete(id);
    if (activeId === id) {
      const nextId = entries.keys().next().value;
      history.replaceState(null, '', nextId ? `/editor/${nextId}` : '/editor');
      await route(true);
    } else if ($('#editor-shell').hidden) route();
    else renderNavigation();
  } catch {
    notice('Could not delete this page. It has been kept.', true);
  } finally {
    pendingWrites--;
    deletingId = null;
    $('#delete-entry').disabled = false;
  }
}
async function importFile(file) {
  if (!file || !editorAuthorized) return;
  const importingHome = activeId === HOME_ID;
  if (file.size > 100 * 1024 * 1024) { notice('Choose a Markdown file or garden ZIP smaller than 100 MB.', true); return; }
  try {
    let markdown, filename = file.name;
    if (/\.zip$/i.test(file.name)) {
      const raw = new Uint8Array(await file.arrayBuffer());
      // Bound decompression before allocating. This prototype accepts small stored/deflated garden exports.
      let expandedBytes = 0, fileCount = 0;
      const zipFiles = unzipSync(raw, { filter: item => {
        expandedBytes += item.originalSize; fileCount++;
        if (item.originalSize > 45 * 1024 * 1024 || expandedBytes > 120 * 1024 * 1024 || fileCount > 100) throw new Error('The ZIP is too large for this prototype.');
        return true;
      } });
      const names = Object.keys(zipFiles);
      if (names.length > 100 || names.reduce((sum, name) => sum + zipFiles[name].length, 0) > 120 * 1024 * 1024) throw new Error('The ZIP is too large for this prototype.');
      const mdFiles = names.filter(name => /\.(md|markdown)$/i.test(name));
      if (mdFiles.length !== 1) throw new Error('Choose a garden ZIP containing exactly one Markdown page.');
      filename = mdFiles[0]; markdown = strFromU8(zipFiles[filename]);
      const imported = [];
      for (const name of names) {
        if (!/^(assets\/[^/]+|sample\.svg)$/.test(name) || name.includes('..')) continue;
        const extension = name.split('.').pop().toLowerCase();
        const type = ({ png:'image/png', jpg:'image/jpeg', jpeg:'image/jpeg', gif:'image/gif', webp:'image/webp', avif:'image/avif', mp4:'video/mp4', webm:'video/webm', mov:'video/quicktime', m4v:'video/mp4', ogv:'video/ogg' })[extension];
        if (!type) continue;
        const path = `assets/${crypto.randomUUID()}-${slug(name.split('/').pop())}`;
        imported.push({ path, name, blob: new Blob([zipFiles[name]], { type }) });
        markdown = markdown.split(`](${name})`).join(`](${path})`).split(`](./${name})`).join(`](${path})`);
      }
      if (imported.length) { await writeRecords('assets', imported); imported.forEach(asset => assets.set(asset.path, asset)); }
    } else {
      if (!/\.(md|markdown)$/i.test(filename)) throw new Error('Choose a .md file or a garden .zip export.');
      if (file.size > 2 * 1024 * 1024) throw new Error('Choose a Markdown file smaller than 2 MB.');
      markdown = await file.text();
    }
    markdown = markdown.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
    const firstHeading = markdown.match(/^# (.+)\n?/);
    const title = firstHeading ? firstHeading[1].trim() : filename.split('/').pop().replace(/\.(md|markdown)$/i, '').replace(/[-_]/g, ' ');
    if (firstHeading) markdown = markdown.slice(firstHeading[0].length).trimStart();
    if (importingHome) {
      homeEntry = { ...homeEntry, title, markdown };
      await persist(homeEntry);
      history.pushState(null, '', '/editor/home');
      await route(true);
      notice('Home imported.');
    } else {
      await createEntry(title, markdown); notice('Imported as a new page. Your other pages are kept.');
    }
  } catch (error) { notice(error.message || 'Could not import this file.', true); }
}
function bindEvents() {
  window.addEventListener('popstate', () => { migrateLegacyURL(); route(true); });
  window.addEventListener('hashchange', () => { if (migrateLegacyURL()) route(true); });
  document.addEventListener('click', async event => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = event.target.closest('a[href]');
    if (!link || link.hasAttribute('download') || (link.target && link.target !== '_self')) return;
    if (link.classList.contains('skip-link')) {
      event.preventDefault();
      (body && !$('#editor-shell').hidden ? body : $('#main')).focus();
      return;
    }
    const url = new URL(link.href, location.href);
    if (url.origin !== location.origin || url.hash || !gardenPath(url.pathname)) return;
    event.preventDefault();
    if (editorPath(url.pathname) !== !!body) {
      if (body && editorAuthorized && await saveEditor() === false) return;
      location.assign(url.pathname + url.search); return;
    }
    if (url.pathname !== location.pathname || url.search !== location.search || location.hash) history.pushState(null, '', url.pathname + url.search);
    route(true);
  });
  window.addEventListener('beforeunload', event => { if (pendingWrites || saveFailed) { event.preventDefault(); event.returnValue = ''; } });
  if (!body) return;
  const migrate = $('#upload-browser-garden');
  if (migrate) {
    migrate.hidden = !cloudPages.enabled || !browserPagesForImport.length;
    migrate.addEventListener('click', async () => {
      migrate.disabled = true;
      try {
        const replacements = new Map();
        const pages = browserPagesForImport.map(page => ({...page}));
        for (const page of pages) {
          if (page.deleted) continue;
          const refs = [...(page.markdown || '').matchAll(/\]\(([^)]+)\)/g)].map(match=>match[1]).filter(ref=>/^\.?\/?assets\//.test(ref));
          for (const ref of refs) {
            if (replacements.has(ref)) continue;
            const asset = assets.get(ref);
            let url = asset?.r2URL || completedUpload(ref);
            if (!url && asset?.blob?.type.startsWith('image/')) {
              notice('Uploading existing images to R2 before importing your pages…');
              url = await uploadR2Image(asset.blob, $('#sign-out-csrf').value, new AbortController().signal);
              asset.r2URL = url; asset.r2Pending = false; await writeRecords('assets', [asset]);
            }
            if (!url) throw new Error('A page still contains a local or processing video. Finish its YouTube upload or remove it before importing.');
            replacements.set(ref,url);
          }
          page.markdown = (page.markdown || '').replace(/\]\(([^)]+)\)/g, (whole,ref)=>replacements.has(ref)? `](${replacements.get(ref)})` : whole);
        }
        await cloudPages.import(pages);
        location.reload();
      } catch(error) { notice(error.message, true); migrate.disabled = false; }
    });
  }
  if (cloudPages.enabled) {
    const drafts = Object.keys(localStorage).filter(key=>key.startsWith('cg-cloud-draft:'));
    if (drafts.length) notice('Unsaved cloud drafts are available in this browser. Export them before continuing.', true);
    $('#export-cloud-drafts').hidden = !drafts.length;
    $('#export-cloud-drafts').addEventListener('click', () => {
      const files = {};
      for (const key of drafts) {
        const entry = JSON.parse(localStorage.getItem(key));
        files[`${slug(entry.id)}.md`] = strToU8(exportedMarkdown(entry));
      }
      download(new Blob([zipSync(files)],{type:'application/zip'}),'recovered-drafts.zip');
    });
  }
  document.execCommand('defaultParagraphSeparator', false, 'p');
  pageReferencePicker = createPageReferencePicker({
    editor: body,
    menu: $('#page-reference-menu'),
    getPages: () => [
      { id: HOME_ID, title: titleFor(homeEntry), href: '/' },
      ...[...entries.values()].filter(entry => !entry.deleted).map(entry => ({ id: entry.id, title: titleFor(entry), href: `/page/${entry.id}` }))
    ],
    onOpen: () => { closeWritingMenu(); closeBlockMenu(); },
    onChange: () => { rememberSelection(); saveEditor(); }
  });
  let checkingSession = false;
  const recheckSession = async () => {
    if (checkingSession || !editorAuthorized || document.hidden) return;
    checkingSession = true;
    try { if (!await checkEditorAccess()) lockEditor(); }
    finally { checkingSession = false; }
  };
  window.addEventListener('focus', recheckSession);
  document.addEventListener('visibilitychange', recheckSession);
  window.addEventListener('pageshow', event => {
    if (event.persisted) {
      $('#editor-shell').inert = false;
      route();
    }
  });
  window.setInterval(recheckSession, 60000);
  let signingOut = false;
  $('#sign-out').addEventListener('submit', async event => {
    event.preventDefault();
    if (signingOut) return;
    signingOut = true;
    const saved = await saveEditor();
    if (saved === false) { signingOut = false; return; }
    editorAuthorized = false;
    $('#editor-shell').inert = true;
    $('#sign-out').submit();
  });
  document.addEventListener('selectionchange', () => {
    rememberSelection();
    if ($('#block-format-menu').hidden) syncBlockFormat();
  });
  const blockPicker = $('#block-format-picker');
  const blockMenu = $('#block-format-menu');
  blockPicker.addEventListener('mousedown', event => event.preventDefault());
  $('#block-format').addEventListener('click', () => {
    if (blockMenu.hidden) showBlockMenu();
    else closeBlockMenu(true);
  });
  $('#block-format').addEventListener('keydown', event => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault(); showBlockMenu(event.key === 'ArrowDown' ? 'first' : 'last');
    }
  });
  blockMenu.addEventListener('click', event => {
    const choice = event.target.closest('[data-block]');
    if (!choice) return;
    closeBlockMenu();
    restoreSelection();
    document.execCommand('formatBlock', false, choice.dataset.block);
    rememberSelection();
    setBlockFormat(choice.dataset.block);
    saveEditor();
  });
  blockMenu.addEventListener('keydown', event => {
    const choices = [...blockMenu.querySelectorAll('button')];
    const index = choices.indexOf(document.activeElement);
    if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
      event.preventDefault();
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? choices.length - 1 : (index + (event.key === 'ArrowDown' ? 1 : -1) + choices.length) % choices.length;
      choices[next].focus();
    } else if (event.key === 'Escape') {
      event.preventDefault(); closeBlockMenu(true);
    } else if (event.key === 'Tab') closeBlockMenu(true);
  });
  document.addEventListener('pointerdown', event => { if (!blockPicker.contains(event.target)) closeBlockMenu(); });
  document.addEventListener('focusin', event => { if (!blockPicker.contains(event.target)) closeBlockMenu(); });
  window.addEventListener('resize', () => closeBlockMenu());
  window.addEventListener('blur', () => closeBlockMenu());
  body.addEventListener('contextmenu', showWritingMenu);
  const openYouTubeUpload = bindYouTubeUpload({
    capture() { rememberSelection(); return { owner: activeId, range: savedRange?.cloneRange() }; },
    insert(target, ref, label) {
      if (!editorAuthorized || activeId !== target.owner || $('#editor-shell').hidden || !target.range || !body.contains(target.range.commonAncestorContainer)) return false;
      const selection = window.getSelection(); selection.removeAllRanges(); selection.addRange(target.range);
      savedRange = target.range.cloneRange();
      insertNode(mediaBlock('video', ref, label, true));
      return true;
    },
  });
  const writingMenu = $('#writing-menu');
  writingMenu.addEventListener('mousedown', event => event.preventDefault());
  writingMenu.addEventListener('click', event => {
    const button = event.target.closest('[data-insert]');
    if (!button) return;
    closeWritingMenu(true);
    const kind = button.dataset.insert;
    if (kind === 'youtube-upload') openYouTubeUpload();
    else if (kind === 'youtube') showInsert('youtube');
    else if (kind === 'image' || kind === 'video') {
      rememberSelection();
      $(`#${kind}-file`).click();
    }
  });
  writingMenu.addEventListener('keydown', event => {
    const buttons = [...writingMenu.querySelectorAll('button')];
    const index = buttons.indexOf(document.activeElement);
    if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
      event.preventDefault();
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? buttons.length - 1 : index < 0 ? (event.key === 'ArrowDown' ? 0 : buttons.length - 1) : (index + (event.key === 'ArrowDown' ? 1 : -1) + buttons.length) % buttons.length;
      buttons[next].focus();
    } else if (event.key === 'Escape' || event.key === 'Tab') {
      event.preventDefault(); closeWritingMenu(true);
    }
  });
  document.addEventListener('pointerdown', event => { if (!writingMenu.contains(event.target)) closeWritingMenu(); });
  document.addEventListener('focusin', event => { if (!writingMenu.contains(event.target)) closeWritingMenu(); });
  window.addEventListener('scroll', () => closeWritingMenu(), true);
  window.addEventListener('resize', () => closeWritingMenu());
  window.addEventListener('blur', () => closeWritingMenu());
  body.addEventListener('input', saveEditor);
  body.addEventListener('click', event => {
    const remove = event.target.closest('.media-delete');
    if (remove) {
      event.preventDefault();
      removeMedia(remove.closest('[data-media-kind]'));
      return;
    }
    const media = event.target.closest('[data-media-kind]');
    if (media && !event.target.closest('video, iframe, a, button, input, textarea, select, summary, label')) media.focus({ preventScroll: true });
    if (event.target === body) {
      ensureTrailingTextLine(body);
      const last = body.lastElementChild;
      if (last) {
        const previous = last.previousElementSibling;
        const bottom = isEmptyTextLine(last) && previous?.hasAttribute('data-media-kind') ? previous.getBoundingClientRect().bottom : last.getBoundingClientRect().bottom;
        if (event.clientY >= bottom) savedRange = focusTextCaret(body, last.hasAttribute('data-media-kind') ? body : last, true).cloneRange();
      }
    }
    if (event.target.closest('a')) event.preventDefault();
  });
  body.addEventListener('keydown', event => {
    if (event.target.matches('[data-media-kind]') && !event.isComposing && !event.metaKey && !event.ctrlKey && !event.altKey && ['Enter', 'ArrowDown', 'ArrowUp'].includes(event.key)) {
      event.preventDefault();
      const before = event.key === 'ArrowUp';
      savedRange = focusTextCaret(body, caretTargetBesideMedia(event.target, before), before).cloneRange();
      ensureTrailingTextLine(body);
      syncBlockFormat();
      return;
    }
    if (event.target.matches('[data-media-kind]') && ['Backspace', 'Delete'].includes(event.key)) {
      event.preventDefault(); removeMedia(event.target);
    }
  });
  body.addEventListener('paste', event => {
    event.preventDefault(); rememberSelection();
    const files = [...(event.clipboardData?.files || [])].filter(file => file.type.startsWith('image/'));
    if (files.length) { addFiles(files, 'image'); return; }
    const text = event.clipboardData?.getData('text/plain') || '';
    if (youtubeID(text.trim())) insertNode(mediaBlock('youtube', text.trim(), '', true));
    else textInsert(text);
  });
  // Do not allow native drag/drop to inject HTML or remote images.
  body.addEventListener('dragover', event => event.preventDefault());
  body.addEventListener('drop', event => { event.preventDefault(); notice('Use Add image, paste an image, or Upload video to insert local media.'); });
  titleInput.addEventListener('input', saveEditor);
  document.querySelectorAll('[data-command]').forEach(button => {
    button.addEventListener('mousedown', event => event.preventDefault());
    button.addEventListener('click', () => { restoreSelection(); document.execCommand(button.dataset.command); saveEditor(); });
  });
  $('#cancel-insert').addEventListener('click', () => $('#insert-dialog').close());
  $('#insert-form').addEventListener('submit', event => {
    event.preventDefault(); const url = $('#insert-url').value.trim();
    if (insertMode === 'youtube' ? !youtubeID(url) : !safeURL(url)) { $('#insert-error').textContent = insertMode === 'youtube' ? 'Enter a YouTube watch, short, or youtu.be URL.' : 'Use an https://, http://, mailto:, or /page/ URL.'; return; }
    $('#insert-dialog').close();
    if (insertMode === 'youtube') insertNode(mediaBlock('youtube', url, '', true));
    else {
      restoreSelection(); const anchor = document.createElement('a'); anchor.href = url; anchor.textContent = $('#insert-caption').value.trim() || url;
      const selection = window.getSelection(), range = selection.getRangeAt(0); range.deleteContents(); range.insertNode(anchor); range.setStartAfter(anchor); range.collapse(true); selection.removeAllRanges(); selection.addRange(range); savedRange = range.cloneRange(); saveEditor();
    }
  });
  for (const kind of ['image', 'video']) {
    $(`#${kind}-file`).addEventListener('change', event => { addFiles([...event.target.files], kind); event.target.value = ''; });
  }
  $('#new-entry').addEventListener('click', () => createEntry());
  $('#delete-entry').addEventListener('click', deleteCurrentEntry);
  $('#import-markdown').addEventListener('click', () => $('#markdown-file').click());
  $('#markdown-file').addEventListener('change', event => { importFile(event.target.files[0]); event.target.value = ''; });
  $('#export-markdown').addEventListener('click', () => exportEntry(false));
  $('#export-bundle').addEventListener('click', () => exportEntry(true));
}
async function boot() {
  try {
    await loadImageConfig();
    db = await openDB();
    const [storedEntries, storedAssets] = await Promise.all([allRecords('entries'), allRecords('assets')]);
    storedAssets.forEach(asset => assets.set(asset.path, asset));
    restoreYouTubeUploads(storedAssets, {
      async save(record) {
        pendingWrites++;
        try { assets.set(record.path, record); await writeRecords('assets', [record]); }
        finally { pendingWrites--; }
      },
      async complete(ref, url) {
        // Swap only the matching block. Do this before yielding so typing cannot
        // serialize the old placeholder back over the completed video reference.
        for (const card of document.querySelectorAll('[data-upload-ref]')) {
          if (card.dataset.uploadRef !== ref) continue;
          const replacement = mediaBlock('youtube', url, '', card.contentEditable === 'false');
          card.replaceWith(replacement);
          mountYouTubePlayers(replacement).catch(error => notice(error.message, true));
        }
        const writes = [];
        if (editorAuthorized && activeId) writes.push(saveEditor());
        for (const entry of [homeEntry, ...entries.values()]) {
          if (!entry || entry.deleted) continue;
          const markdown = entry.markdown.split('\n').map(line => line.startsWith('[Video:') && line.endsWith(`](${ref})`) ? url : line).join('\n');
          if (markdown !== entry.markdown) { entry.markdown = markdown; writes.push(persist(entry)); }
        }
        await Promise.all(writes);
      },
    });
    const cloud = await cloudPages.load();
    browserPagesForImport = storedEntries;
    let initial = cloud.cloud ? cloud.pages : storedEntries;
    if (!initial.length && !cloud.cloud) {
      const response = await fetch('/content/entries.json');
      if (!response.ok) throw new Error('Could not load the sample pages.');
      initial = (await response.json()).map((entry, order) => ({ ...entry, order })); await writeRecords('entries', initial);
    }
    homeEntry = initial.find(entry => entry.id === HOME_ID && !entry.deleted);
    if (!homeEntry) {
      if (cloud.cloud) homeEntry = {id:HOME_ID,title:'Home',markdown:''};
      else {
        const response = await fetch('/content/home.json');
        if (!response.ok) throw new Error('Could not load Home.');
        homeEntry = { ...(await response.json()), id: HOME_ID };
        await writeRecords('entries', [homeEntry]);
      }
    }
    const originalOrder = ['untitled', 'note', 'link', 'image', 'unfinished'];
    initial.forEach(entry => { entry.order ??= originalOrder.includes(entry.id) ? originalOrder.indexOf(entry.id) : 5; });
    initial.filter(entry => entry.id !== HOME_ID && !entry.deleted).sort((a, b) => a.order - b.order).forEach(entry => entries.set(entry.id, entry));
    bindEvents(); migrateLegacyURL(); await route();
  } catch (error) {
    notice(`The garden could not start. ${error.message || 'Please reload and try again.'} Your saved browser data has been kept.`, true);
    console.error(error);
  }
}
boot();
