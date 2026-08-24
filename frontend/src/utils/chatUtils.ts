import type { ParsedResponse } from "../types/chat";

export function parseAIResponse(content: string): ParsedResponse {
    const sourcePattern = /\**Fontes?:\**\s*((?:\[\[.*?\]\](?:,\s*)?)+)/i;
    const match = content.match(sourcePattern);
  
    if (!match) {
      return { text: content.trim(), sources: [] };
    }
  
    const text = content.replace(match[0], '').trim();
    const sourcesRaw = match[1];
    const sources = Array.from(sourcesRaw.matchAll(/\[\[(.*?)\]\]/g)).map((m) =>
        m[1].replace(/\.md$/i, '')
      );
  
    return { text, sources };
  }