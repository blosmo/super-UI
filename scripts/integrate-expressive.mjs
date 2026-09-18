import fs, {readFileSync,writeFileSync,mkdirSync,existsSync} from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import postcss from 'postcss';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
const cat=JSON.parse(readFileSync('src/data/catalog.json','utf8'));
const manifest={imports:[],dependencies:['border-beam','thinking-orbs','liquid-gooey','metal-fx'],covered:[],blocked:[]};
const save=(p,s)=>{mkdirSync(p.slice(0,p.lastIndexOf('/')),{recursive:true});writeFileSync(p,s)};
const record=(library,name,url,file,source)=>manifest.imports.push({library,name,url,file,sha256:createHash('sha256').update(source).digest('hex'),modifications:'None',dependencies:[]});
const rsc=readFileSync('research/beautiful-rsc.txt');
const text=rsc.toString();
const mapping=JSON.parse('{'+text.match(/"loading-state":"\$12".*?"agent-screen":"\$26"/)[0]+'}');
for(const entry of cat.filter(x=>x.library==='beautiful')){
 const id=mapping[entry.slug].slice(1);const pattern=Buffer.from(id+':T');const offset=rsc.indexOf(pattern);const comma=rsc.indexOf(',',offset);const size=parseInt(rsc.subarray(offset+pattern.length,comma).toString(),16);const source=rsc.subarray(comma+1,comma+1+size).toString();
 const file=`src/vendor/beautiful/${entry.slug}.tsx`;save(file,source);record('beautiful',entry.slug,'https://www.beautifului.dev/',file,source);manifest.covered.push(entry.id);
}
for(const entry of cat.filter(x=>x.library==='amicro')){
 const url=`https://raw.githubusercontent.com/Subhan-code/Amicro--Micro-transitions-/86b55340bfb939b8e93bb53aa46ba017c3449f1c/registry/ui/${entry.slug}.json`;
 const cache=`/tmp/super-ui-amicro-${entry.slug}.json`;
 try{if(!existsSync(cache)) save(cache,execFileSync('curl',['-fsSL','--max-time','25',url],{encoding:'utf8'}));
 const data=JSON.parse(readFileSync(cache,'utf8'));for(const f of data.files){if(!f.content)continue;const file=`src/vendor/amicro/${entry.slug}.tsx`;save(file,f.content);record('amicro',entry.slug,url,file,f.content)}manifest.covered.push(entry.id);
 }catch(e){manifest.blocked.push({id:entry.id,reason:String(e.message),url})}
}
save('src/data/integrations/expressive.json',JSON.stringify(manifest,null,2));
console.log('Covered',manifest.covered.length,'blocked',manifest.blocked.length);

