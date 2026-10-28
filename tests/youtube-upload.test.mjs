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

test('a restored processing card checks the existing video without uploading again', async () => {
  const { default: domino } = await import('@mixmark-io/domino');
  const { restoreYouTubeUploads, mountUploadPlaceholder, completedUpload } = await import('../src/youtube-upload.js');
  const window = domino.createWindow('<body><input id="sign-out-csrf" value="csrf"><figure id="card"></figure><p id="writing">New writing stays here</p></body>');
  const element = window.HTMLElement.prototype;
  Object.defineProperties(element, {
    append: { configurable: true, value(...nodes) { nodes.forEach(node => this.appendChild(node)); } },
    dataset: { configurable: true, get() { const node = this; return new Proxy({}, {get: (_, key) => node.getAttribute(`data-${key.replace(/[A-Z]/g,c=>'-'+c.toLowerCase())}`),set: (_, key,value) => {node.setAttribute(`data-${key.replace(/[A-Z]/g,c=>'-'+c.toLowerCase())}`,value);return true;}}); } },
  });
  globalThis.document = window.document;
  const query = document.querySelectorAll.bind(document);
  Object.defineProperty(document, 'querySelectorAll', {value: selector => Array.from(query(selector))});
  const requests = [], saved = [];
  let complete;
  const finished = new Promise(resolve => {complete = resolve;});
  globalThis.fetch = async (url) => {
    requests.push(url);
    return {ok:true,json:async()=>url.endsWith('/status') ? {configured:true,connected:true,channel:'Mine'} : {status:{uploadStatus:'processed',embeddable:true},processingDetails:{processingStatus:'succeeded'}}};
  };
  const ref = 'assets/youtube-upload-recovery';
  restoreYouTubeUploads([{path:ref,youtubeUpload:{name:'clip.mp4',videoId:'abcdefghijk',state:'processing',metadata:{title:'clip',description:'',visibility:'unlisted',madeForKids:false}}}], {
    save: async record => {saved.push(record);}, complete: async (ref,url) => complete({ref,url}),
  });
  mountUploadPlaceholder(document.querySelector('#card'),ref,true);
  assert.deepEqual(await finished,{ref,url:'https://www.youtube.com/watch?v=abcdefghijk'});
  assert.equal(requests.filter(url=>url.includes('/upload/')).length,0);
  assert.equal(saved.at(-1).youtubeUpload.state,'ready');
  assert.equal(completedUpload(ref),'https://www.youtube.com/watch?v=abcdefghijk');
  assert.equal(document.querySelector('#writing').textContent,'New writing stays here');
  assert.ok(!JSON.stringify(saved).includes('access_token'));
});
test('removing a processing placeholder prevents a late completion from reinserting it', async () => {
  const { restoreYouTubeUploads, mountUploadPlaceholder, stopYouTubeUpload } = await import('../src/youtube-upload.js');
  const card = document.querySelector('#card'); card.innerHTML = '';
  let release, started, completed = false;
  const waiting = new Promise(resolve => {started = resolve;});
  globalThis.fetch = async url => {
    if (url.endsWith('/status')) return {ok:true,json:async()=>({configured:true,connected:true})};
    started();
    return new Promise(resolve => {release = () => resolve({ok:true,json:async()=>({status:{uploadStatus:'processed',embeddable:true}})});});
  };
  const ref = 'assets/youtube-upload-removed';
  restoreYouTubeUploads([{path:ref,youtubeUpload:{name:'clip.mp4',videoId:'abcdefghijk',state:'processing',metadata:{title:'clip',description:'',visibility:'unlisted',madeForKids:false}}}], {
    save: async () => {}, complete: async () => {completed = true;},
  });
  mountUploadPlaceholder(card,ref,true);
  await waiting;
  stopYouTubeUpload(ref); card.remove(); release();
  await new Promise(setImmediate);
  assert.equal(completed,false);
  assert.equal(document.querySelector('#writing').textContent,'New writing stays here');
});
test('choosing a local video starts upload automatically with defaults and no settings panel', async () => {
  const { restoreYouTubeUploads, mountUploadPlaceholder, bindYouTubeUpload } = await import('../src/youtube-upload.js');
  const input = document.createElement('input'); input.id = 'youtube-upload-file'; document.body.appendChild(input);
  const file = new Blob(['test video'],{type:'video/mp4'});
  Object.defineProperty(file,'name',{value:'my-video.mp4'});
  Object.defineProperty(input,'files',{value:[file]});
  globalThis.window = {addEventListener(){}};
  const metadataSent = [];
  let complete;
  const finished = new Promise(resolve => {complete=resolve;});
  globalThis.fetch = async (url, options) => {
    if (url.startsWith('https://www.googleapis.com/upload/')) {
      metadataSent.push(JSON.parse(options.body));
      return {ok:true,headers:{get:()=> 'https://www.googleapis.com/upload/youtube/v3/videos?upload_id=fixture'}};
    }
    return {ok:true,json:async()=>url.endsWith('/status') ? {configured:true,connected:true,channel:'Mine'} : url.endsWith('/token') ? {access_token:'fixture-token'} : {status:{uploadStatus:'processed',embeddable:true}}};
  };
  globalThis.XMLHttpRequest = class {
    upload={};headers={};
    open(){} setRequestHeader(key,value){this.headers[key]=value;}
    getAllResponseHeaders(){return '';} getResponseHeader(){return null;}
    send(blob){this.status=blob?201:308;this.responseText=blob?' {"id":"abcdefghijk"}':'';this.onload();}
  };
  restoreYouTubeUploads([], {save:async()=>{},complete:async(ref,url)=>complete(url)});
  bindYouTubeUpload({capture:()=>({owner:'page'}),insert(target,ref,label){
    assert.equal(target.owner,'page');
    const card=document.createElement('figure');card.dataset.label=label;document.body.appendChild(card);
    mountUploadPlaceholder(card,ref,true);
    assert.equal(!!card.querySelector('fieldset'),false);
    assert.equal(!!card.querySelector('details'),false);
    assert.equal(!!card.querySelector('.upload-panel'),false);
    return true;
  }})();
  const event=document.createEvent('Event');event.initEvent('change',true,false);input.dispatchEvent(event);
  assert.equal(await finished,'https://www.youtube.com/watch?v=abcdefghijk');
  assert.equal(metadataSent.length,1);
  assert.deepEqual(metadataSent[0],{snippet:{title:'my-video',description:'',categoryId:'22'},status:{privacyStatus:'unlisted',embeddable:true,selfDeclaredMadeForKids:false}});
});
