import {isAdmin} from '../../lib/api';
import html from '../../lib/admin.html?raw';
export function GET(req:Request){if(!isAdmin(req))return new Response('Acceso reservado al propietario de SGI. Inicia sesión con la cuenta propietaria.',{status:403,headers:{'Content-Type':'text/plain; charset=utf-8','Cache-Control':'no-store'}});return new Response(html,{headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'}});}
