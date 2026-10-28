// Hosted page authority. The browser keeps local drafts separately for recovery.
export class CloudPages {
  constructor(request = (...args) => globalThis.fetch(...args), csrf = () => document.querySelector('#sign-out-csrf')?.value || '') {
    this.request = request; this.csrf = csrf; this.enabled = false;
    this.revisions = new Map(); this.jobs = new Map(); this.blocked = new Map();
  }
  async load() {
    const response = await this.request('/api/pages', {cache:'no-store'});
    if (!response.ok) throw new Error('Cloud pages could not load. Your local content has been kept.');
    const result = await response.json(); this.enabled = result.cloud === true;
    for (const page of result.pages) this.revisions.set(page.id, page._revision);
    return result;
  }
  async post(path, value) {
    const response = await this.request(path, {method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},
      body:new URLSearchParams({csrf:this.csrf(),document:JSON.stringify(value)})});
    const result = await response.json().catch(()=>({}));
    if (!response.ok) throw new Error(result.error || 'Could not save to Supabase. Keep this tab open and export your page.');
    return result;
  }
  save(document) {
    if (this.blocked.has(document.id)) return Promise.reject(this.blocked.get(document.id));
    let job = this.jobs.get(document.id);
    if (!job) { job = {waiting:[],running:false}; this.jobs.set(document.id,job); }
    job.latest = structuredClone(document);
    const promise = new Promise((resolve,reject)=>job.waiting.push({resolve,reject}));
    if (!job.running) { clearTimeout(job.timer); job.timer = setTimeout(()=>this.drain(document.id,job),300); }
    return promise;
  }
  async drain(id,job) {
    if (job.running) return;
    job.running = true;
    while (job.latest) {
      const document = job.latest, waiting = job.waiting; job.latest = null; job.waiting = [];
      try {
        const result = await this.post('/api/pages',{...document,_revision:this.revisions.get(id)||0});
        this.revisions.set(id,result._revision); waiting.forEach(w=>w.resolve(result));
      } catch (error) {
        // Stop after conflicts/network ambiguity; retrying could overwrite a newer version.
        this.blocked.set(id,error); waiting.concat(job.waiting).forEach(w=>w.reject(error));
        job.latest = null; job.waiting=[];
      }
    }
    job.running = false; this.jobs.delete(id);
  }
  async import(pages) {
    const result = await this.post('/api/import',pages);
    for (const page of result) this.revisions.set(page.id,page._revision);
    return result;
  }
}
