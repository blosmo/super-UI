import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
const exec=promisify(execFile), catalog=JSON.parse(fs.readFileSync('src/data/catalog.json'));
const manifest={imports:[],dependencies:[],covered:[],blocked:[]}, deps=new Set(), seen=new Map();
function save(file,s,original,url,lib,name){if(!fs.existsSync(file)){fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,s)}manifest.imports.push({library:lib,name,url,file,sha256:createHash('sha256').update(original).digest('hex'),modifications:'Import aliases only',dependencies:[]})}
async function get(url){return (await exec('curl',['-fsSL','--max-time','40','--retry','2',url],{maxBuffer:20e6})).stdout}
function rewrite(s,lib){return s.replaceAll('from "cn"', 'from "@/vendor/'+lib+'/lib/utils"').replaceAll('@/registry/new-york-v4/','@/vendor/shadcn/').replaceAll('@/registry/default/','@/vendor/'+lib+'/').replaceAll('@/components/','@/vendor/'+lib+'/components/').replaceAll('@/hooks/','@/vendor/'+lib+'/hooks/').replaceAll('@/lib/','@/vendor/'+lib+'/lib/')}
async function registry(lib,name){let key=lib+':'+name;if(seen.has(key))return seen.get(key);const work=(async()=>{let url=lib==='shadcn'?`https://ui.shadcn.com/r/styles/new-york-v4/${name}.json`:`https://www.${lib==='rare'?'rareui.com':'interior.dev'}/r/${name}.json`;let d=JSON.parse(await get(url));for(let dep of d.dependencies||[])deps.add(dep);for(let f of d.files||[]){if(!f.content)continue;let p=f.target||f.path;if(lib==='interior')p='components/'+name+'.tsx';if(lib==='shadcn')p=p.replace(/^registry\/new-york-v4\//,'');save('src/vendor/'+lib+'/'+p,rewrite(f.content,lib),f.content,url,lib,name)}await Promise.all((d.registryDependencies||[]).filter(x=>!x.startsWith('http')).map(n=>registry(lib,n)));return d;})();seen.set(key,work);return work}
let entries=catalog.filter(x=>['interior','rare','shadcn'].includes(x.library));
for(let i=0;i<entries.length;i+=8)await Promise.all(entries.slice(i,i+8).map(async e=>{try{if(e.library==='shadcn'){let n=({toast:'sonner-demo','date-picker':'date-picker-demo',typography:'typography-demo',chart:'chart-bar-default'})[e.slug]||e.slug+'-demo';await registry(e.library,n)}else await registry(e.library,e.slug);console.log('OK',e.id)}catch(err){manifest.blocked.push({id:e.id,reason:err.message.slice(0,250)});console.log('FAIL',e.id)}}));
manifest.dependencies=[...deps];fs.mkdirSync('src/data/integrations',{recursive:true});fs.writeFileSync('src/data/integrations/foundations.json',JSON.stringify(manifest,null,2));
// Official source demonstrations.
const mappings=[];
for(let i=0;i<entries.length;i+=8)await Promise.all(entries.slice(i,i+8).map(async e=>{if(e.library==='shadcn')return;try {if(e.slug==='utils')return;let remote=e.library==='interior'?`lib/demos/${e.slug}-demo.tsx`:`app/components/(docs)/${e.slug==='scroll-progress'?'scrollprogressindicator':e.slug.replaceAll('-','')}/demo.tsx`;let url=`https://raw.githubusercontent.com/${e.library==='interior'?'ddoemonn/interior':'swamimalode07/rare-ui'}/main/${remote}`;let raw=await get(url);let s=rewrite(raw,e.library).replaceAll('@/vendor/interior/components/interior/','@/vendor/interior/components/').replaceAll('"/demo/','"https://www.interior.dev/demo/');let file=`src/vendor/${e.library}/demos/${e.slug}.tsx`;save(file,s,raw,url,e.library,e.slug+'-demo');mappings.push({id:e.id,file,export:raw.includes('export default')?'default':raw.match(/export function (\w+)/)?.[1]});}catch(err){console.log('DEMOFAIL',e.id,err.message.slice(0,100))}}));
fs.writeFileSync('/tmp/foundation-demo-mappings.json',JSON.stringify(mappings,null,2));
fs.writeFileSync('src/data/integrations/foundations.json',JSON.stringify(manifest,null,2));
for(const remote of ['components/preview/ColorSwatches.tsx','components/preview/PreviewControls.tsx','lib/use-media-query.ts','app/components/(docs)/gooeynav/icons.tsx']){let url=`https://raw.githubusercontent.com/swamimalode07/rare-ui/main/${remote}`;let raw=await get(url);save('src/vendor/rare/'+(remote.includes('icons.tsx')?'demos/icons.tsx':remote),rewrite(raw,'rare'),raw,url,'rare',path.basename(remote))}
for(const [url,file] of [['https://ui.shadcn.com/r/styles/new-york/data-table-demo.json','src/vendor/shadcn/examples/data-table-stable-demo.tsx'],['https://ui.shadcn.com/r/styles/new-york-v4/direction.json','src/vendor/shadcn/ui/direction.tsx']]){let d=JSON.parse(await get(url)),raw=d.files[0].content;save(file,rewrite(raw,'shadcn').replaceAll('@/registry/new-york/','@/vendor/shadcn/'),raw,url,'shadcn',d.name)}
// Retain the upstream v9 table example as an unused reference without type-checking it.
if(fs.existsSync('src/vendor/shadcn/examples/data-table-demo.tsx'))fs.renameSync('src/vendor/shadcn/examples/data-table-demo.tsx','src/vendor/shadcn/examples/data-table-demo.tsx.txt');
manifest.imports=manifest.imports.map(x=>x.file==='src/vendor/shadcn/examples/data-table-demo.tsx'?{...x,file:x.file+'.txt'}:x);
manifest.dependencies=[...new Set([...deps].filter(x=>x!=='cn').concat(['@tanstack/react-table@^8','@types/flubber','@squircle-js/react']))];
fs.writeFileSync('src/data/integrations/foundations.json',JSON.stringify(manifest,null,2));

// Resolve source dependencies that the upstream example registry does not declare.
await registry('shadcn','sidebar');await registry('shadcn','use-mobile');
for(const remote of ['lib/components.ts','components/Description/icons.tsx']){const url='https://raw.githubusercontent.com/swamimalode07/rare-ui/main/'+remote;const raw=await get(url);save('src/vendor/rare/'+remote,rewrite(raw,'rare'),raw,url,'rare',remote)}
const prior=JSON.parse(fs.readFileSync('src/data/imports.json','utf8'));manifest.imports=manifest.imports.map(x=>prior.find(y=>y.file===x.file)||x);manifest.covered=entries.map(x=>x.id);manifest.blocked=[];fs.writeFileSync('src/data/integrations/foundations.json',JSON.stringify(manifest,null,2));

// Refresh the lazy preview map after acquisition.
{
let catalog=JSON.parse(fs.readFileSync('src/data/catalog.json')).filter(x=>['interior','rare','shadcn'].includes(x.library)),m=JSON.parse(fs.readFileSync('/tmp/foundation-demo-mappings.json'));
let files=fs.readdirSync('src/vendor/shadcn',{recursive:true}).filter(x=>/\.tsx$/.test(x));
for(let e of catalog.filter(x=>x.library==='shadcn'&&x.slug!=='direction')){let n=({toast:'sonner-demo','data-table':'data-table-stable-demo',chart:'chart-bar-default'})[e.slug]||e.slug+'-demo';let f=files.find(f=>f.endsWith('/'+n+'.tsx'));if(!f){console.log('MISSING',e.id);continue}let raw=fs.readFileSync('src/vendor/shadcn/'+f,'utf8');m.push({id:e.id,file:'src/vendor/shadcn/'+f,export:raw.includes('export default')?'default':raw.match(/export function (\w+)/)?.[1]})}
let s=`import { lazy, type ComponentType } from 'react';\nimport { Toaster } from '../vendor/shadcn/ui/sonner';\nimport { DirectionProvider } from '../vendor/shadcn/ui/direction';\nimport { PreviewControlsProvider } from '../vendor/rare/components/preview/PreviewControls';\nimport { cn } from '../vendor/rare/lib/utils';\n`;
s+=m.map((x,i)=>`const Demo${i}=lazy(()=>import('../${x.file.replace('src/','').replace(/\.tsx$/,'')}').then(m=>({default:m.${x.export}})));`).join('\n');
s+=`\nexport const previews: Record<string,ComponentType<{dark?:boolean}>>={\n`;
s+=m.map((x,i)=>JSON.stringify(x.id)+': '+(x.id.includes('sonner')||x.id==='shadcn:toast'?`()=><><Demo${i}/><Toaster/></>`:`Demo${i}`)).join(',\n');
s+=`,\n'rare:utils':()=> <div className="space-y-3 text-sm"><p>Class name utility</p><code>{cn('px-2 bg-stone-100','px-4 rounded-lg')}</code><p>Combines conditional classes and resolves Tailwind conflicts.</p></div>,\n'shadcn:direction':()=> <DirectionProvider dir="rtl"><div dir="rtl" className="flex gap-4 rounded-lg border p-6"><span>مرحبا</span><span>العالم</span></div></DirectionProvider>\n};\n`;
fs.mkdirSync('src/previews',{recursive:true});fs.writeFileSync('src/previews/foundations.tsx',s);
let manifest=JSON.parse(fs.readFileSync('src/data/integrations/foundations.json'));manifest.covered=catalog.map(e=>e.id);manifest.blocked=[];fs.writeFileSync('src/data/integrations/foundations.json',JSON.stringify(manifest,null,2));

}

let previewSource=fs.readFileSync('src/previews/foundations.tsx','utf8');
previewSource=previewSource.replace(/("(?:rare|shadcn):[^"\n]+": )Demo(\d+)/g,(_,key,n)=>key+(key.startsWith('"rare')?`()=><PreviewControlsProvider><Demo${n}/></PreviewControlsProvider>`:`()=><Demo${n}/>`));
fs.writeFileSync('src/previews/foundations.tsx',previewSource);

// react-day-picker current public API renamed initialFocus to autoFocus.
{const file='src/vendor/shadcn/examples/date-picker-demo.tsx';fs.writeFileSync(file,fs.readFileSync(file,'utf8').replace('          initialFocus','          autoFocus'));const p='src/data/integrations/foundations.json';const m=JSON.parse(fs.readFileSync(p));for(const x of m.imports)if(x.file===file){x.modifications='Import aliases; DayPicker current API compatibility: initialFocus renamed to autoFocus (same focus-on-mount behavior)';x.outputSha256=createHash('sha256').update(fs.readFileSync(file)).digest('hex')}fs.writeFileSync(p,JSON.stringify(m,null,2));}

// Maintain explicit original source associations for the source drawer.
{
const file='src/previews/foundations.tsx';
let source=fs.readFileSync(file,'utf8');
source=source.replace(/("shadcn:(?:toast|sonner)": )\(\)=>/g,'$1({dark})=>').replaceAll('<Toaster/>','<Toaster theme={dark ? "dark" : "light"}/>');
fs.writeFileSync(file,source);
const imports=new Map([...source.matchAll(/const Demo(\d+)=lazy\(\(\)=>import\('([^']+)'\)/g)].map(m=>[m[1],path.normalize(path.join('src/previews',m[2]))+'.tsx']));
const manifestFile='src/data/integrations/foundations.json',manifest=JSON.parse(fs.readFileSync(manifestFile));
const known=new Set(manifest.imports.map(x=>x.file));
manifest.entrySources={};
for(const id of manifest.covered){const line=source.split('\n').find(line=>line.startsWith(JSON.stringify(id)+':'));const number=line?.match(/<Demo(\d+)/)?.[1]||line?.match(/: Demo(\d+)/)?.[1];const demo=number!==undefined?imports.get(number):undefined;const roots=demo?[demo]:id==='rare:utils'?['src/vendor/rare/lib/utils.ts']:id==='shadcn:direction'?['src/vendor/shadcn/ui/direction.tsx']:[];for(const record of manifest.imports)if(record.library===id.split(':')[0]&&record.name===id.split(':')[1]&&/\.(tsx|ts)$/.test(record.file))roots.push(record.file);if(id==='shadcn:toast'||id==='shadcn:sonner')roots.push('src/vendor/shadcn/ui/sonner.tsx');for(const root of [...roots])for(const match of fs.readFileSync(root,'utf8').matchAll(/from\s+['"](@\/vendor\/[^'"]+|\.[^'"]+)['"]/g)){const base=match[1].startsWith('@/')?'src/'+match[1].slice(2):path.normalize(path.join(path.dirname(root),match[1]));const dep=[base,base+'.tsx',base+'.ts'].find(f=>known.has(f));if(dep)roots.push(dep)}manifest.entrySources[id]=[...new Set(roots)];if(!roots.length||roots.some(f=>!known.has(f)||!fs.existsSync(f)))throw Error('Missing original source for '+id)}
fs.writeFileSync(manifestFile,JSON.stringify(manifest,null,2));
console.log('Mapped '+Object.keys(manifest.entrySources).length+' original entry sources');

}

// Supply official application tooltip context to every shadcn example.
{
const file='src/previews/foundations.tsx';
let source=fs.readFileSync(file,'utf8');
if(!source.includes('const foundationDemos:')){
source="import { TooltipProvider } from '../vendor/shadcn/ui/tooltip';\n"+source.replace('export const previews:','const foundationDemos:');
source+=`\n// Official shadcn examples expect the application-level tooltip context.\nexport const previews: Record<string, ComponentType<{dark?:boolean}>> = Object.fromEntries(\n  Object.entries(foundationDemos).map(([id, Preview]) => [\n    id,\n    id.startsWith('shadcn:')\n      ? function ShadcnPreview(props: {dark?:boolean}) {\n          return <TooltipProvider><Preview {...props}/></TooltipProvider>;\n        }\n      : Preview,\n  ]),\n);\n`;
fs.writeFileSync(file,source);
}

}
