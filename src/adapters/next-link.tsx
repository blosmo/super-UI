import { forwardRef, type AnchorHTMLAttributes } from "react";
// Gallery host adapter: preserve the original component's link markup without
// requiring a Next.js router. Previews use local, non-navigating item lists.
const Link = forwardRef<
  HTMLAnchorElement,
  AnchorHTMLAttributes<HTMLAnchorElement>
>(function Link(props, ref) {
  return <a ref={ref} {...props} />;
});
export default Link;
