import {json,runtime,body} from '../../../lib/api';
import {isEditor} from '../../../lib/editor-auth';
const empty={texts:{},hidden:[],removed:[],gallery:[]};
export async function GET(){const row=await runtime().DB.prepare('SELECT payload,revision FROM site_state WHERE id=?').bind('content').first<{payload:string;revision:number}>();return json(row?{content:JSON.parse(row.payload),revision:row.revision}:{content:empty,revision:0})}
export async function POST(req:Request){if(!await isEditor(req))return json({error:'Inicia sesión para editar.'},403);try{const data=await body(req,128000),c=data.content;
 if(!c||typeof c.texts!=='object'||Array.isArray(c.texts)||!Number.isInteger(data.revision)||data.revision<0)throw Error();
 const texts:Record<string,string>={};for(const [k,v] of Object.entries(c.texts)){if(!/^(es|en):t\d{3}$/.test(k)||typeof v!=='string'||v.length>1800)throw Error();texts[k]=v}if(Object.keys(texts).length>600)throw Error();
 const sections=['inicio','servicios','marcas','trabajos','opiniones','nosotros','certificados','ubicacion','contacto'];const hidden=c.hidden;if(!Array.isArray(hidden)||hidden.some((x:any)=>!sections.includes(x))||hidden.length>9)throw Error();
 const removed=c.removed;if(!Array.isArray(removed)||removed.length>100||removed.some((x:any)=>typeof x!=='string'||!/^base-[1-6]$/.test(x)))throw Error();
 if(!Array.isArray(c.gallery)||c.gallery.length>30)throw Error();const ids=new Set();const gallery=c.gallery.map((x:any)=>{if(typeof x.id!=='string'||!/^m-[a-f0-9-]{36}$/.test(x.id)||ids.has(x.id)||typeof x.title!=='string'||x.title.length>120||typeof x.titleEn!=='string'||x.titleEn.length>120)throw Error();ids.add(x.id);return {id:x.id,title:x.title,titleEn:x.titleEn}});
 const payload=JSON.stringify({texts,hidden:[...new Set(hidden)],removed:[...new Set(removed)],gallery});const row=await runtime().DB.prepare('INSERT INTO site_state(id,payload,revision) VALUES (?,?,1) ON CONFLICT(id) DO UPDATE SET payload=excluded.payload,revision=site_state.revision+1 WHERE site_state.revision=? RETURNING revision').bind('content',payload,data.revision).first<{revision:number}>();
 if(!row)return json({error:'La página cambió en otra ventana. Recarga antes de guardar.'},409);return json({ok:true,revision:row.revision})
 }catch{return json({error:'Contenido inválido o demasiado largo.'},400)}}
