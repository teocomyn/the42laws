import http from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import {watch} from 'node:fs';
import {resolve,extname,relative,sep} from 'node:path';
import {build,root} from './build-atlas.mjs';
await build();
const port=Number(process.env.PORT||4242);
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.png':'image/png','.ico':'image/x-icon','.svg':'image/svg+xml','.md':'text/plain; charset=utf-8'};
const server=http.createServer(async(req,res)=>{try{const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname),file=resolve(root,'.'+pathname),rel=relative(root,file);if(rel.startsWith('..'+sep)||rel.split(sep).some(p=>p.startsWith('.')||p==='node_modules')){res.writeHead(403).end('Forbidden');return;}const target=/^\/dossiers\/(?:[1-9]|[1-3][0-9]|4[0-2])?\/?(?:index\.html)?$/.test(pathname)?resolve(root,'index.html'):(await stat(file)).isDirectory()?resolve(file,'index.html'):file;res.writeHead(200,{'Content-Type':mime[extname(target)]||'application/octet-stream','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(await readFile(target));}catch{res.writeHead(404).end('Not found');}});
server.on('error',err=>{console.error(err.code==='EADDRINUSE'?`Port ${port} already in use. Open the existing server or run PORT=4243 npm run dev.`:err.message);process.exit(1);});
server.listen(port,'127.0.0.1',()=>console.log(`The42laws: http://127.0.0.1:${port}/`));
let timer;function rebuild(){clearTimeout(timer);timer=setTimeout(()=>build().then(()=>console.log('Research rebuilt. Refresh your browser.')).catch(console.error),200);}
for(const dir of ['questions','content','sources'])watch(resolve(root,dir),rebuild);
watch(resolve(root,'METHODE.md'),rebuild);
