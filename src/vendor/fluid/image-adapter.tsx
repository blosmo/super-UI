import type { ImgHTMLAttributes } from 'react';
export default function Image({fill, style, ...props}: ImgHTMLAttributes<HTMLImageElement> & {fill?:boolean}) {
  return <img {...props} style={{...(fill ? {position:'absolute',inset:0,width:'100%',height:'100%'} as const : {}),...style}} />;
}
