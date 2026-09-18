import {forwardRef, type AnchorHTMLAttributes} from 'react';
// Standalone previews use native navigation for upstream Next Link compositions.
export default forwardRef<HTMLAnchorElement, AnchorHTMLAttributes<HTMLAnchorElement>>(function Link(props, ref) {return <a ref={ref} {...props} />;});
