"use client";

import React, { useState, useEffect } from "react";
import { Command } from "cmdk";
import { Drawer } from "vaul";
import { Search, Clock, BookOpen, X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "./dialog";
import { TOOLS_DATA, TOOL_CATEGORIES } from "../../data/tools";
import { BLOG_ARTICLES } from "../../data/blog";
import { ToolGlyph } from "../Header";
import { getRecentTools } from "../../lib/recent-tools";

export interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectPath: (path: string) => void;
}

/**
 * Command Palette built with cmdk (MIT) + shadcn Dialog on desktop and vaul Drawer (MIT) bottom sheet on mobile.
 * Opens with Cmd/Ctrl+K or the header search button.
 */
export function CommandPalette({
  open,
  onOpenChange,
  onSelectPath,
}: CommandPaletteProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [recentTools, setRecentTools] = useState(() => getRecentTools());

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(max-width: 639px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (open) {
      setRecentTools(getRecentTools());
    }
  }, [open]);

  const handleChoose = (path: string) => {
    onOpenChange(false);
    onSelectPath(path);
  };

  const commandListContent = (
    <Command
      label="Jump to tool or guide"
      className="flex h-full w-full flex-col overflow-hidden bg-white dark:bg-[#161616] text-[#1A1A1A] dark:text-[#EDEDEA]"
    >
      <div className="flex items-center gap-[10px] border-b border-[#E7E5E0] dark:border-[#262624] px-[14px]">
        <Search
          strokeWidth={1.5}
          className="h-[17px] w-[17px] shrink-0 text-[#6B6B66] dark:text-[#9B9B95]"
          aria-hidden="true"
        />
        <Command.Input
          autoFocus
          placeholder="Search 14 image tools or guides..."
          className="min-h-[52px] w-full bg-transparent text-[16px] text-[#1A1A1A] dark:text-[#EDEDEA] placeholder:text-[#6B6B66] dark:placeholder:text-[#9B9B95] focus:outline-none"
        />
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          aria-label="Close search"
          className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-[8px] text-[#6B6B66] hover:text-[#1A1A1A] dark:text-[#9B9B95] dark:hover:text-[#EDEDEA] cursor-pointer"
        >
          <X strokeWidth={1.5} className="h-[16px] w-[16px]" />
        </button>
      </div>

      <Command.List className="max-h-[65dvh] sm:max-h-[380px] overflow-y-auto p-[8px] space-y-[12px]">
        <Command.Empty className="py-[32px] text-center text-sm text-[#6B6B66] dark:text-[#9B9B95]">
          No matching tools found. Try &ldquo;20kb&rdquo;, &ldquo;passport&rdquo;, or &ldquo;pdf&rdquo;.
        </Command.Empty>

        {recentTools.length > 0 && (
          <Command.Group
            heading="Recent tools"
            className="text-xs font-medium text-[#6B6B66] dark:text-[#9B9B95] [&_[cmdk-group-heading]]:px-[10px] [&_[cmdk-group-heading]]:py-[6px]"
          >
            {recentTools.map((tool) => (
              <Command.Item
                key={`recent-${tool.slug}`}
                value={`recent ${tool.name} ${tool.shortDescription}`}
                onSelect={() => handleChoose(tool.path)}
                className="group min-h-[48px] flex items-center justify-between gap-[10px] rounded-[10px] px-[10px] py-[8px] text-sm text-[#1A1A1A] dark:text-[#EDEDEA] data-[selected=true]:bg-[#F7F6F3] dark:data-[selected=true]:bg-[#0E0E0E] cursor-pointer select-none"
              >
                <div className="flex items-center gap-[10px] min-w-0">
                  <Clock strokeWidth={1.5} className="w-[15px] h-[15px] shrink-0 text-[#E5542B]" />
                  <span className="font-medium truncate">{tool.name}</span>
                </div>
                <span className="text-xs text-[#6B6B66] dark:text-[#9B9B95] shrink-0">→</span>
              </Command.Item>
            ))}
          </Command.Group>
        )}

        {TOOL_CATEGORIES.map((cat) => (
          <Command.Group
            key={cat.name}
            heading={cat.name}
            className="text-xs font-medium text-[#6B6B66] dark:text-[#9B9B95] [&_[cmdk-group-heading]]:px-[10px] [&_[cmdk-group-heading]]:py-[6px]"
          >
            {TOOLS_DATA.filter((t) => t.category === cat.name).map((tool) => (
              <Command.Item
                key={tool.slug}
                value={`${tool.name} ${tool.category} ${tool.shortDescription} ${tool.slug}`}
                onSelect={() => handleChoose(tool.path)}
                className="group min-h-[48px] flex items-center justify-between gap-[10px] rounded-[10px] px-[10px] py-[8px] text-sm text-[#1A1A1A] dark:text-[#EDEDEA] data-[selected=true]:bg-[#F7F6F3] dark:data-[selected=true]:bg-[#0E0E0E] cursor-pointer select-none"
              >
                <div className="flex items-center gap-[10px] min-w-0">
                  <ToolGlyph slug={tool.slug} />
                  <div className="min-w-0">
                    <div className="font-medium truncate">{tool.name}</div>
                    <div className="text-xs text-[#6B6B66] dark:text-[#9B9B95] truncate">
                      {tool.shortDescription}
                    </div>
                  </div>
                </div>
                <span className="text-xs text-[#6B6B66] dark:text-[#9B9B95] group-data-[selected=true]:text-[#E5542B] shrink-0">
                  →
                </span>
              </Command.Item>
            ))}
          </Command.Group>
        ))}

        <Command.Group
          heading="Guides"
          className="text-xs font-medium text-[#6B6B66] dark:text-[#9B9B95] [&_[cmdk-group-heading]]:px-[10px] [&_[cmdk-group-heading]]:py-[6px]"
        >
          {BLOG_ARTICLES.map((article) => (
            <Command.Item
              key={article.slug}
              value={`guide ${article.h1} ${article.category}`}
              onSelect={() => handleChoose(article.path)}
              className="group min-h-[48px] flex items-center justify-between gap-[10px] rounded-[10px] px-[10px] py-[8px] text-sm text-[#1A1A1A] dark:text-[#EDEDEA] data-[selected=true]:bg-[#F7F6F3] dark:data-[selected=true]:bg-[#0E0E0E] cursor-pointer select-none"
            >
              <div className="flex items-center gap-[10px] min-w-0">
                <BookOpen
                  strokeWidth={1.5}
                  className="w-[15px] h-[15px] shrink-0 text-[#6B6B66] dark:text-[#9B9B95]"
                />
                <span className="truncate">{article.h1}</span>
              </div>
              <span className="text-xs text-[#6B6B66] dark:text-[#9B9B95] shrink-0">→</span>
            </Command.Item>
          ))}
        </Command.Group>
      </Command.List>
    </Command>
  );

  if (isMobile) {
    return (
      <Drawer.Root open={open} onOpenChange={onOpenChange}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 z-50 bg-black/45 backdrop-blur-[2px]" />
          <Drawer.Content
            style={{
              paddingBottom: "env(safe-area-inset-bottom, 16px)",
            }}
            className="fixed inset-x-0 bottom-0 z-50 mt-[24px] flex max-h-[86dvh] flex-col rounded-t-[14px] border-t border-[#E7E5E0] dark:border-[#262624] bg-white dark:bg-[#161616] outline-none"
          >
            <Drawer.Title className="sr-only">Search tools and guides</Drawer.Title>
            <Drawer.Description className="sr-only">
              Jump directly to any Pixelo image utility or editorial guide.
            </Drawer.Description>
            <div className="mx-auto my-[10px] h-[4px] w-[40px] rounded-full bg-[#E7E5E0] dark:bg-[#262624]" />
            {commandListContent}
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showClose={false} className="p-0 overflow-hidden max-w-[540px]">
        <DialogTitle className="sr-only">Search tools and guides</DialogTitle>
        <DialogDescription className="sr-only">
          Jump directly to any Pixelo image utility or editorial guide.
        </DialogDescription>
        {commandListContent}
      </DialogContent>
    </Dialog>
  );
}

export default CommandPalette;