{
const records=[];const visited=new Set();const deps=new Set();
function fetch(url){if(visited.has(url))return;visited.add(url);const d=JSON.parse(execFileSync('curl',['-fsSL','--max-time','25',url],{encoding:'utf8'}));for(const dep of d.registryDependencies||[])if(dep.startsWith('https:'))fetch(dep);for(const dep of d.dependencies||[])deps.add(dep);for(const f of d.files||[]){if(!f.content)continue;const p='src/vendor/beautiful/'+f.path;fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,f.content.replaceAll('@/components/','@/vendor/beautiful/components/').replaceAll('@/lib/','@/lib/'));records.push({library:'beautiful',name:d.name,url,file:p,sha256:crypto.createHash('sha256').update(f.content).digest('hex'),modifications:'Import aliases only',dependencies:d.dependencies||[]})}}
for(const e of JSON.parse(fs.readFileSync('src/data/catalog.json')).filter(e=>e.library==='beautiful' && e.slug!=='agent-screen'))fetch('https://www.beautifului.dev/r/'+e.slug+'.json');
fs.writeFileSync('/tmp/beautiful-imports.json',JSON.stringify({records,deps:[...deps]},null,2));console.log([...deps],records.length);

}
{
const catalog=JSON.parse(fs.readFileSync('src/data/catalog.json'));
let imports=['import { type ComponentType, useState } from "react";','import { BorderBeam } from "border-beam";','import { ThinkingOrb } from "thinking-orbs";','import { Liquid } from "liquid-gooey";','import { MetalFx } from "metal-fx";','import LibraryImage from "../library-image";','import "../vendor/beautiful/scoped.css";'];let entries=[];
let n=0;for(const e of catalog.filter(e=>e.library==='amicro')){
let src=fs.readFileSync(`src/vendor/amicro/${e.slug}.tsx`,'utf8');const name=src.match(/export (?:const|function) (\w+)/)[1], local=`Amicro${n++}`; imports.push(`import { ${name} as ${local} } from "../vendor/amicro/${e.slug}";`);
let props='';let child='';if(/text: string/.test(src))props=' text="Ideas come to life" className="text-2xl font-medium"';
if(/children: React.ReactNode/.test(src)){child='<span style={{display:"block",padding:24,borderRadius:16,background:"var(--muted, #e4e4e7)",color:"var(--foreground, #18181b)"}}>Explore the details</span>'}
if(e.slug==='card-hover')props=' items={[{id:"one",title:"Explore",description:"Hover to discover the motion."},{id:"two",title:"Create",description:"Build something meaningful."}]}';
if(e.slug==='sticky-reveal')props=' content={[{title:"Discover",description:"Scroll through the preview to reveal each step."},{title:"Make it yours",description:"Original motion, ready for your project."}]}';
if(e.slug==='skeleton')props=' className="h-28 w-64 rounded-xl"';
if(e.slug==='mouse-follow')child='<div style={{width:40,height:40,borderRadius:20,background:"#6366f1"}} />';
let el=child?`<${local}${props}>${child}</${local}>`:`<${local}${props} />`;
if(['cursor-trail','mouse-follow'].includes(e.slug))el=`<div style={{height:180,width:280,display:"grid",placeItems:"center"}}><span>Move your pointer here</span>${el}</div>`;
if(e.slug==='progress-indicator')el=`<div style={{height:650,padding:32}}>${el}<p>Scroll down to see progress</p><p style={{marginTop:450}}>You reached the end</p></div>`;
entries.push(`${JSON.stringify(e.id)}: () => ${el}`)
}
const bm=JSON.parse(fs.readFileSync('/tmp/beautiful-imports.json'));for(const e of catalog.filter(e=>e.library==='beautiful')){
let file=bm.records.find(x=>x.name===e.slug&&x.file.endsWith('.tsx'))?.file;
if(!file)file='src/vendor/beautiful/agent-screen.tsx';
const name=`Beautiful${n++}`;imports.push(`import ${name} from "../${file.slice(4).replace(/\.tsx$/,'')}";`);entries.push(`${JSON.stringify(e.id)}: () => <div className="beautiful-demo" style={{width:"100%",maxWidth:600,padding:20}}><${name} /></div>`)
}
entries.push('"libraries:border-beam": ({dark}) => <BorderBeam theme={dark?"dark":"light"}><button style={{padding:"22px 38px",borderRadius:18,background:dark?"#202024":"#fff",color:dark?"#fff":"#18181b"}}>Follow the light</button></BorderBeam>', '"libraries:orbs": ({dark}) => <ThinkingOrb state="searching" size={64} color={dark?"#f4f4f5":"#27272a"} />','"libraries:gooey": GooeyDemo','"libraries:metal": ({dark}) => <MetalFx variant="button" theme={dark?"dark":"light"}><button style={{padding:"20px 36px"}}>Liquid metal</button></MetalFx>','"libraries:image": LibraryImage');
fs.mkdirSync('src/previews',{recursive:true});fs.writeFileSync('src/previews/expressive.tsx',imports.join('\n')+`\nfunction GooeyDemo({dark}: {dark?: boolean}) {const [open,setOpen]=useState(false);return <div style={{height:180,width:260,display:"grid",placeItems:"center"}}><Liquid fill={dark?"#f4f4f5":"#27272a"} blur={6} contrast={18}><Liquid.Item x={open?-52:0} y={open?-40:0} transition="bouncy"><button style={{width:44,height:44,borderRadius:22,color:dark?"#18181b":"white"}} onClick={()=>setOpen(!open)} aria-label="First action">1</button></Liquid.Item><Liquid.Item x={open?52:0} y={open?-40:0} transition="bouncy"><button style={{width:44,height:44,borderRadius:22,color:dark?"#18181b":"white"}} onClick={()=>setOpen(!open)} aria-label="Second action">2</button></Liquid.Item><Liquid.Item><button aria-label="Toggle liquid menu" onClick={()=>setOpen(!open)} style={{width:48,height:48,borderRadius:24,color:dark?"#18181b":"white"}}>{open?"−":"+"}</button></Liquid.Item></Liquid></div>;}\nexport const expressivePreviews: Record<string, ComponentType<{dark?:boolean}>> = {\n`+entries.join(',\n')+'\n};\nexport default expressivePreviews;\n');

}
{
const m=JSON.parse(fs.readFileSync('src/data/integrations/expressive.json'));const b=JSON.parse(fs.readFileSync('/tmp/beautiful-imports.json'));
m.imports=m.imports.filter(x=>x.library!=='beautiful'||['loading-state','thinking-state','streaming-text','agent-screen'].includes(x.name));m.imports.push(...b.records);m.dependencies.push(...b.deps,'shadow-plugin');
for(const file of fs.readdirSync('src/vendor/beautiful'))if(file.endsWith('.tsx')&&!['loading-state.tsx','thinking-state.tsx','streaming-text.tsx','agent-screen.tsx'].includes(file))fs.unlinkSync('src/vendor/beautiful/'+file);
let a=fs.readFileSync('src/vendor/beautiful/agent-screen.tsx','utf8').replaceAll('@/components/','@/vendor/beautiful/components/');fs.writeFileSync('src/vendor/beautiful/agent-screen.tsx',a);m.imports.find(x=>x.name==='agent-screen').modifications='Import aliases only';
const css=fs.readFileSync('research/beautiful-css.txt','utf8');const tree=postcss.parse(css);tree.walkRules(rule=>{if(rule.parent.type==='atrule'&&rule.parent.name==='keyframes')return;rule.selectors=rule.selectors.map(s=>s===':root'||s===':host'?'.beautiful-demo':s==='.dark'?'.dark .beautiful-demo':'.beautiful-demo '+s)});tree.walkAtRules('font-face',r=>r.remove());fs.writeFileSync('src/vendor/beautiful/scoped.css','/* Original Beautiful UI distributed stylesheet, scoped to preview wrapper. MIT Shane Levine. */\n'+tree.toString());m.imports.push({library:'beautiful',name:'preview-styles',url:'https://www.beautifului.dev/_next/static/css/f1a0855b27dc8a58.css',file:'src/vendor/beautiful/scoped.css',sha256:crypto.createHash('sha256').update(css).digest('hex'),modifications:'Selectors scoped under .beautiful-demo; font-face removed to avoid cross-site font requests',dependencies:[]});
for(const name of ['border-beam','thinking-orbs','liquid-gooey','metal-fx','img-fx']){const p=JSON.parse(fs.readFileSync('node_modules/'+name+'/package.json'));const slug={'thinking-orbs':'orbs','liquid-gooey':'gooey','metal-fx':'metal','img-fx':'image'}[name]||name;fs.mkdirSync('src/vendor/libraries',{recursive:true});const file='src/vendor/libraries/'+name+'-LICENSE';fs.copyFileSync('node_modules/'+name+'/LICENSE',file);m.imports.push({library:'libraries',name:slug,url:'https://www.npmjs.com/package/'+name+'/v/'+p.version,file,sha256:crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex'),modifications:'Official npm package, imported unchanged; file contains preserved license',dependencies:[name]});m.covered.push('libraries:'+slug)}
fs.writeFileSync('src/data/integrations/expressive.json',JSON.stringify(m,null,2));

}
{
const m=JSON.parse(fs.readFileSync('src/data/integrations/expressive.json'));
const changes={'blur-text':'variants','character-stagger':'variants','text-reveal':'variants','word-reveal':'variants','text-shimmer':'mask','progress-indicator':'duplicate'};
for(const [name,kind]of Object.entries(changes)){const file=`src/vendor/amicro/${name}.tsx`;let s=fs.readFileSync(file,'utf8');fs.writeFileSync(file+'.original',s);if(kind==='variants'){s=s.replace("import { motion }", "import { motion, type Variants }").replace(/const (\w+Variants) = \{/g,'const $1: Variants = {');}if(kind==='mask'){s=s.replace("import { motion }", "import { motion, type TargetAndTransition }").replace('animate={{ WebkitMaskPosition: ["100% 0%", "-100% 0%"] }}','animate={{ WebkitMaskPosition: ["100% 0%", "-100% 0%"] } as TargetAndTransition}');}if(kind==='duplicate')s=s.replace('      style={{ scaleX }}\r\n','');fs.writeFileSync(file,s);m.imports.find(x=>x.file===file).modifications=kind==='duplicate'?'Removed redundant duplicate style prop (same scaleX retained in full style object)':'Type-only Motion compatibility annotations; runtime unchanged';}
for(const rec of m.imports)rec.outputSha256=crypto.createHash('sha256').update(fs.readFileSync(rec.file)).digest('hex');fs.writeFileSync('src/data/integrations/expressive.json',JSON.stringify(m,null,2));

}

{
const m=JSON.parse(fs.readFileSync("src/data/integrations/expressive.json"));for(const r of m.imports.filter(r=>r.library==="libraries")){const n=r.dependencies[0],p=JSON.parse(fs.readFileSync("node_modules/"+n+"/package.json"));r.file="src/vendor/libraries/"+n+".source.js";fs.copyFileSync("node_modules/"+n+"/"+p.module,r.file);r.sha256=r.outputSha256=crypto.createHash("sha256").update(fs.readFileSync(r.file)).digest("hex");r.modifications="None; official npm distribution, installed package imported unchanged. License retained alongside source.";}fs.writeFileSync("src/data/integrations/expressive.json",JSON.stringify(m,null,2));for(const l of ["beautiful","amicro"])fs.copyFileSync("public/licenses/"+l+".txt","src/vendor/"+l+"/LICENSE");
}

{
const file="src/vendor/beautiful/components/primitives/SidebarNav.tsx";let s=fs.readFileSync(file,"utf8");fs.writeFileSync(file+".original",s);s=s.replace(/"@central-icons-react\/round-outlined-radius-2-stroke-2\/[^"\n]+"/g,'"../../free-icons"');fs.writeFileSync(file,s);const m=JSON.parse(fs.readFileSync("src/data/integrations/expressive.json"));m.dependencies=m.dependencies.filter(d=>!d.startsWith("@central-icons-react/"));for(const r of m.imports){r.dependencies=r.dependencies.filter(d=>!d.startsWith("@central-icons-react/"));if(r.file===file){r.modifications="Import aliases; 12 paid Central Icons glyphs replaced by free Lucide equivalents through free-icons.tsx. Layout and behavior unchanged.";r.outputSha256=crypto.createHash("sha256").update(s).digest("hex")}}m.notes=[{id:"beautiful:sidebar-nav",note:"Twelve paid Central Icons glyphs use free Lucide equivalents; layout and behavior unchanged."}];fs.writeFileSync("src/data/integrations/expressive.json",JSON.stringify(m,null,2));
}

{
const manifest=JSON.parse(fs.readFileSync('src/data/integrations/expressive.json','utf8'));
const adapter='src/vendor/beautiful/free-icons.tsx';
if(!manifest.imports.some(r=>r.file===adapter)){const hash=crypto.createHash('sha256').update(fs.readFileSync(adapter)).digest('hex');manifest.imports.push({library:'beautiful',name:'free-icons',url:'https://lucide.dev/icons/',file:adapter,sha256:hash,outputSha256:hash,modifications:'Local import adapter mapping 12 paid Central Icons names to free Lucide glyphs; not an upstream Beautiful UI component.',dependencies:['lucide-react']});}
const known=new Set(manifest.imports.map(r=>r.file));
function dependencies(file,seen=new Set()) {if(seen.has(file))return seen;seen.add(file);const source=fs.readFileSync(file,'utf8');for(const match of source.matchAll(/from\s+['"](@\/vendor\/[^'"]+|\.[^'"]+)['"]/g)){const base=match[1].startsWith('@/')?'src/'+match[1].slice(2):path.normalize(path.join(path.dirname(file),match[1]));const next=[base,base+'.tsx',base+'.ts',base+'.js'].find(f=>known.has(f));if(next)dependencies(next,seen);}return seen;}
manifest.entrySources={};
for(const id of manifest.covered){const [library,name]=id.split(':');const candidates=manifest.imports.filter(r=>r.library===library&&r.name===name&&/\.(tsx|ts|js)$/.test(r.file));if(!candidates.length)throw new Error('No source for '+id);const primary=candidates[0].file;manifest.entrySources[id]=[...dependencies(primary)];}
for(const record of manifest.imports){const actual=crypto.createHash('sha256').update(fs.readFileSync(record.file)).digest('hex');if(actual!==record.outputSha256)throw Error('Changed output checksum: '+record.file);}
fs.writeFileSync('src/data/integrations/expressive.json',JSON.stringify(manifest,null,2));
console.log('Mapped',Object.keys(manifest.entrySources).length,'entries; all output checksums valid');

}
