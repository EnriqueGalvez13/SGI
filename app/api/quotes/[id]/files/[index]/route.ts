import {isAdmin,json,runtime} from '../../../../../../lib/api';
import {isEditor} from '../../../../../../lib/editor-auth';
import type {QuoteFile} from '../../../../../../lib/quote-files';
export async function GET(req:Request,{params}:{params:Promise<{id:string;index:string}>}){
 if(!isAdmin(req)&&!await isEditor(req))return json({error:'Acceso reservado.'},403);
 const {id,index}=await params;if(!/^[0-9a-f-]{36}$/.test(id)||!/^\d$/.test(index))return json({error:'No encontrado.'},404);
 const row=await runtime().DB.prepare('SELECT attachments FROM quotes WHERE id=?').bind(id).first<{attachments:string}>();const files:QuoteFile[]=JSON.parse(row?.attachments||'[]');const file=files[Number(index)];if(!file)return json({error:'No encontrado.'},404);
 const object=await runtime().BUCKET.get(file.key);if(!object)return json({error:'No encontrado.'},404);
 return new Response(object.body,{headers:{'Content-Type':file.type,'Content-Disposition':"attachment; filename*=UTF-8''"+encodeURIComponent(file.name),'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff','Content-Security-Policy':"sandbox; default-src 'none'"}});
}
