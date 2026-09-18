import type { ComponentType } from 'react';
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
