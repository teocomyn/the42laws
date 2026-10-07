// Recharge data.js puis les fichiers de contenu atlas/dossiers/<id>.js, comme le navigateur.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
function loadAtlasData(){
 const context={window:{}};
 vm.runInNewContext(fs.readFileSync(path.join(root,'atlas/data.js'),'utf8'),context);
 const dir=path.join(root,'atlas/dossiers');
 for(const file of fs.readdirSync(dir).filter(f=>f.endsWith('.js')))vm.runInNewContext(fs.readFileSync(path.join(dir,file),'utf8'),context);
 const data=JSON.parse(JSON.stringify(context.window.ATLAS_DATA)),store=JSON.parse(JSON.stringify(context.window.ATLAS_DOSSIERS||{}));
 for(const q of data.questions)Object.assign(q,store[q.id]||{});
 return data;
}
module.exports={loadAtlasData};
