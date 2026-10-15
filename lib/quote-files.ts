export type QuoteFile={key:string;name:string;size:number;type:string};
export async function boundedForm(req:Request){
 if(req.headers.get('origin')!==new URL(req.url).origin)throw Error('Solicitud inválida.');
 const max=16*1024*1024;if(Number(req.headers.get('content-length')||0)>max)throw Error('Los adjuntos exceden el límite permitido.');
 const reader=req.body?.getReader();if(!reader)throw Error('Formulario vacío.');let total=0;const chunks:Uint8Array[]=[];
 while(true){const {done,value}=await reader.read();if(done)break;total+=value.byteLength;if(total>max){await reader.cancel();throw Error('Máximo 3 archivos de 5 MB.')}chunks.push(value)}
 const bytes=new Uint8Array(total);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length}
 return new Request(req.url,{method:'POST',headers:{'Content-Type':req.headers.get('content-type')||''},body:bytes}).formData();
}
export async function validateFile(file:File){
 if(!file.size||file.size>5*1024*1024)throw Error('Cada archivo debe pesar entre 1 byte y 5 MB.');
 const name=file.name.replace(/[^\p{L}\p{N}._ ()-]/gu,'_').slice(-150),ext=name.split('.').pop()?.toLowerCase();
 const types:Record<string,string>={pdf:'application/pdf',dxf:'application/dxf',step:'model/step',stp:'model/step',jpg:'image/jpeg',jpeg:'image/jpeg',png:'image/png',webp:'image/webp'};
 if(!ext||!types[ext])throw Error('Usa PDF, DXF, STEP, JPG, PNG o WebP.');
 const bytes=new Uint8Array(await file.arrayBuffer()),head=new TextDecoder().decode(bytes.slice(0,4096));
 const valid=ext==='pdf'?head.startsWith('%PDF-'):ext==='dxf'?head.startsWith('AutoCAD Binary DXF')||/^\s*0\s+(SECTION|EOF)\b/i.test(head):['step','stp'].includes(ext)?/^\s*ISO-10303-21;/i.test(head):['jpg','jpeg'].includes(ext)?bytes[0]===255&&bytes[1]===216&&bytes[2]===255:ext==='png'?[137,80,78,71,13,10,26,10].every((v,i)=>bytes[i]===v):head.startsWith('RIFF')&&head.slice(8,12)==='WEBP';
 if(!valid)throw Error('El contenido de '+name+' no coincide con su formato.');return {bytes,name,type:types[ext]};
}
