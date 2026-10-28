// The browser sends file slices directly to Google. Only short-lived access
// tokens enter memory; refresh tokens stay in the local Python session.
const $ = selector => document.querySelector(selector);
const delay = (ms, signal) => new Promise((resolve, reject) => {
  const abort = () => { clearTimeout(timer); reject(new DOMException('Stopped', 'AbortError')); };
  const timer = setTimeout(() => { signal?.removeEventListener('abort', abort); resolve(); }, ms);
  if (signal?.aborted) abort();
  else signal?.addEventListener('abort', abort, { once: true });
});
async function api(path, values = {}, signal) {
  const response = await fetch(`/youtube/${path}`, {
    method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ csrf: $('#sign-out-csrf').value, ...values }), signal,
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.error || 'YouTube request failed. Sign in again if your editor session expired.');
  return result;
}
function transfer(url, token, blob, range, signal, onProgress) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', url); xhr.timeout = 120000;
    xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    xhr.setRequestHeader('Content-Type', blob?.type || 'application/octet-stream');
    xhr.setRequestHeader('Content-Range', range);
    xhr.upload.onprogress = event => onProgress(event.loaded);
    const abort = () => xhr.abort();
    signal.addEventListener('abort', abort, { once: true });
    const clean = () => signal.removeEventListener('abort', abort);
    xhr.onload = () => {
      clean();
      let data = {}; try { data = JSON.parse(xhr.responseText || '{}'); } catch { /* incomplete uploads have no JSON body */ }
      const exposed = xhr.getAllResponseHeaders().toLowerCase();
      resolve({ status: xhr.status, range: exposed.includes('range:') ? xhr.getResponseHeader('Range') : null, retry: exposed.includes('retry-after:') ? xhr.getResponseHeader('Retry-After') : null, data });
    };
    xhr.onerror = xhr.ontimeout = () => { clean(); resolve({ status: 0 }); };
    xhr.onabort = () => { clean(); reject(new DOMException('Stopped', 'AbortError')); };
    if (signal.aborted) { clean(); reject(new DOMException('Stopped', 'AbortError')); return; }
    xhr.send(blob);
  });
}
export async function uploadVideo(job, metadata, signal, onProgress) {
  let token = (await api('token', {}, signal)).access_token;
  if (!job.uri) {
    const response = await fetch('https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status', {
      method: 'POST', signal, headers: {
        Authorization: `Bearer ${token}`, 'Content-Type': 'application/json',
        'X-Upload-Content-Length': String(job.file.size), 'X-Upload-Content-Type': job.file.type || 'application/octet-stream',
      },
      body: JSON.stringify({ snippet: { title: metadata.title, description: metadata.description, categoryId: '22' }, status: {
        privacyStatus: metadata.visibility, embeddable: true, selfDeclaredMadeForKids: metadata.madeForKids,
      } }),
    });
    if (!response.ok) {
      const result = await response.json().catch(() => ({}));
      throw new Error(result.error?.message || `YouTube could not start the upload (${response.status}).`);
    }
    const uri = response.headers.get('Location');
    const parsed = uri && new URL(uri);
    if (!parsed || parsed.protocol !== 'https:' || parsed.hostname !== 'www.googleapis.com' || !parsed.pathname.startsWith('/upload/youtube/')) throw new Error('YouTube returned an invalid upload address.');
    job.uri = uri;
  }
  let offset = 0, probe = true, retries = 0;
  while (!job.videoId) {
    const end = Math.min(offset + 8 * 1024 * 1024, job.file.size);
    const response = await transfer(job.uri, token, probe ? null : job.file.slice(offset, end, job.file.type || 'application/octet-stream'),
      probe ? `bytes */${job.file.size}` : `bytes ${offset}-${end - 1}/${job.file.size}`, signal,
      loaded => onProgress(Math.min(job.file.size, offset + loaded), job.file.size));
    if (response.status === 200 || response.status === 201) {
      if (!/^[A-Za-z0-9_-]{11}$/.test(response.data.id || '')) throw new Error('YouTube did not return a video ID. Retry to check the upload.');
      job.videoId = response.data.id; onProgress(job.file.size, job.file.size); return;
    }
    if (response.status === 308) {
      const confirmed = response.range?.match(/^bytes=0-(\d+)$/);
      const next = confirmed ? Number(confirmed[1]) + 1 : 0;
      if (next > job.file.size) throw new Error('YouTube returned an invalid upload position.');
      if (next <= offset && (!probe || offset === job.file.size)) {
        if (++retries > 5) throw new Error('YouTube stopped accepting bytes. Retry to resume.');
        await delay(2000, signal);
      } else retries = 0;
      offset = next; probe = false;
      onProgress(offset, job.file.size);
      if (offset === job.file.size) probe = true;
      continue;
    }
    if (response.status === 404) { job.uri = null; throw new Error('The upload session expired. Retry to start the upload again.'); }
    if (response.status === 401 || response.status === 0 || response.status === 429 || response.status >= 500) {
      if (++retries > 5) throw new Error('Upload interrupted. Retry to resume the upload.');
      if (response.status === 401) token = (await api('token', { refresh: 'true' }, signal)).access_token;
      const retrySeconds = Number(response.retry) || 0;
      await delay(Math.min(60000, Math.max(retrySeconds * 1000, 1000 * 2 ** retries)), signal);
      probe = true; continue;
    }
    throw new Error(response.data?.error?.message || `YouTube rejected the upload (${response.status}).`);
  }
}
export async function waitForVideo(id, signal, report) {
  const deadline = Date.now() + 30 * 60 * 1000;
  let interval = 3000;
  while (Date.now() < deadline) {
    const video = await api('video', { id }, signal);
    const status = video.status || {}, processing = video.processingDetails || {};
    if (['failed', 'rejected', 'deleted'].includes(status.uploadStatus) || processing.processingStatus === 'failed')
      throw new Error(`YouTube could not process the video: ${status.rejectionReason || status.failureReason || processing.processingFailureReason || status.uploadStatus}.`);
    if (processing.processingStatus === 'succeeded' || status.uploadStatus === 'processed') {
      if (status.embeddable === false) throw new Error('This video has embedding disabled. Enable embedding in YouTube Studio, then retry.');
      return;
    }
    report('Uploaded. Waiting for YouTube to finish processing…');
    await delay(interval, signal); interval = Math.min(15000, interval * 1.4);
  }
  throw new Error('YouTube is still processing. Retry to check again; the file will not be uploaded twice.');
}

