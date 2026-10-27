import { marked } from 'marked';
import TurndownService from 'turndown';
import DOMPurify from 'dompurify';
import { zipSync, unzipSync, strToU8, strFromU8 } from 'fflate';

const $ = selector => document.querySelector(selector);
const body = $('#writing-body');
const titleInput = $('#entry-title');
const entries = new Map();
const assets = new Map();
const urls = new Map();
let db, activeId, savedRange, insertMode, revision = 0, pendingWrites = 0, saveFailed = false;
let noticeTimer;
const escapeHTML = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const slug = value => value.normalize('NFKD').replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 90) || 'page';
const mdDestination = value => value.replace(/ /g, '%20').replace(/\(/g, '%28').replace(/\)/g, '%29');
const mdLabel = value => String(value).replace(/[\\[\]]/g, '\\$&');
const titleFor = entry => entry.title.trim() || 'Untitled page';
function notice(message, error = false) {
  clearTimeout(noticeTimer);
  $('#notice').textContent = message;
  $('#notice').hidden = false;
  $('#notice').dataset.error = error;
  noticeTimer = setTimeout(() => { $('#notice').hidden = true; }, error ? 9000 : 4500);
}
function saveStatus(message, error = false) {
  $('#save-status').textContent = message;
  $('#save-status').dataset.state = error ? 'error' : 'saved';
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
  saveStatus('Saving locally…');
  return writeRecords('entries', [{ ...entry }]).then(() => {
    if (currentRevision === revision) {
      saveFailed = false;
      saveStatus('Saved in this browser');
    }
    return true;
  }).catch(() => {
    saveFailed = true;
    saveStatus('Could not save — export a copy', true);
    notice('Browser storage could not save this change. Keep this tab open and export your page.', true);
    return false;
  }).finally(() => { pendingWrites--; });
}
function safeURL(value) {
  return /^(https?:\/\/|mailto:|#)/i.test(value) || /^\.?\/?assets\//.test(value);
}
function youtubeID(value) {
  try {
    const url = new URL(value);
    if (!['https:', 'http:'].includes(url.protocol)) return null;
    let id;
    if (['youtu.be', 'www.youtu.be'].includes(url.hostname)) id = url.pathname.split('/')[1];
    if (['youtube.com', 'www.youtube.com', 'm.youtube.com'].includes(url.hostname)) {
      id = url.pathname === '/watch' ? url.searchParams.get('v') : /^\/(embed|shorts|live)\//.test(url.pathname) ? url.pathname.split('/')[2] : null;
    }
    return /^[a-zA-Z0-9_-]{11}$/.test(id || '') ? id : null;
  } catch { return null; }
}
function assetURL(path) {
  if (path === './sample.svg' || path === 'sample.svg') return './sample.svg';
  if (!assets.has(path)) return null;
  if (!urls.has(path)) urls.set(path, URL.createObjectURL(assets.get(path).blob));
  return urls.get(path);
}
function mediaBlock(kind, ref, label, editing) {
  const card = document.createElement('figure');
  card.className = 'media-block';
  card.dataset.mediaKind = kind;
  card.dataset.ref = ref;
  card.dataset.label = label || '';
  if (editing) {
    card.contentEditable = 'false';
    card.tabIndex = 0;
    card.setAttribute('aria-label', kind === 'youtube' ? 'YouTube reference' : `${kind === 'image' ? 'Image' : 'Video'}${label ? `: ${label}` : ''}`);
  }
  const media = kind === 'youtube' ? null : assetURL(ref);
  if (kind === 'image' && media) {
    const img = document.createElement('img'); img.src = media; img.alt = label || 'Image'; card.append(img);
  } else if (kind === 'video' && media) {
    const video = document.createElement('video'); video.src = media; video.controls = true; video.preload = 'metadata'; card.append(video);
  }
  if (kind === 'youtube' || !media) {
    const name = document.createElement('span'); name.className = 'media-title';
    name.textContent = kind === 'youtube' ? '▷ YouTube video · local placeholder' : label || (kind === 'image' ? 'Image reference' : 'Video reference');
    const detail = document.createElement('span'); detail.className = 'media-detail';
    detail.textContent = kind === 'youtube' ? ref : `${ref} · Media file not available locally. Import its garden ZIP to restore it.`;
    card.append(name, detail);
  }
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
    const ref = link.getAttribute('href') || '';
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
  if (!activeId || $('#editor-shell').hidden) return;
  const entry = entries.get(activeId);
  entry.title = titleInput.value;
  entry.markdown = turndown.turndown(body.innerHTML);
  document.querySelector(`#editor-pages a[data-id="${activeId}"]`).textContent = titleFor(entry);
  persist(entry);
}
function renderNavigation() {
  $('#editor-pages').replaceChildren();
  $('.page-shelf nav').replaceChildren();
  $('.all-pages').replaceChildren();
  for (const entry of entries.values()) {
    const link = document.createElement('a'); link.href = `#editor/${entry.id}`; link.dataset.id = entry.id; link.textContent = titleFor(entry);
    if (activeId === entry.id) link.setAttribute('aria-current', 'page');
    $('#editor-pages').append(link);
    const publicLink = document.createElement('a'); publicLink.href = `#page/${entry.id}`; publicLink.dataset.page = entry.id; publicLink.textContent = titleFor(entry);
    if ($('.page-shelf nav').childElementCount < 8) $('.page-shelf nav').append(publicLink.cloneNode(true));
    const li = document.createElement('li'); li.append(publicLink); $('.all-pages').append(li);
  }
}
function updateHome() {
  for (const [id, selector] of [['note', '.small-note'], ['link', '.saved-link'], ['unfinished', '.unfinished']]) {
    const entry = entries.get(id); if (!entry) continue;
    const section = $(selector); section.querySelector('h2 a').textContent = titleFor(entry);
    const fragment = renderMarkdown(entry.markdown);
    fragment.querySelectorAll('br').forEach(br => br.replaceWith('\n'));
    const paragraphs = [...fragment.querySelectorAll('p')];
    const preview = id === 'link' && paragraphs.length > 1 ? paragraphs[1].textContent : (paragraphs[0]?.textContent || fragment.textContent);
    section.querySelector('p').textContent = preview.trim().slice(0, 160) || 'An open page.';
    if (id === 'link') {
      const link = fragment.querySelector('a[href]');
      try { section.querySelector('.link-domain').textContent = new URL(link?.getAttribute('href')).hostname; }
      catch { section.querySelector('.link-domain').textContent = ''; }
    }
  }
  const entry = entries.get('image');
  if (entry) {
    $('.image-fragment figcaption a').textContent = titleFor(entry);
    const match = entry.markdown.match(/!\[[^\]]*\]\(([^)]+)\)/);
    const src = match && assetURL(match[1]);
    $('.image-fragment img').hidden = !src;
    if (src) {
      $('.image-fragment img').src = src;
      $('.image-fragment img').alt = renderMarkdown(entry.markdown).querySelector('img')?.alt || titleFor(entry);
    }
  }
  const first = entries.get('untitled');
  if (first) $('.intro a').textContent = titleFor(first).toLowerCase();
}
function route(focus = false) {
  if (location.hash === '#main') { $('#main').focus(); return; }
  body.querySelectorAll('video').forEach(video => video.pause());
  $('#page-content').querySelectorAll('video').forEach(video => video.pause());
  const hash = location.hash;
  const editing = /^#editor(?:\/|$)/.test(hash);
  const id = (editing ? hash.slice(8) : hash.startsWith('#page/') ? hash.slice(6) : '');
  $('.site').hidden = editing;
  $('#editor-shell').hidden = !editing;
  if (editing) {
    activeId = entries.has(id) ? id : entries.keys().next().value;
    const entry = entries.get(activeId);
    titleInput.value = entry.title;
    body.replaceChildren(renderMarkdown(entry.markdown, true));
    savedRange = null;
    $('#view-garden').href = `#page/${activeId}`;
    $('#preview-entry').href = `#page/${activeId}`;
    saveStatus(saveFailed ? 'Could not save — export a copy' : pendingWrites ? 'Saving locally…' : 'Saved in this browser', saveFailed);
    document.title = `${titleFor(entry)} — Local editor`;
  } else {
    activeId = null;
    const entry = entries.get(id);
    const view = entry ? 'page' : hash === '#pages' ? 'pages' : 'home';
    document.querySelectorAll('.view').forEach(section => { section.hidden = section.id !== `${view}-view`; });
    if (entry) {
      $('#page-title').textContent = titleFor(entry);
      $('#page-content').replaceChildren(renderMarkdown(entry.markdown));
      $('#edit-this-page').href = `#editor/${entry.id}`;
      const related = entries.get(entry.related) || [...entries.values()].find(item => item.id !== entry.id);
      $('.page-connections').hidden = !related;
      if (related) { $('#related-page').textContent = titleFor(related); $('#related-page').href = `#page/${related.id}`; }
    }
    document.title = `${entry ? titleFor(entry) : view === 'pages' ? 'All Pages' : 'Home'} — Peter`;
    updateHome();
  }
  renderNavigation();
  document.querySelectorAll('[data-page]').forEach(link => {
    if (link.dataset.page === (entries.has(id) ? id : hash === '#pages' ? 'pages' : 'home')) link.setAttribute('aria-current', 'page');
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
  range.collapse(true); selection.removeAllRanges(); selection.addRange(range); savedRange = range.cloneRange(); saveEditor();
}
function textInsert(text) { restoreSelection(); document.execCommand('insertText', false, text); saveEditor(); }
function showInsert(mode) {
  rememberSelection(); insertMode = mode;
  const selection = window.getSelection().toString();
  $('#insert-form').reset(); $('#insert-error').textContent = '';
  $('#insert-title').textContent = mode === 'youtube' ? 'Add a YouTube reference' : 'Add a link';
  $('#url-label').textContent = mode === 'youtube' ? 'YouTube URL' : 'URL or garden page link';
  $('#caption-label').hidden = $('#insert-caption').hidden = mode === 'youtube';
  $('#insert-caption').value = selection;
  $('#insert-help').textContent = mode === 'youtube' ? 'Adds a placeholder. No upload or remote player. The URL stays plain text in Markdown.' : 'Use https://example.com or a garden link such as #page/note.';
  $('#insert-dialog').showModal(); $('#insert-url').focus();
}
async function addFiles(files, kind) {
  const owner = activeId;
  rememberSelection();
  for (const file of files) {
    if (kind === 'image' && !/^image\/(png|jpeg|gif|webp|avif)$/.test(file.type)) { notice('Choose a PNG, JPEG, GIF, WebP, or AVIF image.', true); continue; }
    if (kind === 'video' && !file.type.startsWith('video/')) { notice('Choose a video file for a local preview.', true); continue; }
    if (file.size > 40 * 1024 * 1024) { notice('For this prototype, choose a file smaller than 40 MB.', true); continue; }
    const path = `assets/${crypto.randomUUID()}-${slug(file.name)}`;
    const asset = { path, name: file.name, blob: file };
    try {
      await writeRecords('assets', [asset]); assets.set(path, asset);
      if (activeId !== owner || $('#editor-shell').hidden) { notice('The page changed before the file was inserted. Select it again in the intended page.'); return; }
      insertNode(mediaBlock(kind, path, file.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' '), true));
    } catch { notice('There is not enough browser storage for this file. Try a smaller one.', true); }
  }
}
function download(blob, name) {
  const url = URL.createObjectURL(blob), link = document.createElement('a'); link.href = url; link.download = name; link.click(); setTimeout(() => URL.revokeObjectURL(url), 30000);
}
function exportedMarkdown(entry) { return `# ${titleFor(entry).replace(/[\r\n]/g, ' ')}\n\n${entry.markdown}\n`; }
async function exportEntry(bundle) {
  saveEditor();
  const entry = { ...entries.get(activeId) }, filename = `${slug(titleFor(entry))}.md`;
  if (!bundle) { download(new Blob([exportedMarkdown(entry)], { type: 'text/markdown;charset=utf-8' }), filename); notice('Markdown exported. Local media paths need the matching files; use the ZIP to include them.'); return; }
  try {
    const files = { [filename]: strToU8(exportedMarkdown(entry)) };
    const fragment = renderMarkdown(entry.markdown);
    const refs = [...fragment.querySelectorAll('[data-ref]')].map(node => node.dataset.ref);
    const missing = [];
    for (const ref of new Set(refs)) {
      if (assets.has(ref)) files[ref] = new Uint8Array(await assets.get(ref).blob.arrayBuffer());
      else if (ref === './sample.svg' || ref === 'sample.svg') files['sample.svg'] = new Uint8Array(await (await fetch('./sample.svg')).arrayBuffer());
      else if (!youtubeID(ref)) missing.push(ref);
    }
    files['README.txt'] = strToU8('This local garden export contains a Markdown page and its available local media.\nImport the ZIP into the local editor to restore both. The first # heading is the title.\nImages: ![description](assets/file.png)\nVideos: [Video: description](assets/file.mp4)\nYouTube: a plain URL on its own line; no player or upload is included.\n' + (missing.length ? `\nUnavailable media (references retained):\n${missing.join('\n')}\n` : ''));
    download(new Blob([zipSync(files, { level: 0 })], { type: 'application/zip' }), `${slug(titleFor(entry))}.zip`);
    notice(missing.length ? 'ZIP exported. Some references have no local file; see README.txt in the ZIP.' : 'Exported Markdown and local media together.');
  } catch { notice('Export failed. Try exporting Markdown alone.', true); }
}
async function createEntry(title = '', markdown = '') {
  const entry = { id: crypto.randomUUID(), title, markdown, related: entries.keys().next().value, order: Math.max(-1, ...[...entries.values()].map(item => item.order ?? 0)) + 1 };
  entries.set(entry.id, entry);
  history.pushState(null, '', `#editor/${entry.id}`);
  route(true);
  titleInput.focus();
  await persist(entry);
}
async function importFile(file) {
  if (!file) return;
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
    await createEntry(title, markdown); notice('Imported as a new page. Your other pages are kept.');
  } catch (error) { notice(error.message || 'Could not import this file.', true); }
}
function bindEvents() {
  document.execCommand('defaultParagraphSeparator', false, 'p');
  window.addEventListener('hashchange', () => route(true));
  window.addEventListener('beforeunload', event => { if (pendingWrites || saveFailed) { event.preventDefault(); event.returnValue = ''; } });
  document.addEventListener('selectionchange', rememberSelection);
  body.addEventListener('input', saveEditor);
  body.addEventListener('click', event => {
    const media = event.target.closest('[data-media-kind]');
    if (media && !event.target.closest('video')) media.focus({ preventScroll: true });
    if (event.target.closest('a')) event.preventDefault();
  });
  body.addEventListener('keydown', event => {
    if (event.target.matches('[data-media-kind]') && ['Backspace', 'Delete'].includes(event.key)) {
      event.preventDefault(); event.target.remove(); body.focus(); saveEditor();
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
  $('#block-format').addEventListener('change', event => { restoreSelection(); document.execCommand('formatBlock', false, event.target.value); saveEditor(); });
  $('#add-link').addEventListener('click', () => showInsert('link'));
  $('#add-youtube').addEventListener('click', () => showInsert('youtube'));
  $('#cancel-insert').addEventListener('click', () => $('#insert-dialog').close());
  $('#insert-form').addEventListener('submit', event => {
    event.preventDefault(); const url = $('#insert-url').value.trim();
    if (insertMode === 'youtube' ? !youtubeID(url) : !safeURL(url)) { $('#insert-error').textContent = insertMode === 'youtube' ? 'Enter a YouTube watch, short, or youtu.be URL.' : 'Use an https://, http://, mailto:, or #page/ URL.'; return; }
    $('#insert-dialog').close();
    if (insertMode === 'youtube') insertNode(mediaBlock('youtube', url, '', true));
    else {
      restoreSelection(); const anchor = document.createElement('a'); anchor.href = url; anchor.textContent = $('#insert-caption').value.trim() || url;
      const selection = window.getSelection(), range = selection.getRangeAt(0); range.deleteContents(); range.insertNode(anchor); range.setStartAfter(anchor); range.collapse(true); selection.removeAllRanges(); selection.addRange(range); savedRange = range.cloneRange(); saveEditor();
    }
  });
  for (const kind of ['image', 'video']) {
    $(`#add-${kind}`).addEventListener('click', () => { rememberSelection(); $(`#${kind}-file`).click(); });
    $(`#${kind}-file`).addEventListener('change', event => { addFiles([...event.target.files], kind); event.target.value = ''; });
  }
  $('#new-entry').addEventListener('click', () => createEntry());
  $('#import-markdown').addEventListener('click', () => $('#markdown-file').click());
  $('#markdown-file').addEventListener('change', event => { importFile(event.target.files[0]); event.target.value = ''; });
  $('#export-markdown').addEventListener('click', () => exportEntry(false));
  $('#export-bundle').addEventListener('click', () => exportEntry(true));
}
async function boot() {
  try {
    db = await openDB();
    const [storedEntries, storedAssets] = await Promise.all([allRecords('entries'), allRecords('assets')]);
    storedAssets.forEach(asset => assets.set(asset.path, asset));
    let initial = storedEntries;
    if (!initial.length) {
      const response = await fetch('./content/entries.json');
      if (!response.ok) throw new Error('Could not load the sample pages.');
      initial = (await response.json()).map((entry, order) => ({ ...entry, order })); await writeRecords('entries', initial);
    }
    const originalOrder = ['untitled', 'note', 'link', 'image', 'unfinished'];
    initial.forEach(entry => { entry.order ??= originalOrder.includes(entry.id) ? originalOrder.indexOf(entry.id) : 5; });
    initial.sort((a, b) => a.order - b.order).forEach(entry => entries.set(entry.id, entry));
    bindEvents(); route();
  } catch (error) {
    notice(`The local editor could not start. ${error.message || 'Browser storage is unavailable.'} Try a regular browser window with storage enabled.`, true);
    console.error(error);
  }
}
boot();
