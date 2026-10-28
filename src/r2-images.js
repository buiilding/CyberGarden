let config = {configured:false,imageBaseURL:'',maxImageBytes:40*1024*1024};
export async function loadImageConfig(request = fetch) {
  const response = await request('/media/config', {cache:'no-store'});
  if (!response.ok) throw new Error('Could not load image storage configuration.');
  const result = await response.json();
  const base = result.imageBaseURL ? new URL(result.imageBaseURL) : null;
  if (base && (base.protocol !== 'https:' || base.username || base.password || base.pathname !== '/' || base.search || base.hash)) throw new Error('Invalid image storage origin.');
  config = {configured: result.configured === true, imageBaseURL: base?.origin || '', maxImageBytes: result.maxImageBytes || 40*1024*1024};
}
export function r2ImageURL(value) {
  if (!config.imageBaseURL) return null;
  try {
    const url = new URL(value);
    return url.origin === config.imageBaseURL && !url.username && !url.password && !url.search && !url.hash && /^\/images\/[a-f0-9]{32}\.(png|jpg|gif|webp|avif)$/.test(url.pathname) ? url.href : null;
  } catch { return null; }
}
export async function uploadR2Image(file, csrf, signal, request = fetch) {
  if (!config.configured) throw new Error('Cloudflare R2 image storage needs setup. See README.md.');
  const signed = await request('/media/image-upload', {
    method:'POST', headers:{'Content-Type':'application/x-www-form-urlencoded'}, signal,
    body:new URLSearchParams({csrf,type:file.type,size:String(file.size)}),
  });
  const result = await signed.json().catch(()=>({}));
  if (!signed.ok) throw new Error(result.error || 'Could not prepare image upload.');
  const publicURL = r2ImageURL(result.publicURL);
  const target = new URL(result.uploadURL);
  if (!publicURL || target.protocol !== 'https:' || !/^[a-f0-9]{32}\.r2\.cloudflarestorage\.com$/.test(target.hostname) || target.username || target.password) throw new Error('Invalid image upload destination.');
  const response = await request(result.uploadURL, {method:'PUT',headers:{'Content-Type':file.type},body:file,signal,redirect:'error'});
  if (!response.ok) throw new Error(`Image upload failed (${response.status}). Retry to send it again.`);
  return publicURL;
}
