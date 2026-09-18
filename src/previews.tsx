import { IconMorph } from "./vendor/interior/components/icon-morph";
import { SkeletonSwap } from "./vendor/interior/components/skeleton-swap";
import { NewItemsPill } from "./vendor/interior/components/new-items-pill";
import { LogoMarquee } from "./vendor/interior/components/logo-marquee";
import { BounceSidebar } from "./vendor/rare/components/ui/bounce-sidebar";
import LoadingState from "./vendor/beautiful/loading-state";
import ThinkingState from "./vendor/beautiful/thinking-state";
import { ApplePulseDots } from "./vendor/amicro/apple-pulse-dots";
import { useState, lazy, type ComponentType } from "react";
import { CopyButton } from "./vendor/interior/components/copy-button";
import { LoadingButton } from "./vendor/interior/components/loading-button";
import { LikeBurst } from "./vendor/interior/components/like-burst";
import { PressDepth } from "./vendor/interior/components/press-depth";
import { SegmentedControl } from "./vendor/interior/components/segmented-control";
import { TypingIndicator } from "./vendor/interior/components/typing-indicator";
import { ProgressBar } from "./vendor/interior/components/progress-bar";
import { FloatingLabelInput } from "./vendor/interior/components/floating-label";
import { Accordion } from "./vendor/interior/components/accordion";
import { Tabs } from "./vendor/interior/components/tabs";
import { ShowMore } from "./vendor/interior/components/show-more";
import { ValueFlash } from "./vendor/interior/components/value-flash";
import { TextReveal } from "./vendor/interior/components/text-reveal";
import FolderComponent from "./vendor/rare/components/ui/folder-component";
import { AnimatedCounter } from "./vendor/rare/components/ui/animated-counter";
import { NotificationBell } from "./vendor/rare/components/ui/notification-bell";
import { DeleteButton } from "./vendor/rare/components/ui/delete-button";
import { TiltCard } from "./vendor/beui/components/motion/tilt-card";
import { Switch as BeSwitch } from "./vendor/beui/components/motion/switch";
import {
  Tabs as BeTabs,
  TabsList as BeTabsList,
  TabsTrigger as BeTabsTrigger,
  TabsContent as BeTabsContent,
} from "./vendor/beui/components/motion/tabs";
import { Button } from "./vendor/shadcn/ui/button";
import { Badge } from "./vendor/shadcn/ui/badge";
import { Switch } from "./vendor/shadcn/ui/switch";
import { Slider } from "./vendor/shadcn/ui/slider";
import {
  Tabs as STabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "./vendor/shadcn/ui/tabs";
import {
  Accordion as SAccordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "./vendor/shadcn/ui/accordion";
import { CoralGlowBackground } from "./vendor/opensource/coral-glow-background";
import { AuroraBackground } from "./vendor/opensource/aurora-background";
const options = [
  { value: "day", label: "Day" },
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
];
function Counter() {
  const [n, set] = useState(128);
  return (
    <div className="demo-stack">
      <AnimatedCounter
        value={n}
        className="text-5xl font-medium tracking-tight"
      />
      <button className="demo-action" onClick={() => set(n + 1)}>
        Add one ↗
      </button>
    </div>
  );
}
function Flash() {
  const [n, set] = useState(1248);
  return (
    <div className="demo-stack">
      <ValueFlash value={n} className="text-4xl" />
      <button
        className="demo-action"
        onClick={() => set(n + Math.round(Math.random() * 80 - 30))}
      >
        Update value
      </button>
    </div>
  );
}
function Progress() {
  const [n, set] = useState(36);
  return (
    <div className="w-full max-w-56 space-y-5">
      <ProgressBar value={n} label="Upload progress" />
      <button
        className="demo-action"
        onClick={() => set(n >= 100 ? 0 : Math.min(100, n + 16))}
      >
        Upload · {n}%
      </button>
    </div>
  );
}
function Toggle() {
  const [on, set] = useState(true);
  return <BeSwitch checked={on} onCheckedChange={set} label="Sound effects" />;
}
function Bell() {
  const [n, set] = useState(3);
  return (
    <NotificationBell
      count={n}
      onClick={() => set(n ? 0 : 3)}
      aria-label="Toggle notifications"
    />
  );
}
function Delete() {
  const [gone, set] = useState(false);
  return (
    <div className="demo-stack">
      {gone ? (
        <button className="demo-action" onClick={() => set(false)}>
          Deleted. Reset demo ↻
        </button>
      ) : (
        <DeleteButton onClick={() => set(true)}>Delete draft</DeleteButton>
      )}
    </div>
  );
}
function ShadButton() {
  const [n, set] = useState(false);
  return (
    <div className="flex gap-2">
      <Button onClick={() => set(!n)}>{n ? "Saved" : "Save changes"}</Button>
      <Button variant="outline" onClick={() => set(false)}>
        Cancel
      </Button>
    </div>
  );
}
function SkeletonDemo() {
  const [ready, set] = useState(false);
  return (
    <div className="w-full max-w-60">
      <SkeletonSwap ready={ready}>
        <p className="text-sm leading-6">
          A little anticipation. Then everything falls into place.
        </p>
      </SkeletonSwap>
      <button className="demo-action mt-5" onClick={() => set(!ready)}>
        {ready ? "Load again" : "Show content"}
      </button>
    </div>
  );
}
function NewItems() {
  const [n, set] = useState(4);
  return (
    <div className="demo-stack relative w-full">
      <NewItemsPill count={n} onJump={() => set(0)} />
      <button className="demo-action mt-12" onClick={() => set(n + 1)}>
        Add a new item
      </button>
    </div>
  );
}
const LibraryImage = lazy(() => import("./library-image"));
export const previews: Record<string, ComponentType<{ dark?: boolean }>> = {
  "libraries:image": LibraryImage,
  "interior:icon-morph": () => <IconMorph preset="play-pause" showLabel />,
  "interior:skeleton-swap": SkeletonDemo,
  "interior:new-items-pill": NewItems,
  "interior:logo-marquee": () => (
    <LogoMarquee
      items={[
        { id: "1", label: "Studio" },
        { id: "2", label: "Forma" },
        { id: "3", label: "Fieldwork" },
        { id: "4", label: "Ordinary" },
      ]}
    />
  ),
  "rare:bounce-sidebar": () => (
    <BounceSidebar items={["Overview", "Projects", "Bookmarks", "Settings"]} />
  ),
  "beautiful:loading-state": () => (
    <div className="beautiful-demo">
      <LoadingState label="Gathering ideas" />
    </div>
  ),
  "beautiful:thinking-state": () => (
    <div className="beautiful-demo w-full">
      <ThinkingState />
    </div>
  ),
  "amicro:apple-pulse-dots": ApplePulseDots,
  "interior:copy-button": () => (
    <CopyButton value="Good details make great interfaces." label="Copy text" />
  ),
  "interior:loading-button": () => (
    <LoadingButton
      onAction={() => new Promise((r) => setTimeout(r, 1100))}
      pendingLabel="Publishing"
      successLabel="Published"
    >
      Publish changes
    </LoadingButton>
  ),
  "interior:like-burst": () => <LikeBurst initialCount={128} />,
  "interior:press-depth": () => (
    <PressDepth className="rounded-xl bg-stone-900 px-6 py-3 text-white">
      Press and feel
    </PressDepth>
  ),
  "interior:segmented-control": () => (
    <SegmentedControl options={options} label="Time period" />
  ),
  "interior:typing-indicator": () => (
    <TypingIndicator typists={["Alex", "Sam"]} />
  ),
  "interior:progress-bar": Progress,
  "interior:floating-label": () => (
    <FloatingLabelInput
      label="Email address"
      type="email"
      hint="A label that stays with you."
    />
  ),
  "interior:accordion": () => (
    <Accordion
      items={[
        {
          id: "one",
          title: "Consider every detail",
          content: "Small interactions make software feel considered.",
        },
        {
          id: "two",
          title: "Make it your own",
          content: "Original source, ready for your project.",
        },
      ]}
    />
  ),
  "interior:tabs": () => (
    <Tabs
      items={options}
      label="Time period"
      renderPanel={(v) => (
        <p className="mt-5 text-sm text-stone-500">Your {v}, at a glance.</p>
      )}
    />
  ),
  "interior:show-more": () => (
    <ShowMore lines={2}>
      <p className="text-sm leading-7 text-stone-600">
        The best interfaces feel effortless. Every detail has a purpose. A
        little motion explains what happened. A thoughtful transition helps you
        find your place. Simple things, done with care.
      </p>
    </ShowMore>
  ),
  "interior:value-flash": Flash,
  "interior:text-reveal": () => (
    <TextReveal
      text="Small details. Big difference."
      className="text-3xl font-medium tracking-tight"
    />
  ),
  "rare:folder-component": () => <FolderComponent size="sm" color="blue" />,
  "rare:animated-counter": Counter,
  "rare:notification-bell": Bell,
  "rare:delete-button": Delete,
  "beui:tilt-card": () => (
    <TiltCard className="w-56 rounded-2xl border border-white/70 bg-[#b9cbbb] p-6 text-[#243b2c] shadow-xl">
      <span className="text-xs uppercase tracking-widest">
        FIELD NOTES / 001
      </span>
      <div className="py-7 text-3xl leading-tight tracking-tight">
        A different
        <br />
        perspective.
      </div>
      <span className="text-xs">Move your cursor ↗</span>
    </TiltCard>
  ),
  "beui:switch": Toggle,
  "beui:tabs": () => (
    <BeTabs defaultValue="day">
      <BeTabsList>
        {options.map((o) => (
          <BeTabsTrigger key={o.value} value={o.value}>
            {o.label}
          </BeTabsTrigger>
        ))}
      </BeTabsList>
      {options.map((o) => (
        <BeTabsContent key={o.value} value={o.value}>
          <p className="mt-4 text-center text-sm text-stone-500">
            Your {o.value}, at a glance.
          </p>
        </BeTabsContent>
      ))}
    </BeTabs>
  ),
  "shadcn:button": ShadButton,
  "shadcn:badge": () => (
    <div className="flex flex-wrap gap-2">
      <Badge>Published</Badge>
      <Badge variant="secondary">Draft</Badge>
      <Badge variant="outline">In review</Badge>
    </div>
  ),
  "shadcn:switch": () => (
    <label className="flex items-center gap-3 text-sm">
      <Switch defaultChecked />
      Sound effects
    </label>
  ),
  "shadcn:slider": () => (
    <Slider aria-label="Volume" defaultValue={[65]} className="max-w-56" />
  ),
  "shadcn:tabs": () => (
    <STabs defaultValue="day">
      <TabsList>
        {options.map((o) => (
          <TabsTrigger key={o.value} value={o.value}>
            {o.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {options.map((o) => (
        <TabsContent key={o.value} value={o.value}>
          <p className="mt-4 text-sm text-stone-500">
            Your {o.value}, at a glance.
          </p>
        </TabsContent>
      ))}
    </STabs>
  ),
  "shadcn:accordion": () => (
    <SAccordion type="single" collapsible className="w-full">
      <AccordionItem value="one">
        <AccordionTrigger>Consider every detail</AccordionTrigger>
        <AccordionContent>
          Small interactions make software feel considered.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="two">
        <AccordionTrigger>Make it your own</AccordionTrigger>
        <AccordionContent>
          Original source, ready for your project.
        </AccordionContent>
      </AccordionItem>
    </SAccordion>
  ),
  "opensource:coral-glow-background": () => (
    <CoralGlowBackground className="absolute inset-0 grid place-content-center text-center">
      <span className="text-xs uppercase tracking-[.25em] text-orange-900/50">
        A softer kind of interface
      </span>
      <span className="mt-3 font-serif text-4xl text-orange-950">
        Stay a little longer.
      </span>
    </CoralGlowBackground>
  ),
  "opensource:aurora-background": () => (
    <AuroraBackground className="absolute inset-0 grid place-content-center">
      <span className="font-serif text-4xl text-white">
        Beyond the ordinary.
      </span>
    </AuroraBackground>
  ),
};
