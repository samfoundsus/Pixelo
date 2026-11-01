import { TOOLS_BY_SLUG, ToolId, ToolPageData } from '../data/tools';

const RECENT_TOOLS_KEY = 'pixelo-recent-tools';
const MAX_RECENT_TOOLS = 4;

export function getRecentToolSlugs(): ToolId[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(RECENT_TOOLS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((slug): slug is ToolId => Boolean(TOOLS_BY_SLUG[slug as ToolId]));
  } catch {
    return [];
  }
}

export function getRecentTools(): ToolPageData[] {
  return getRecentToolSlugs()
    .map((slug) => TOOLS_BY_SLUG[slug])
    .filter(Boolean);
}

export function recordRecentTool(slug: ToolId): void {
  if (typeof window === 'undefined' || !TOOLS_BY_SLUG[slug]) return;
  try {
    const current = getRecentToolSlugs().filter((s) => s !== slug);
    const updated = [slug, ...current].slice(0, MAX_RECENT_TOOLS);
    localStorage.setItem(RECENT_TOOLS_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('pixelo-recent-tools-updated'));
  } catch {}
}
