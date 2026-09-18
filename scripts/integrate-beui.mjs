import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import ts from 'typescript';
const source=process.argv[2] || '/tmp/beui-source';
const dest='src/vendor/beui';
const catalog=JSON.parse(fs.readFileSync('src/data/catalog.json')).filter(x=>x.library==='beui');
const index=fs.readFileSync(`${source}/components/previews/index.tsx`,'utf8');
const mapping=[...index.matchAll(/"([\w/-]+)": dynamic\(\(\) =>\s*import\("(.+?)"\)\.then\(\s*\(m\) => m\.(\w+)/g)].map(m=>({key:m[1],file:'components/previews/'+m[2].replace('./','')+'.tsx',symbol:m[3]}));
const aliases={'agent-activity':'agent-activity-mixed',button:'button-base','scroll-animation':'scroll-reveal','approval-card':'approval-card-review','tool-result':'tool-result-terminal','loading-states':'thinking-shimmer','not-found':'not-found-glitch'};
const seen=new Set(), dependencies=new Set(),imports=[];
function resolve(p){return [p,p+'.tsx',p+'.ts',p+'/index.tsx',p+'/index.ts'].find(x=>fs.existsSync(path.join(source,x))&&fs.statSync(path.join(source,x)).isFile());}
function copy(file){
 if(seen.has(file))return;seen.add(file);
 const original=fs.readFileSync(path.join(source,file),'utf8');
 let content=original.replace(/(from\s*["']|import\s*\(["'])([^"']+)(["'])/g,(all,prefix,spec,suffix)=>{
  if(spec.startsWith('@/')||spec.startsWith('.')){
   const target=resolve(spec.startsWith('@/')?spec.slice(2):path.join(path.dirname(file),spec));
   if(!target)throw new Error(`${file}: missing ${spec}`);
   copy(target);let rel=path.relative(path.dirname(file),target).replace(/\.(tsx?|jsx?)$/,'');if(!rel.startsWith('.'))rel='./'+rel;return prefix+rel+suffix;
  }
  if(spec==='next/image')return prefix+'../../../image-adapter'+suffix;
  if(spec!=='ai'&&/^[a-z@][a-z0-9@/_.-]*$/.test(spec)&&!spec.startsWith('node:'))dependencies.add(spec.startsWith('@')?spec.split('/').slice(0,2).join('/'):spec.split('/')[0]);
  return all;
 });
 const target=path.join(dest,file);fs.mkdirSync(path.dirname(target),{recursive:true});
 // Existing vendored files are preserved if already present.
 if(!fs.existsSync(target))fs.writeFileSync(target,content);
 imports.push({library:'beui',name:path.basename(file).replace(/\.tsx?$/,''),url:`https://github.com/starc007/ui-components/blob/main/${file}`,file:target,sha256:crypto.createHash('sha256').update(original).digest('hex'),modifications:'Import aliases only; Next Image uses native image adapter in standalone previews',dependencies:[]});
}
const selections=catalog.map(item=>{const slug=aliases[item.slug]||item.slug;const match=mapping.find(m=>m.key.split('/').at(-1)===slug);if(!match)throw new Error('Missing demo '+item.id);copy(match.file);return {...match,id:item.id};});
fs.mkdirSync('src/previews',{recursive:true});
fs.writeFileSync('src/previews/beui.tsx',`import { lazy, type ComponentType } from 'react';\nimport {ThemeProvider} from 'next-themes';\nfunction demo(Component: ComponentType): ComponentType<{dark?:boolean}> { return ({dark}) => <ThemeProvider attribute="class" forcedTheme={dark ? 'dark':'light'} enableSystem={false}><div className="beui-preview w-full"><Component /></div></ThemeProvider>; }\nexport const previews: Record<string, ComponentType<{dark?:boolean}>> = {\n${selections.map(x=>`  '${x.id}': lazy(() => import('../vendor/beui/${x.file.replace(/\.tsx$/,'')}').then(m => ({default:demo(m.${x.symbol})}))),`).join('\n')}\n};\n`);
fs.mkdirSync('src/data/integrations',{recursive:true});
function sourceClosure(file, seen=new Set()) {
 if(seen.has(file))return seen;seen.add(file);
 const sf=ts.createSourceFile(file,fs.readFileSync(file,'utf8'),ts.ScriptTarget.Latest,true);
 for(const n of sf.statements)if((ts.isImportDeclaration(n)||ts.isExportDeclaration(n))&&n.moduleSpecifier?.text.startsWith('.')){
  const base=path.join(path.dirname(file),n.moduleSpecifier.text);
  const target=['','.ts','.tsx','.mjs','/index.ts','/index.tsx'].map(e=>base+e).find(p=>fs.existsSync(p)&&fs.statSync(p).isFile());
  if(target)sourceClosure(target,seen);
 }
 return seen;
}
fs.writeFileSync('src/data/integrations/beui.json',JSON.stringify({entrySources:Object.fromEntries(selections.map(x=>{const file=path.join(dest,x.file);return [x.id,[...sourceClosure(file)].filter(f=>f===file||/\/components\/(motion|agents)\//.test(f))]})),imports,dependencies:[...dependencies].sort(),covered:selections.map(x=>x.id),blocked:[]},null,2)+'\n');
let css=fs.readFileSync(path.join(source,'app/globals.css'),'utf8').replace('@import "tailwindcss";', '').replace(/:root/g, '.beui-preview').replace(/\.dark \{/g, '.dark .beui-preview {');
css=css.replace(/@layer base \{[\s\S]*?\n\}\n/, '');
fs.writeFileSync(path.join(dest,'preview.css'),css);
fs.copyFileSync(path.join(source,'LICENSE'),path.join(dest,'LICENSE'));
console.log({covered:selections.length,files:seen.size,dependencies:[...dependencies]});
