import { test } from 'node:test';
import assert from 'node:assert/strict';
import { uploadVideo, waitForVideo } from '../src/youtube-upload.js';

globalThis.document = { querySelector: () => ({ value: 'csrf-fixture' }) };
const metadata = { title: 'My clip', description: '', visibility: 'unlisted', madeForKids: false };
test('resume from server-confirmed bytes and recover a completed upload without reuploading', async () => {
  const calls = [];
  globalThis.fetch = async () => ({ ok: true, json: async () => ({ access_token: 'short-token' }) });
  const responses = [
    { status: 308, range: 'bytes=0-2' },
    { status: 201, data: { id: 'abcdefghijk' } },
    { status: 200, data: { id: 'abcdefghijk' } },
  ];
  globalThis.XMLHttpRequest = class {
    upload = {}; headers = {};
    open(method, url) { assert.equal(new URL(url).hostname, 'www.googleapis.com'); }
    setRequestHeader(name, value) { this.headers[name] = value; }
    getAllResponseHeaders() { return this.result.range ? `Range: ${this.result.range}` : ''; }
    getResponseHeader(name) { return name === 'Range' ? this.result.range : null; }
    send(blob) {
      calls.push({ range: this.headers['Content-Range'], size: blob?.size });
      this.result = responses.shift(); this.status = this.result.status;
      this.responseText = JSON.stringify(this.result.data || {}); this.onload();
    }
  };
  const file = new Blob(['123456'], { type: 'video/mp4' });
  const job = { file, uri: 'https://www.googleapis.com/upload/youtube/v3/videos?upload_id=fixture' };
  await uploadVideo(job, metadata, new AbortController().signal, () => {});
  assert.equal(job.videoId, 'abcdefghijk');
  assert.deepEqual(calls, [{ range: 'bytes */6', size: undefined }, { range: 'bytes 3-5/6', size: 3 }]);
  const uncertain = { file, uri: job.uri };
  await uploadVideo(uncertain, metadata, new AbortController().signal, () => {});
  assert.equal(uncertain.videoId, 'abcdefghijk');
  assert.equal(calls.at(-1).size, undefined);
});
test('processing failures do not become playable inserts', async () => {
  globalThis.fetch = async () => ({ ok: true, json: async () => ({ status: { uploadStatus: 'rejected', rejectionReason: 'copyright' } }) });
  await assert.rejects(waitForVideo('abcdefghijk', new AbortController().signal, () => {}), /copyright/);
});
test('completed processing respects embedding permission', async () => {
  globalThis.fetch = async () => ({ ok: true, json: async () => ({ status: { uploadStatus: 'processed', embeddable: false } }) });
  await assert.rejects(waitForVideo('abcdefghijk', new AbortController().signal, () => {}), /embedding disabled/);
});
