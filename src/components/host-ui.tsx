import { Sheet, SheetContent, SheetTitle } from "../vendor/shadcn/ui/sheet";
/** Host controls use the same MIT shadcn/ui source offered in the catalog.
 * Product classes supply our theme; the original vendor files stay unchanged.
 */
import {
  useEffect,
  useState,
  type ComponentProps,
  type ReactNode,
  type RefObject,
} from "react";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "../vendor/shadcn/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { Button as ShadcnButton } from "../vendor/shadcn/ui/button";
import { Input as ShadcnInput } from "../vendor/shadcn/ui/input";
import { Badge as ShadcnBadge } from "../vendor/shadcn/ui/badge";
import { Card as ShadcnCard } from "../vendor/shadcn/ui/card";
import "./host-ui.css";
export function Button({
  className = "",
  type = "button",
  variant = "ghost",
  ...props
}: ComponentProps<typeof ShadcnButton>) {
  return (
    <ShadcnButton
      type={type}
      variant={variant}
      className={`host-button ${className}`}
      data-host-variant={variant}
      {...props}
    />
  );
}
export function Input({
  className = "",
  ...props
}: ComponentProps<typeof ShadcnInput>) {
  return <ShadcnInput className={`host-input ${className}`} {...props} />;
}
export function Badge({
  className = "",
  variant = "secondary",
  ...props
}: ComponentProps<typeof ShadcnBadge>) {
  return (
    <ShadcnBadge
      variant={variant}
      className={`host-badge ${className}`}
      {...props}
    />
  );
}
export function Card({
  className = "",
  ...props
}: ComponentProps<typeof ShadcnCard>) {
  return <ShadcnCard className={`host-card ${className}`} {...props} />;
}
export {
  NativeSelect,
  NativeSelectOption,
} from "../vendor/shadcn/ui/native-select";
export {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "../vendor/shadcn/ui/dialog";

export function Disclosure({
  title,
  children,
  className = "",
  open: forceOpen,
}: {
  title: ReactNode;
  children: ReactNode;
  className?: string;
  open?: boolean;
}) {
  const [open, setOpen] = useState(Boolean(forceOpen));
  useEffect(() => {
    if (forceOpen) setOpen(true);
  }, [forceOpen]);
  return (
    <Collapsible className={className} open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger asChild>
        <Button className="host-disclosure-trigger">
          <ChevronDown size={14} aria-hidden="true" />
          {title}
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent>{children}</CollapsibleContent>
    </Collapsible>
  );
}

export { Toaster } from "../vendor/shadcn/ui/sonner";
export { toast } from "sonner";

export function Sidebar({
  children,
  open,
  onOpenChange,
  triggerRef,
}: {
  children: ReactNode;
  open: boolean;
  onOpenChange: (value: boolean) => void;
  triggerRef: RefObject<HTMLButtonElement | null>;
}) {
  const [mobile, setMobile] = useState(
    () => matchMedia("(max-width: 740px)").matches,
  );
  useEffect(() => {
    const media = matchMedia("(max-width: 740px)");
    const change = () => {
      setMobile(media.matches);
      if (!media.matches) onOpenChange(false);
    };
    media.addEventListener("change", change);
    return () => media.removeEventListener("change", change);
  }, [onOpenChange]);
  if (!mobile) return <aside className="sidebar">{children}</aside>;
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="left"
        showCloseButton={false}
        className="sidebar mobile-open"
        aria-describedby={undefined}
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          triggerRef.current?.focus();
        }}
      >
        <SheetTitle className="sr-only">Navigation</SheetTitle>
        {children}
      </SheetContent>
    </Sheet>
  );
}