const jobs = new Map();
let saveJob, finishJob;
function defaultMetadata(name) {
  return { title: [...name.replace(/\.[^.]+$/, '').replace(/[<>]/g, ' ')].slice(0, 100).join('').trim() || 'Untitled video', description: '', visibility: 'unlisted', madeForKids: false };
}
export const uploadReference = ref => /^assets\/youtube-upload-[a-zA-Z0-9-]+$/.test(ref);
export const hasActiveUploads = () => [...jobs.values()].some(job => job.busy && !job.videoId);
export function restoreYouTubeUploads(records, callbacks) {
  saveJob = callbacks.save; finishJob = callbacks.complete;
  for (const record of records) if (record.youtubeUpload) jobs.set(record.path, { ...record.youtubeUpload, ref: record.path });
}
async function persistJob(job) {
  // Persist recovery metadata, never the file, bearer token, or resumable URL.
  await saveJob({ path: job.ref, name: job.name, youtubeUpload: {
    name: job.name, size: job.size, metadata: job.metadata, videoId: job.videoId || null,
    state: job.state, message: job.message || '',
  } });
}
function refresh(job, extraCard) {
  const cards = [...document.querySelectorAll('[data-upload-ref]')];
  if (extraCard && !cards.includes(extraCard)) cards.push(extraCard);
  for (const card of cards) {
    if (card.dataset.uploadRef !== job.ref) continue;
    card.querySelector('[data-upload-status]').textContent = job.message || 'Ready to upload';
    const progress = card.querySelector('progress');
    progress.hidden = job.state !== 'uploading'; progress.value = job.progress || 0;
    const error = card.querySelector('[data-upload-error]');
    error.textContent = job.error || '';
    const action = card.querySelector('[data-upload-action]');
    if (!action) continue;
    action.textContent = job.connected === false ? 'Connect YouTube' : job.file || job.videoId ? 'Retry' : 'Choose video again';
    action.disabled = !!job.busy || !!job.connecting;
    action.hidden = !!job.busy || !!job.connecting || (!job.error && job.connected !== false);

  }
}
async function connection(job) {
  const response = await fetch('/youtube/status', { cache: 'no-store' });
  if (!response.ok) throw new Error('Sign in to the editor again.');
  const result = await response.json();
  job.connected = result.connected;
  if (!result.configured) throw new Error('YouTube needs setup. See README.md.');
  return result;
}
async function connectChannel(job) {
  const popup = window.open('about:blank', 'cybergarden-youtube', 'popup,width=600,height=740');
  if (!popup) throw new Error('Allow popups to connect your YouTube channel.');
  job.popup = popup; job.connecting = true; job.error = ''; refresh(job);
  try {
    const result = await api('connect'); popup.location.href = result.url;
    const deadline = Date.now() + 10 * 60 * 1000;
    let finished = false;
    while (!popup.closed && Date.now() < deadline && !job.stopped) {
      await delay(1000);
      try { finished = popup.location.pathname === '/youtube/connected'; } catch { /* Google is cross-origin */ }
      if (finished) break;
    }
    popup.close();
    if (!finished || !(await connection(job)).connected) throw new Error('YouTube connection was not completed. Try again.');
    job.message = 'Connected. Ready to upload.';
  } finally { popup.close(); job.connecting = false; refresh(job); }
}
async function run(job) {
  if (job.busy || job.stopped) return;
  job.busy = true; job.error = ''; job.controller = new AbortController();
  job.state = job.videoId ? 'processing' : 'uploading';
  job.message = job.videoId ? 'Processing on YouTube…' : 'Uploading…'; refresh(job);
  try {
    if (!(await connection(job)).connected) throw new Error('Connect YouTube, then retry.');
    if (!job.videoId) {
      if (!job.uri) job.metadata = defaultMetadata(job.name);
      if (!job.file) throw new Error('Choose the same video file to resume this upload.');
      await uploadVideo(job, job.metadata, job.controller.signal, (sent, total) => {
        job.progress = sent / total; job.message = `Uploading… ${Math.floor(job.progress * 100)}%`; refresh(job);
      });
      job.state = 'processing'; job.message = 'Processing on YouTube…';
      await persistJob(job); refresh(job);
    }
    await waitForVideo(job.videoId, job.controller.signal, () => { job.message = 'Processing on YouTube…'; refresh(job); });
    if (job.stopped) return;
    job.state = 'ready'; job.message = 'Ready'; await persistJob(job);
    await finishJob(job.ref, `https://www.youtube.com/watch?v=${job.videoId}`);
    if (job.preview) URL.revokeObjectURL(job.preview);
    job.file = null;
  } catch (failure) {
    if (failure.name !== 'AbortError') {
      job.state = 'error'; job.error = failure.message; job.message = job.videoId ? 'Processing needs attention' : 'Upload needs attention';
      await persistJob(job).catch(() => { job.error += ' Keep this tab open; recovery could not be saved.'; });
    }
  } finally { job.busy = false; refresh(job); }
}
export function stopYouTubeUpload(ref) {
  const job = jobs.get(ref);
  if (!job) return;
  job.stopped = true; job.controller?.abort(); job.popup?.close();
  if (job.preview) URL.revokeObjectURL(job.preview);
}
export function completedUpload(ref) {
  const job = jobs.get(ref);
  return job?.state === 'ready' && job.videoId ? `https://www.youtube.com/watch?v=${job.videoId}` : null;
}
export function mountUploadPlaceholder(card, ref, editing) {
  const job = jobs.get(ref) || { ref, name: card.dataset.label || 'Video', state: 'error', message: 'Upload interrupted', metadata: { title: card.dataset.label || 'Video', description: '', visibility: 'unlisted', madeForKids: false } };
  jobs.set(ref, job); card.dataset.uploadRef = ref; card.classList.add('youtube-upload');
  const preview = document.createElement('div'); preview.className = 'upload-preview';
  if (job.file) {
    job.preview ||= URL.createObjectURL(job.file);
    const video = document.createElement('video'); video.src = job.preview; video.controls = true; video.muted = true; video.preload = 'metadata'; preview.append(video);
  } else { preview.textContent = 'Video'; }
  const panel = document.createElement('div'); panel.className = 'upload-overlay';
  panel.innerHTML = `<span data-upload-status role="status" aria-live="polite"></span><progress max="1" value="0" aria-label="Video upload progress" hidden></progress><span data-upload-error role="alert"></span>`;
  if (editing) {
    const controls = document.createElement('div');
    controls.innerHTML = `<button type="button" data-upload-action hidden>Retry</button><input data-upload-reselect type="file" accept="video/*" hidden>`;
    panel.append(controls);
    for (const type of ['paste', 'keydown', 'contextmenu', 'input']) controls.addEventListener(type, event => event.stopPropagation());
    controls.querySelector('[data-upload-action]').addEventListener('click', async () => {
      if (job.connected === false) {
        try { await connectChannel(job); if (!job.stopped) run(job); }
        catch (failure) { job.error = failure.message; refresh(job); }
      } else if (!job.file && !job.videoId) controls.querySelector('[data-upload-reselect]').click();
      else run(job);
    });
    controls.querySelector('[data-upload-reselect]').addEventListener('change', event => {
      const file = event.target.files[0]; event.target.value = '';
      if (!file) return;
      if (file.name !== job.name || (job.size && file.size !== job.size)) { job.error = 'Choose the original video file.'; refresh(job); return; }
      job.file = file; run(job);
    });
    connection(job).then(result => {
      if (job.stopped || job.busy || job.state === 'ready') return;
      if (!result.connected) { job.message = 'Connect YouTube to upload'; refresh(job); return; }
      if (job.state !== 'error' && (job.file || job.videoId)) run(job);
      else {
        job.message = job.videoId ? 'Processing needs attention' : 'Upload interrupted';
        job.error ||= job.videoId ? 'Retry to check processing.' : 'Choose the original file to continue.';
        refresh(job);
      }
    }).catch(failure => { job.error = failure.message; refresh(job); });
  }
  card.append(preview, panel); refresh(job, card);
}
export function bindYouTubeUpload({ capture, insert }) {
  const input = $('#youtube-upload-file');
  let target;
  input.addEventListener('change', async () => {
    const file = input.files[0]; input.value = '';
    if (!file) return;
    if (!file.size || file.size > 256e9 || (file.type && !file.type.startsWith('video/') && file.type !== 'application/octet-stream')) { alert('Choose a video file up to 256 GB.'); return; }
    const ref = `assets/youtube-upload-${crypto.randomUUID()}`;
    const job = { ref, file, name: file.name, size: file.size, state: 'ready-to-upload', message: 'Preparing upload…', metadata: defaultMetadata(file.name) };
    jobs.set(ref, job);
    if (!insert(target, ref, file.name)) { jobs.delete(ref); return; }
    try { await persistJob(job); } catch { job.error = 'This placeholder could not be saved. Keep this tab open.'; refresh(job); }
  });
  window.addEventListener('beforeunload', event => { if (hasActiveUploads()) { event.preventDefault(); event.returnValue = ''; } });
  return () => { target = capture(); input.click(); };
}
