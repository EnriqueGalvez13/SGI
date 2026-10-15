import { env } from 'cloudflare:workers';
type Runtime = Cloudflare.Env & { DB: D1Database; GEMINI_API_KEY?: string; GEMINI_MODEL?: string; REVIEW_ADMIN_EMAIL?: string };
export const runtime=()=>env as Runtime;
export const json=(data:unknown,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
export function isAdmin(req:Request) {const email=req.headers.get('oai-authenticated-user-email');return !!email&&!!runtime().REVIEW_ADMIN_EMAIL&&email.toLowerCase()===runtime().REVIEW_ADMIN_EMAIL!.toLowerCase();}
export async function body(req:Request){
 if(req.headers.get('origin')!==new URL(req.url).origin)throw new Error('ORIGIN');
 if(!req.headers.get('content-type')?.includes('application/json'))throw new Error('FORMAT');
 if(Number(req.headers.get('content-length')||0)>16000)throw new Error('SIZE');
 const reader=req.body?.getReader();if(!reader)throw new Error('FORMAT');const chunks:Uint8Array[]=[];let total=0;
 while(true){const {done,value}=await reader.read();if(done)break;total+=value.byteLength;if(total>16000){await reader.cancel();throw new Error('SIZE')}chunks.push(value)}
 const data=new Uint8Array(total);let offset=0;for(const chunk of chunks){data.set(chunk,offset);offset+=chunk.byteLength}return JSON.parse(new TextDecoder().decode(data));
}
export const clean=(x:unknown,max:number)=>typeof x==='string'?x.replace(/[\u0000-\u001f]/g,' ').trim().slice(0,max):'';
export async function allow(req:Request,kind:string,limit:number,global=false){
 const time=Date.now(),day=new Date(time).toISOString().slice(0,10);
 const who=global?'global':req.headers.get('cf-connecting-ip')||req.headers.get('oai-authenticated-user-id')||'anonymous';
 const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(who));const hash=Array.from(new Uint8Array(digest)).map(b=>b.toString(16).padStart(2,'0')).join('');
 const row=await runtime().DB.prepare('INSERT INTO rate_buckets (id,count,expires) VALUES (?,1,?) ON CONFLICT(id) DO UPDATE SET count=count+1 RETURNING count').bind(`${kind}:${day}:${hash}`,time+172800000).first<{count:number}>();
 await runtime().DB.prepare('DELETE FROM rate_buckets WHERE expires < ?').bind(time).run();return !!row&&row.count<=limit;
}
