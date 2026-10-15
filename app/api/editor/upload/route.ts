import {json,runtime} from '../../../../lib/api';
import {isEditor} from '../../../../lib/editor-auth';
export async function POST(req:Request){if(!await isEditor(req))return json({error:'Inicia sesión para subir imágenes.'},403);try{if(req.headers.get('origin')!==new URL(req.url).origin)return json({error:'Solicitud inválida'},400);
 const type=req.headers.get('content-type')?.split(';')[0];if(!['image/jpeg','image/png','image/webp'].includes(type||''))return json({error:'Usa JPG, PNG o WebP.'},400);
 if(Number(req.headers.get('content-length')||0)>5*1024*1024)return json({error:'Máximo 5 MB por imagen.'},413);
 const reader=req.body?.getReader();if(!reader)throw Error();let total=0;const chunks:Uint8Array[]=[];while(true){const r=await reader.read();if(r.done)break;total+=r.value.byteLength;if(total>5*1024*1024){await reader.cancel();return json({error:'Máximo 5 MB por imagen.'},413)}chunks.push(r.value)}
 const bytes=new Uint8Array(total);let offset=0;for(const x of chunks){bytes.set(x,offset);offset+=x.byteLength}const valid=type==='image/jpeg'?bytes[0]===255&&bytes[1]===216&&bytes[2]===255:type==='image/png'?[137,80,78,71,13,10,26,10].every((v,i)=>bytes[i]===v):String.fromCharCode(...bytes.slice(0,4))==='RIFF'&&String.fromCharCode(...bytes.slice(8,12))==='WEBP';if(!valid)return json({error:'El archivo no es una imagen válida.'},400);
 const id='m-'+crypto.randomUUID();await runtime().BUCKET.put('gallery/'+id,bytes,{httpMetadata:{contentType:type}});return json({id},201)
 }catch{return json({error:'No se pudo subir la imagen.'},400)}}
