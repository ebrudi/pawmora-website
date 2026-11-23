const host='pawmora-website.pages.dev';
const choices=['lake','fashion','home','festival'];
const reply=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
async function key(secret,value){const e=new TextEncoder();const k=await crypto.subtle.importKey('raw',e.encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign']);return Array.from(new Uint8Array(await crypto.subtle.sign('HMAC',k,e.encode(value))),x=>x.toString(16).padStart(2,'0')).join('')}
export async function onRequest({request,env}){
if(new URL(request.url).hostname!==host)return reply({error:'host'},403);
if(env.COMMUNITY_ENABLED!=='true'||!env.DB||!env.TURNSTILE_SECRET||!env.TURNSTILE_SITEKEY)return reply({error:'disabled'},503);
try{
const settings=await env.DB.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='community_settings'").first();
const votingOpen=!settings||(await env.DB.prepare("SELECT value FROM community_settings WHERE name='voting_open'").first())?.value!=='false';
if(request.method==='GET'){const r=await env.DB.prepare('SELECT choice, COUNT(*) AS n FROM votes GROUP BY choice').all();return reply({sitekey:env.TURNSTILE_SITEKEY,votingOpen,counts:Object.fromEntries(r.results.map(x=>[x.choice,x.n]))});}
if(request.method!=='POST')return reply({error:'method'},405);
if(request.headers.get('Origin')!=='https://'+host||!request.headers.get('Content-Type')?.startsWith('application/json'))return reply({error:'origin'},403);
const reader=request.body?.getReader();if(!reader)return reply({error:'body'},400);let size=0,parts=[];while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>8192){await reader.cancel();return reply({error:'size'},413)}parts.push(value)}const bytes=new Uint8Array(size);let pos=0;for(const p of parts){bytes.set(p,pos);pos+=p.length}let d;try{d=JSON.parse(new TextDecoder().decode(bytes))}catch{return reply({error:'json'},400)}
if(!d||typeof d.token!=='string'||d.token.length>2048||!d.token||!['vote','idea'].includes(d.type))return reply({error:'input'},400);
if(d.type==='vote'&&!votingOpen)return reply({error:'voting_closed'},409);
if(d.type==='vote'&&!choices.includes(d.choice))return reply({error:'choice'},400);
if(d.type==='idea'&&(typeof d.message!=='string'||!d.message.trim()||d.message.trim().length>500))return reply({error:'message'},400);
const ip=request.headers.get('CF-Connecting-IP');if(!ip)return reply({error:'network'},403);
const verification=await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify',{method:'POST',body:new URLSearchParams({secret:env.TURNSTILE_SECRET,response:d.token,remoteip:ip})});const v=await verification.json();if(!v.success||v.hostname!==host)return reply({error:'verification'},403);
const day=new Date().toISOString().slice(0,10);const id=await key(env.TURNSTILE_SECRET,'network:'+ip);
const stmt=d.type==='vote'?env.DB.prepare('INSERT OR IGNORE INTO votes(id,choice) VALUES (?,?)').bind(id,d.choice):env.DB.prepare('INSERT OR IGNORE INTO ideas(id,day,message) VALUES (?,?,?)').bind(id,day,d.message.trim());
const result=await stmt.run();if(!result.meta.changes)return reply({error:'duplicate'},409);return reply({ok:true});
}catch{return reply({error:'unavailable'},503)}
}