import assert from 'node:assert/strict';
import {test} from 'node:test';
import {loadImageConfig,r2ImageURL,uploadR2Image} from '../src/r2-images.js';
const publicURL='https://pub-fixture.r2.dev/images/'+ 'a'.repeat(32)+'.png';
const uploadURL='https://'+ 'a'.repeat(32)+'.r2.cloudflarestorage.com/bucket/images/image.png?signature=fixture';
test('only the configured image origin is rendered and signed URLs never become page references',async()=>{
  await loadImageConfig(async()=>({ok:true,json:async()=>({configured:true,imageBaseURL:'https://pub-fixture.r2.dev'})}));
  assert.equal(r2ImageURL(publicURL),publicURL);
  for(const url of ['https://other.example/images/'+ 'a'.repeat(32)+'.png',publicURL+'?token=secret',publicURL.replace('.png','.svg'),uploadURL]) assert.equal(r2ImageURL(url),null);
  const calls=[];const file=new Blob(['png'],{type:'image/png'});
  const result=await uploadR2Image(file,'owner-csrf',new AbortController().signal,async(url,options)=>{
    calls.push({url,options});return options.method==='POST'?{ok:true,json:async()=>({uploadURL,publicURL})}:{ok:true};
  });
  assert.equal(result,publicURL);
  assert.equal(calls[0].options.body.get('csrf'),'owner-csrf');
  assert.equal(calls[1].options.method,'PUT');
  assert.equal(calls[1].options.body,file);
  assert.equal(calls[1].options.redirect,'error');
});
test('upload failures preserve failure instead of returning an unusable remote reference',async()=>{
  const file=new Blob(['png'],{type:'image/png'});
  await assert.rejects(uploadR2Image(file,'csrf',new AbortController().signal,async(url,options)=>options.method==='POST'?{ok:true,json:async()=>({uploadURL,publicURL})}:{ok:false,status:403}),/403/);
});
