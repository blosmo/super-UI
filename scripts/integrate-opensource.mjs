/** Import pinned original components and official showcase. Download/extract upstream to /tmp/super-ui-opensource first. */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import ts from 'typescript';
const upstream=process.env.OPENSOURCE_SOURCE_DIR || '/tmp/super-ui-opensource';
const revision='77980822b28ee64b51bccf19eaa4103d9a71724a';
const target='src/vendor/opensource/original';
const imports=[]; const assetSeen=new Set(); const dependencies=new Set(); const seen=new Set();
function resolveFile(p){return [p,p+'.tsx',p+'.ts',p+'.css',p+'/index.tsx',p+'/index.ts'].find(x=>fs.existsSync(path.join(upstream,x))&&fs.statSync(path.join(upstream,x)).isFile());}
function copy(file){
 if(seen.has(file))return;seen.add(file);
 const source=fs.readFileSync(path.join(upstream,file),'utf8');
 const ast=ts.createSourceFile(file,source,ts.ScriptTarget.Latest,true,file.endsWith('tsx')?ts.ScriptKind.TSX:ts.ScriptKind.TS);
 const replacements=[]; const assetImports=[]; const assets=new Map();
 function visit(n){
 if(ts.isStringLiteral(n) && n.text.startsWith('/') && fs.existsSync(path.join(upstream,'public',n.text)) && fs.statSync(path.join(upstream,'public',n.text)).isFile()) {
 const assetFile='public'+n.text;
 if(!assets.has(assetFile)) {
 const symbol='opensourceAsset'+assets.size;
 assets.set(assetFile,symbol);
 const dest=path.join(target,assetFile);fs.mkdirSync(path.dirname(dest),{recursive:true});fs.copyFileSync(path.join(upstream,assetFile),dest);
 let rel=path.posix.relative(path.posix.dirname(file),assetFile);if(!rel.startsWith('.'))rel='./'+rel;
 assetImports.push(`import ${symbol} from ${JSON.stringify(rel+'?url')};`);
 if(!assetSeen.has(assetFile)) {
 assetSeen.add(assetFile);
 imports.push({library:'opensource',name:assetFile,url:`https://raw.githubusercontent.com/bidyut10/opensourceui/${revision}/${assetFile}`,file:dest,sha256:crypto.createHash('sha256').update(fs.readFileSync(path.join(upstream,assetFile))).digest('hex'),modifications:'None',dependencies:[]});
 }

 }
 const expression=assets.get(assetFile);
 replacements.push([n.getStart(ast),n.getEnd(),ts.isJsxAttribute(n.parent)?'{'+expression+'}':expression]);
 }

 if((ts.isImportDeclaration(n)||ts.isExportDeclaration(n))&&n.moduleSpecifier&&ts.isStringLiteral(n.moduleSpecifier)){
 const spec=n.moduleSpecifier.text;
 if(spec.startsWith('@/')||spec.startsWith('.')){
 const resolved=resolveFile(spec.startsWith('@/')?spec.slice(2):path.posix.join(path.posix.dirname(file),spec));
 if(!resolved)throw new Error(`Missing ${spec} in ${file}`);
 copy(resolved);
 let rel=path.posix.relative(path.posix.dirname(file),resolved).replace(/\.(tsx?|jsx?)$/,'');if(!rel.startsWith('.'))rel='./'+rel;
 replacements.push([n.moduleSpecifier.getStart(ast)+1,n.moduleSpecifier.getEnd()-1,rel]);
 }else dependencies.add(spec.split('/').slice(0,spec.startsWith('@')?2:1).join('/'));
 }ts.forEachChild(n,visit);
 }visit(ast);
 let content=source;for(const [a,b,s] of replacements.sort((a,b)=>b[0]-a[0]))content=content.slice(0,a)+s+content.slice(b);
 content=assetImports.join('\n')+'\n'+content;
 // Preserve original component logic; disable upstream project-specific TS checks.
 if(/\.tsx?$/.test(file))content='// @ts-nocheck\n'+content;
 const dest=path.join(target,file);fs.mkdirSync(path.dirname(dest),{recursive:true});fs.writeFileSync(dest,content);
 imports.push({library:'opensource',name:path.basename(file).replace(/\.[^.]+$/,''),url:`https://raw.githubusercontent.com/bidyut10/opensourceui/${revision}/${file}`,file:dest,sha256:crypto.createHash('sha256').update(source).digest('hex'),modifications:'Relative import aliases; local public asset URL imports; TypeScript check directive',dependencies:[]});
}
copy('lib/showcase/showcase.tsx');
copy('app/(docs)/components/_components/shared/showcase-preview-content.tsx');
fs.copyFileSync(path.join(upstream,'LICENSE'),path.join(target,'LICENSE'));
const catalog=JSON.parse(fs.readFileSync('src/data/catalog.json','utf8')).filter(x=>x.library==='opensource');
const showcase=fs.readFileSync(path.join(upstream,'lib/showcase/showcase.tsx'),'utf8');
// The official c(slug, preview, file, exportName) calls are the source of truth.
const showcaseAst=ts.createSourceFile('showcase.tsx',showcase,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
const sourceBySlug=new Map();
function readShowcaseSources(node){
 if(ts.isCallExpression(node)&&ts.isIdentifier(node.expression)&&node.expression.text==='c'){
 const [slug,,file]=node.arguments;
 if(ts.isStringLiteral(slug)&&ts.isStringLiteral(file))sourceBySlug.set(slug.text,file.text);
 }
 ts.forEachChild(node,readShowcaseSources);
}
readShowcaseSources(showcaseAst);
const entrySources=Object.fromEntries(catalog.map(entry=>{
 const source=sourceBySlug.get(entry.slug);
 if(!source)throw new Error('Missing official showcase '+entry.slug);
 const file=path.posix.join(target,source);
 if(!fs.existsSync(file))throw new Error('Missing implementation '+file);
 return [entry.id,[file]];
}));
fs.mkdirSync('src/data/integrations',{recursive:true});
fs.writeFileSync('src/data/integrations/opensource.json',JSON.stringify({imports,entrySources,dependencies:[...dependencies].sort(),covered:catalog.map(x=>x.id),blocked:[]},null,2)+'\n');
fs.mkdirSync('src/previews',{recursive:true});
fs.writeFileSync('src/previews/opensource.tsx',`import type { ComponentType } from 'react';
import { getAllShowcaseSlugs, getShowcaseEntry, getShowcasePreviewBackdrop, isFullBleedShowcaseFile, isInputShowcaseFile, isFormShowcaseFile } from '../vendor/opensource/original/lib/showcase/showcase';

import { ShowcasePreviewContent } from '../vendor/opensource/original/app/(docs)/components/_components/shared/showcase-preview-content';

/** Render the author's exact showcase composition and sample props. */
export const previews: Record<string, ComponentType<{ dark?: boolean }>> = Object.fromEntries(
  getAllShowcaseSlugs().map((slug) => {
    const entry = getShowcaseEntry(slug)!;
    const fullBleed = isFullBleedShowcaseFile(entry.file);
    const backdrop = getShowcasePreviewBackdrop(entry.file);
    const Preview = () => <div style={{ width: '100%', minHeight: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', backgroundImage: backdrop ? 'url(' + backdrop + ')' : undefined, backgroundSize: 'cover' }}><ShowcasePreviewContent fullBleed={fullBleed} variant={isInputShowcaseFile(entry.file) ? 'input' : isFormShowcaseFile(entry.file) ? 'form' : 'default'}>{entry.preview}</ShowcasePreviewContent></div>;
    return ['opensource:' + slug, Preview];
  }),
);
`);
console.log(JSON.stringify({files:seen.size,covered:catalog.length,dependencies:[...dependencies]},null,2));
