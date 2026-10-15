import {isAdmin,json,runtime,body} from '../../../../lib/api';
import {isEditor} from '../../../../lib/editor-auth';
export async function GET(req:Request){if(!isAdmin(req)&&!await isEditor(req))return json({error:'Acceso reservado al administrador.'},403);
 const result=await runtime().DB.prepare("SELECT * FROM reviews ORDER BY CASE status WHEN 'pending' THEN 0 ELSE 1 END,created_at DESC LIMIT 200").all();return json({reviews:result.results});}
export async function POST(req:Request){if(!isAdmin(req)&&!await isEditor(req))return json({error:'Acceso reservado al administrador.'},403);
 try{const d=await body(req);if(!['approved','rejected','pending'].includes(d.status)||typeof d.id!=='string')return json({error:'Solicitud inválida'},400);
 await runtime().DB.prepare('UPDATE reviews SET status=? WHERE id=?').bind(d.status,d.id).run();return json({ok:true});}catch{return json({error:'No se guardó el cambio'},400)}}
