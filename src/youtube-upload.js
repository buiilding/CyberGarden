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
      if (++retries > 5) throw new Error('Upload interrupted. Keep this dialog open and retry to resume.');
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

export function bindYouTubeUpload({ capture, insert }) {
  const dialog = $('#youtube-upload-dialog'), form = $('#youtube-upload-form'), input = $('#youtube-upload-file');
  const status = $('#youtube-upload-status'), error = $('#youtube-upload-error'), submit = $('#youtube-upload-submit');
  const connect = $('#youtube-connect'), progress = $('#youtube-upload-progress');
  let target, job, controller, busy = false, popup;
  const report = message => { status.textContent = message; };
  const updateConnection = async () => {
    const response = await fetch('/youtube/status', { cache: 'no-store' });
    if (!response.ok) throw new Error('Sign in to the editor again.');
    const connection = await response.json();
    connect.disabled = !connection.configured || busy;
    submit.disabled = !connection.connected || busy;
    connect.textContent = connection.connected ? 'Change YouTube channel' : 'Connect YouTube';
    report(connection.connected ? `Upload to ${connection.channel}` : connection.configured ? 'Connect your YouTube channel to upload.' : 'YouTube needs setup: add YOUTUBE_CLIENT_ID and YOUTUBE_CLIENT_SECRET to .env.local, then restart. See README.md.');
    return connection.connected;
  };
  input.addEventListener('change', async () => {
    const file = input.files[0]; input.value = '';
    if (!file) return;
    form.reset(); error.textContent = ''; progress.hidden = true; submit.disabled = true;
    job = { file }; $('#youtube-upload-title').value = file.name.replace(/\.[^.]+$/, '').slice(0, 100) || 'Untitled video';
    $('#youtube-upload-filename').textContent = file.name;
    dialog.showModal();
    try { await updateConnection(); } catch (failure) { error.textContent = failure.message; }
  });
  connect.addEventListener('click', async () => {
    error.textContent = ''; popup = window.open('about:blank', 'cybergarden-youtube', 'popup,width=600,height=740');
    if (!popup) { error.textContent = 'Allow popups to connect your YouTube channel.'; return; }
    connect.disabled = true; submit.disabled = true;
    try {
      const connection = await api('connect'); popup.location.href = connection.url;
      report('Choose your YouTube channel in the Google window, then return here.');
      const deadline = Date.now() + 10 * 60 * 1000;
      // Wait for the callback to land on our origin before observing success.
      while (!popup.closed && Date.now() < deadline) {
        await delay(1000);
        let finished = false;
        try { finished = popup.location.pathname === '/youtube/connected'; } catch { /* Google window is cross-origin */ }
        if (finished) { popup.close(); break; }
      }
      if (!await updateConnection()) throw new Error('YouTube connection was not completed. Try again.');
    } catch (failure) { popup?.close(); error.textContent = failure.message; connect.disabled = false; }
  });
  const stop = () => { controller?.abort(); popup?.close(); dialog.close(); };
  $('#youtube-upload-cancel').addEventListener('click', stop);
  dialog.addEventListener('cancel', event => { event.preventDefault(); stop(); });
  form.addEventListener('submit', async event => {
    event.preventDefault(); if (busy || !job) return;
    const title = $('#youtube-upload-title').value.trim(), description = $('#youtube-upload-description').value;
    if (!title || [...title].length > 100 || /[<>]/.test(title)) { error.textContent = 'Use a title of 1–100 characters without < or >.'; return; }
    if (new TextEncoder().encode(description).length > 5000 || /[<>]/.test(description)) { error.textContent = 'Description must be at most 5,000 bytes, without < or >.'; return; }
    if ((!job.file.type.startsWith('video/') && job.file.type && job.file.type !== 'application/octet-stream') || !job.file.size || job.file.size > 256e9) { error.textContent = 'Choose a video file up to 256 GB.'; return; }
    controller = new AbortController(); busy = true; error.textContent = ''; submit.disabled = connect.disabled = true;
    form.querySelector('fieldset').disabled = true;
    try {
      if (!job.videoId) await uploadVideo(job, { title, description, visibility: $('#youtube-upload-visibility').value, madeForKids: $('#youtube-upload-kids').value === 'yes' }, controller.signal, (sent, total) => {
        progress.hidden = false; progress.value = sent / total;
        report(`Uploading to YouTube… ${Math.floor(sent / total * 100)}%`);
      });
      progress.hidden = true;
      await waitForVideo(job.videoId, controller.signal, report);
      const url = `https://www.youtube.com/watch?v=${job.videoId}`;
      if (!insert(target, url)) throw new Error(`Uploaded, but the original editing position changed. Add this URL in the intended page: ${url}`);
      dialog.close(); job = null;
    } catch (failure) {
      if (failure.name !== 'AbortError') error.textContent = failure.message + (job?.videoId ? ` Video link: https://www.youtube.com/watch?v=${job.videoId}` : '');
    } finally {
      busy = false; submit.disabled = false; connect.disabled = !!job?.uri || !!job?.videoId;
      form.querySelector('fieldset').disabled = !!job?.uri || !!job?.videoId;
      submit.textContent = job?.videoId ? 'Check processing and insert' : job?.uri ? 'Resume upload' : 'Upload and insert';
    }
  });
  return () => {
    if (busy) { dialog.showModal(); return; }
    target = capture(); job = null; form.querySelector('fieldset').disabled = false;
    submit.textContent = 'Upload and insert'; input.click();
  };
}
