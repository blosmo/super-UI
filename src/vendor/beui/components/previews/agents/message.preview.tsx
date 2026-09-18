"use client";

import { ChatPreview } from "./chat-preview";

export function MessagePreview() {
  return (
    <ChatPreview
      showAvatars
      showMetadata
      assistantVariant="ghost"
      placeholder="Ask a follow-up…"
    />
  );
}
