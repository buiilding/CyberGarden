import {test} from 'node:test';
import assert from 'node:assert/strict';
import {CloudPages} from '../src/cloud-pages.js';
const reply = value=>({ok:true,json:async()=>value});
test('default requests preserve the browser fetch receiver for loading and saving',async t=>{
  const calls=[];
  t.mock.method(globalThis,'fetch',function(path,options){
    assert.equal(this,globalThis,'native fetch must receive its global receiver');
    calls.push(path);
    return Promise.resolve(reply(options?.method ? {_revision:1} : {cloud:true,pages:[]}));
  });
  const store=new CloudPages(undefined,()=> 'csrf');
  await store.load();
  await store.save({id:'note',title:'Hi',markdown:'Saved'});
  assert.deepEqual(calls,['/api/pages','/api/pages']);
});
test('cloud writes coalesce and keep the latest text with the current server revision',async()=>{
  const calls=[];
  const store=new CloudPages(async(path,options)=>{
    if(!options?.method) return reply({cloud:true,pages:[{id:'note',_revision:5}]});
    const page=JSON.parse(options.body.get('document'));calls.push(page);
    return reply({...page,_revision:page._revision+1});
  },()=> 'csrf');
  await store.load();
  const first=store.save({id:'note',title:'Hi',markdown:'first'});
  const last=store.save({id:'note',title:'Hi',markdown:'last'});
  await Promise.all([first,last]);
  assert.equal(calls.length,1);assert.equal(calls[0].markdown,'last');assert.equal(calls[0]._revision,5);
  await store.save({id:'note',title:'Hi',markdown:'next'});
  assert.equal(calls[1]._revision,6);
});
test('conflicts stop further writes rather than replacing changes from another device',async()=>{
  let calls=0;
  const store=new CloudPages(async()=>{calls++;return {ok:false,json:async()=>({error:'Conflict: reload'})};},()=> 'csrf');
  await assert.rejects(store.save({id:'note',title:'Hi',markdown:'mine'}),/Conflict/);
  await assert.rejects(store.save({id:'note',title:'Hi',markdown:'still mine'}),/Conflict/);
  assert.equal(calls,1);
});
