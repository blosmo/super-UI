import { ToastProvider } from "../vendor/coss/ui/toast";
import { TooltipProvider } from "../vendor/coss/ui/tooltip";
import { lazy, type ComponentType } from "react";
import { Label } from "../vendor/coss/ui/label";
import { Input } from "../vendor/coss/ui/input";
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "../vendor/coss/ui/sidebar";
const originalPreviews: Record<string, ComponentType<{ dark?: boolean }>> = {
  "coss:accordion": lazy(
    () => import("../vendor/coss/particles/p-accordion-1"),
  ),
  "coss:alert": lazy(() => import("../vendor/coss/particles/p-alert-1")),
  "coss:avatar": lazy(() => import("../vendor/coss/particles/p-avatar-1")),
  "coss:badge": lazy(() => import("../vendor/coss/particles/p-badge-1")),
  "coss:alert-dialog": lazy(
    () => import("../vendor/coss/particles/p-alert-dialog-1"),
  ),
  "coss:autocomplete": lazy(
    () => import("../vendor/coss/particles/p-autocomplete-1"),
  ),
  "coss:button": lazy(() => import("../vendor/coss/particles/p-button-1")),
  "coss:breadcrumb": lazy(
    () => import("../vendor/coss/particles/p-breadcrumb-1"),
  ),
  "coss:calendar": lazy(() => import("../vendor/coss/particles/p-calendar-1")),
  "coss:card": lazy(() => import("../vendor/coss/particles/p-card-1")),
  "coss:checkbox": lazy(() => import("../vendor/coss/particles/p-checkbox-1")),
  "coss:checkbox-group": lazy(
    () => import("../vendor/coss/particles/p-checkbox-group-1"),
  ),
  "coss:dialog": lazy(() => import("../vendor/coss/particles/p-dialog-1")),
  "coss:context-menu": lazy(
    () => import("../vendor/coss/particles/p-context-menu-1"),
  ),
  "coss:combobox": lazy(() => import("../vendor/coss/particles/p-combobox-1")),
  "coss:collapsible": lazy(
    () => import("../vendor/coss/particles/p-collapsible-1"),
  ),
  "coss:date-picker": lazy(
    () => import("../vendor/coss/particles/p-date-picker-1"),
  ),
  "coss:command": lazy(() => import("../vendor/coss/particles/p-command-1")),
  "coss:form": lazy(() => import("../vendor/coss/particles/p-form-1")),
  "coss:drawer": lazy(() => import("../vendor/coss/particles/p-drawer-1")),
  "coss:empty": lazy(() => import("../vendor/coss/particles/p-empty-1")),
  "coss:fieldset": lazy(() => import("../vendor/coss/particles/p-fieldset-1")),
  "coss:field": lazy(() => import("../vendor/coss/particles/p-field-1")),
  "coss:frame": lazy(() => import("../vendor/coss/particles/p-frame-1")),
  "coss:kbd": lazy(() => import("../vendor/coss/particles/p-kbd-1")),
  "coss:menu": lazy(() => import("../vendor/coss/particles/p-menu-1")),
  "coss:input": lazy(() => import("../vendor/coss/particles/p-input-1")),
  "coss:input-group": lazy(
    () => import("../vendor/coss/particles/p-input-group-1"),
  ),
  "coss:group": lazy(() => import("../vendor/coss/particles/p-group-1")),
  "coss:popover": lazy(() => import("../vendor/coss/particles/p-popover-1")),
  "coss:meter": lazy(() => import("../vendor/coss/particles/p-meter-1")),
  "coss:pagination": lazy(
    () => import("../vendor/coss/particles/p-pagination-1"),
  ),
  "coss:number-field": lazy(
    () => import("../vendor/coss/particles/p-number-field-1"),
  ),
  "coss:otp-field": lazy(
    () => import("../vendor/coss/particles/p-otp-field-1"),
  ),
  "coss:preview-card": lazy(
    () => import("../vendor/coss/particles/p-preview-card-1"),
  ),
  "coss:separator": lazy(
    () => import("../vendor/coss/particles/p-separator-1"),
  ),
  "coss:scroll-area": lazy(
    () => import("../vendor/coss/particles/p-scroll-area-1"),
  ),
  "coss:select": lazy(() => import("../vendor/coss/particles/p-select-1")),
  "coss:sheet": lazy(() => import("../vendor/coss/particles/p-sheet-1")),
  "coss:radio-group": lazy(
    () => import("../vendor/coss/particles/p-radio-group-1"),
  ),
  "coss:progress": lazy(() => import("../vendor/coss/particles/p-progress-1")),
  "coss:spinner": lazy(() => import("../vendor/coss/particles/p-spinner-1")),
  "coss:switch": lazy(() => import("../vendor/coss/particles/p-switch-1")),
  "coss:slider": lazy(() => import("../vendor/coss/particles/p-slider-1")),
  "coss:skeleton": lazy(() => import("../vendor/coss/particles/p-skeleton-1")),
  "coss:table": lazy(() => import("../vendor/coss/particles/p-table-1")),
  "coss:textarea": lazy(() => import("../vendor/coss/particles/p-textarea-1")),
  "coss:toggle": lazy(() => import("../vendor/coss/particles/p-toggle-1")),
  "coss:toggle-group": lazy(
    () => import("../vendor/coss/particles/p-toggle-group-1"),
  ),
  "coss:toast": lazy(() => import("../vendor/coss/particles/p-toast-1")),
  "coss:tabs": lazy(() => import("../vendor/coss/particles/p-tabs-1")),
  "coss:toolbar": lazy(() => import("../vendor/coss/particles/p-toolbar-1")),
  "coss:tooltip": lazy(() => import("../vendor/coss/particles/p-tooltip-1")),
  "coss:label": () => (
    <div className="space-y-2">
      <Label htmlFor="coss-label">Email address</Label>
      <Input id="coss-label" placeholder="you@example.com" />
    </div>
  ),
  "coss:sidebar": () => (
    <SidebarProvider>
      <Sidebar collapsible="none" className="h-72">
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Workspace</SidebarGroupLabel>
            <SidebarMenu>
              {["Overview", "Projects", "Settings"].map((t) => (
                <SidebarMenuItem key={t}>
                  <SidebarMenuButton>{t}</SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    </SidebarProvider>
  ),
};
export const previews: Record<
  string,
  ComponentType<{ dark?: boolean }>
> = Object.fromEntries(
  Object.entries(originalPreviews).map(([id, Demo]) => [
    id,
    (props: { dark?: boolean }) => (
      <TooltipProvider>
        <ToastProvider>
          <Demo {...props} />
        </ToastProvider>
      </TooltipProvider>
    ),
  ]),
);
