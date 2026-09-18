import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import ts from 'typescript';
const source=process.argv[2]||'/tmp/fluid-source';
const dest='src/vendor/fluid';
const seen=new Set(), dependencies=new Set(), imports=[];
function resolve(p){return [p,p+'.tsx',p+'.ts',p+'.mjs',p+'/index.tsx',p+'/index.ts'].find(x=>fs.existsSync(path.join(source,x))&&fs.statSync(path.join(source,x)).isFile());}
function copy(file){if(seen.has(file))return;seen.add(file);const original=fs.readFileSync(path.join(source,file),'utf8');const sf=ts.createSourceFile(file,original,ts.ScriptTarget.Latest,true);let edits=[];
 function visit(n){let spec;if((ts.isImportDeclaration(n)||ts.isExportDeclaration(n))&&n.moduleSpecifier)spec=n.moduleSpecifier;else if(ts.isCallExpression(n)&&n.expression.kind===ts.SyntaxKind.ImportKeyword&&ts.isStringLiteral(n.arguments[0]))spec=n.arguments[0];
 if(spec&&ts.isStringLiteral(spec)){let s=spec.text,replacement;
 if(s.startsWith('@/')||s.startsWith('.')){let target=resolve(s.startsWith('@/')?s.slice(2):path.join(path.dirname(file),s));if(!target)throw new Error(file+': '+s);copy(target);replacement=path.relative(path.dirname(file),target).replace(/\.tsx?$/,'');if(!replacement.startsWith('.'))replacement='./'+replacement;}
 else if(s==='next/image'||s==='next/link'){replacement=path.relative(path.dirname(file),s==='next/image'?'image-adapter':'link-adapter');if(!replacement.startsWith('.'))replacement='./'+replacement;}
 else if(!s.startsWith('node:'))dependencies.add(s.startsWith('@')?s.split('/').slice(0,2).join('/'):s.split('/')[0]);
 if(replacement)edits.push([spec.getStart(sf)+1,spec.getEnd()-1,replacement]);}
 ts.forEachChild(n,visit);
 }visit(sf);let content=original;for(let [start,end,replacement] of edits.sort((a,b)=>b[0]-a[0]))content=content.slice(0,start)+replacement+content.slice(end);
 content=content.replace('src="/micka.png"','src="https://www.fluidfunctionalism.com/micka.png"');
 const target=path.join(dest,file);fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,content);
 imports.push({library:'fluid',name:path.basename(file).replace(/\.(tsx?|mjs)$/,''),url:`https://github.com/mickadesign/fluid-functionalism/blob/main/${file}`,file:target,sha256:crypto.createHash('sha256').update(original).digest('hex'),outputSha256:crypto.createHash('sha256').update(content).digest('hex'),modifications:'Import paths, native Next image adapter, and absolute official asset URL only',dependencies:[]});
}
copy('app/components/bento-previews.tsx');
const catalog=JSON.parse(fs.readFileSync('src/data/catalog.json')).filter(x=>x.library==='fluid');
fs.mkdirSync('src/previews',{recursive:true});
fs.writeFileSync('src/previews/fluid.tsx',`import type {ComponentType} from 'react';\nimport {previewMap} from '../vendor/fluid/app/components/bento-previews';\nexport const previews: Record<string,ComponentType<{dark?:boolean}>> = Object.fromEntries(Object.entries(previewMap).map(([slug, Demo]) => ['fluid:'+slug, ({dark}: {dark?:boolean}) => <div className={\`fluid-preview w-full \${dark?'dark':'light'}\`}><Demo /></div>]));\n`);
let css=fs.readFileSync(path.join(source,'app/globals.css'),'utf8').replace('@import "tailwindcss";','').replace(/url\("\/fonts\//g,'url("https://www.fluidfunctionalism.com/fonts/');
css=css.replace(/:root/g,'.fluid-preview').replace(/^\.light/gm,'.fluid-preview.light').replace(/^\.dark/gm,'.fluid-preview.dark');
fs.writeFileSync(path.join(dest,'preview.css'),css);
fs.copyFileSync(path.join(source,'LICENSE'),path.join(dest,'LICENSE'));
fs.mkdirSync('src/data/integrations',{recursive:true});fs.writeFileSync('src/data/integrations/fluid.json',JSON.stringify({entrySources:Object.fromEntries(catalog.map(x=>[x.id,[path.join(dest,'app/components/bento-previews.tsx'),...imports.filter(i=>i.file.includes('/registry/')&&i.name===x.slug).map(i=>i.file)]])),imports,dependencies:[...dependencies].sort(),covered:catalog.map(x=>x.id),blocked:[]},null,2)+'\n');console.log({files:seen.size,dependencies:[...dependencies],covered:catalog.length});
