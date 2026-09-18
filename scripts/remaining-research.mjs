import {execFileSync} from 'node:child_process';import {writeFileSync} from 'node:fs';
const urls={
transitionsTerms:'https://transitions.dev/terms.html',fluidRegistry:'https://www.fluidfunctionalism.com/r/registry.json',fluidTerms:'https://www.fluidfunctionalism.com/terms',fluidPackage:'https://www.fluidfunctionalism.com/r/index.json',cossExample:'https://coss.com/ui/r/p-button-1.json',cossDoc:'https://raw.githubusercontent.com/cosscom/coss/main/apps/ui/content/docs/components/button.mdx',fluidDoc:'https://www.fluidfunctionalism.com/docs/button'};
for(const [name,url] of Object.entries(urls)){try{writeFileSync(`research/${name}.txt`,execFileSync('curl',['-fsSL','--max-time','25',url],{encoding:'utf8',maxBuffer:20e6}));console.log(name,'ok')}catch{console.log(name,'unavailable')}}
