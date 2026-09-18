"use client";

import { IconMorph } from "@/vendor/interior/components/icon-morph";

export function IconMorphDemo() {
  return (
    <div className="flex items-center justify-center gap-3">
      <IconMorph preset="play-pause" semantics="pressed" />
      <IconMorph preset="menu-close" semantics="expanded" />
    </div>
  );
}
