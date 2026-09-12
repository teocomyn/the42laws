import test from 'node:test';
import assert from 'node:assert/strict';
import {build} from 'esbuild';
import vm from 'node:vm';
const bundled=await build({entryPoints:['components/ui/black-hole-utils/renderer.ts'],bundle:true,format:'cjs',write:false,platform:'browser'});
function harness(){
 let contexts=0,disconnected=0; const errors=[];
 class Events{listeners=new Map();addEventListener(t,f){this.listeners.set(t,f);}removeEventListener(t,f){if(this.listeners.get(t)===f)this.listeners.delete(t);}}
 const canvas=new Events();canvas.getContext=()=>{contexts++;return null;};
 const doc=new Events(), media=new Events();media.matches=false;
 class Observer{observe(){}disconnect(){disconnected++;}}
 const sandbox={module:{exports:{}},ResizeObserver:Observer,IntersectionObserver:Observer,matchMedia:()=>media,document:doc,cancelAnimationFrame(){},requestAnimationFrame(){throw Error('Cannot animate without WebGL');}};
 vm.runInNewContext(bundled.outputFiles[0].text,sandbox);
 return {create:()=>sandbox.module.exports.createRenderer({canvas,onError:m=>errors.push(m)}),errors,canvas,doc,media,get contexts(){return contexts;},get disconnected(){return disconnected;}};
}
test('WebGL failure reports a fallback and disposal removes observers and listeners',async()=>{
 const h=harness(),r=h.create();await assert.rejects(r.ready);
 assert.equal(h.errors.length,1);assert.match(h.errors[0],/illustration fixe/);
 r.dispose();r.dispose();assert.equal(h.disconnected,2);
 assert.equal(h.canvas.listeners.size+h.doc.listeners.size+h.media.listeners.size,0);
});
test('unmount before readiness cannot allocate a GPU context or update an unmounted component',async()=>{
 const h=harness(),r=h.create();r.dispose();await r.ready;
 assert.equal(h.contexts,0);assert.equal(h.errors.length,0);assert.equal(h.disconnected,2);
});
