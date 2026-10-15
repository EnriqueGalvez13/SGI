import {body,clean,json,runtime,allow,isAdmin} from '../../../lib/api';
import {isEditor} from '../../../lib/editor-auth';
import {boundedForm,validateFile,type QuoteFile} from '../../../lib/quote-files';
export async function GET(req:Request){if(!isAdmin(req)&&!await isEditor(req))return json({error:'Acceso reservado.'},403);const result=await runtime().DB.prepare('SELECT * FROM quotes ORDER BY created_at DESC LIMIT 200').all();return json({quotes:result.results.map((row:any)=>({...row,attachments:JSON.parse(row.attachments||'[]').map((file:QuoteFile,index:number)=>({name:file.name,size:file.size,url:'/api/quotes/'+row.id+'/files/'+index}))}))});}
export async function POST(req:Request){const saved:QuoteFile[]=[];try{
 let d:Record<string,any>,files:File[]=[];
 if(req.headers.get('content-type')?.startsWith('multipart/form-data')){const form=await boundedForm(req);d=Object.fromEntries(form);files=form.getAll('files').filter((x):x is File=>typeof x!=='string'&&x.size>0)}else d=await body(req);
 if(d.website)return json({ok:true});
 const email=clean(d.email,254);if(typeof d.email!=='string'||d.email.length>254||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||email.includes(' '))return json({error:'Escribe un correo electrónico válido.'},400);
 const id=clean(d.id,36),company=clean(d.company,120),phone=clean(d.phone,30),service=clean(d.service,100),message=clean(d.message,3000);
 if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(id)||company.length<2||phone.replace(/\D/g,'').length<10||!service||message.length<10)return json({error:'Revisa los datos de tu solicitud.'},400);
 if(files.length>3||files.reduce((sum,file)=>sum+file.size,0)>15*1024*1024)return json({error:'Máximo 3 archivos y 15 MB en total.'},400);
 if(await runtime().DB.prepare('SELECT id FROM quotes WHERE id=?').bind(id).first())return json({ok:true});
 if(!await allow(req,'quote',5)||!await allow(req,'quote-global',200,true))return json({error:'Límite de solicitudes alcanzado. Contáctanos por teléfono.'},429);
 const validated=[];for(const file of files)validated.push(await validateFile(file));
 for(const file of validated){const key='quotes/'+id+'/'+crypto.randomUUID();await runtime().BUCKET.put(key,file.bytes,{httpMetadata:{contentType:file.type}});saved.push({key,name:file.name,size:file.bytes.length,type:file.type})}
 await runtime().DB.prepare('INSERT INTO quotes (id,company,phone,service,message,created_at,attachments,email) VALUES (?,?,?,?,?,?,?,?)').bind(id,company,phone,service,message,new Date().toISOString(),JSON.stringify(saved),email).run();return json({ok:true},201);
 }catch(error){await Promise.allSettled(saved.map(file=>runtime().BUCKET.delete(file.key)));return json({error:error instanceof Error&&/archivo|adjunto|formato|PDF|MB|contenido/i.test(error.message)?error.message:'No se guardó tu solicitud. Intenta de nuevo o usa WhatsApp.'},400)}}
