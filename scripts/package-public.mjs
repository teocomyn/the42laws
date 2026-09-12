import {mkdir,rm} from 'node:fs/promises';
import {resolve} from 'node:path';
import {execFileSync} from 'node:child_process';
import {buildPublic} from './build-public.mjs';
import {root} from './build-atlas.mjs';
const {out}=await buildPublic();await mkdir(resolve(root,'artifacts'),{recursive:true});
const archive=resolve(root,'artifacts/the42laws-v2-public.zip');await rm(archive,{force:true});
execFileSync('/usr/bin/zip',['-q','-r',archive,'.','-x','.the42laws-build'],{cwd:out});
console.log('Publication bundle: '+archive);
