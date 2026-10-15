import {json,runtime,body,clean,allow} from '../../../lib/api';
export async function GET(){try{
 const db=runtime().DB;
 const list=await db.prepare("SELECT id,name,company,service,rating,body,created_at,public_email FROM reviews WHERE status='approved' ORDER BY created_at DESC LIMIT 50").all();
 const summary=await db.prepare("SELECT COUNT(*) AS total,ROUND(AVG(rating),1) AS average FROM reviews WHERE status='approved'").first();
 return json({reviews:list.results,summary});
}catch{return json({error:'No pudimos cargar las reseñas. Intenta más tarde.'},503)}}
export async function POST(req:Request){try{
 const d=await body(req);if(d.website)return json({error:'No se pudo enviar.'},400);
 const name=clean(d.name,80),company=clean(d.company,100),service=clean(d.service,80),text=clean(d.body,1200),rating=d.rating,id=clean(d.id,60);
 const email=clean(d.email,150);if(email&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))return json({error:'Revisa el correo electrónico.'},400);
 if(name.length<2||text.length<10||!service||!Number.isInteger(rating)||rating<1||rating>5||d.consent!==true||!/^[0-9a-f-]{36}$/.test(id))return json({error:'Revisa los campos y selecciona una calificación.'},400);
 const existing=await runtime().DB.prepare('SELECT id FROM reviews WHERE id=?').bind(id).first();if(existing)return json({ok:true});
 if(!await allow(req,'review',3))return json({error:'Ya recibimos varias reseñas hoy. Intenta mañana.'},429);
 await runtime().DB.prepare('INSERT INTO reviews (id,name,company,service,rating,body,status,created_at,public_email) VALUES (?,?,?,?,?,?,?,?,?)').bind(id,name,company,service,rating,text,'pending',new Date().toISOString(),email).run();
 return json({ok:true,message:'Gracias. Tu reseña fue recibida y se publicará después de su revisión.'},201);
}catch{return json({error:'No se pudo enviar la reseña. Intenta de nuevo más tarde.'},400)}}
