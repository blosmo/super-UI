import type {ComponentType} from 'react';
import {previewMap} from '../vendor/fluid/app/components/bento-previews';
export const previews: Record<string,ComponentType<{dark?:boolean}>> = Object.fromEntries(Object.entries(previewMap).map(([slug, Demo]) => ['fluid:'+slug, ({dark}: {dark?:boolean}) => <div className={`fluid-preview w-full ${dark?'dark':'light'}`}><Demo /></div>]));
