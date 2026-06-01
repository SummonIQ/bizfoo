"use client";

import {
  cloneElement,
  Fragment,
  isValidElement,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent,
  type ReactElement,
} from "react";
import { motion } from "framer-motion";
import {
  BarChart3,
  Bold,
  ChevronDown,
  Code2,
  GripVertical,
  Heading2,
  Heading3,
  Image,
  Italic,
  Link2,
  List,
  ListOrdered,
  MoreHorizontal,
  PanelRightClose,
  PanelRightOpen,
  Pilcrow,
  Redo2,
  Sparkles,
  Strikethrough,
  TextQuote,
  Undo2,
  Workflow,
  Underline,
} from "lucide-react";
import { DndPlugin, useDndNode, useDropLine } from "@platejs/dnd";
import {
  BlockquotePlugin,
  BoldPlugin,
  CodePlugin,
  H2Plugin,
  H3Plugin,
  ItalicPlugin,
  StrikethroughPlugin,
  UnderlinePlugin,
} from "@platejs/basic-nodes/react";
import { unwrapLink, upsertLink } from "@platejs/link";
import { LinkPlugin, useLink } from "@platejs/link/react";
import { ListStyleType, someList, toggleList } from "@platejs/list";
import { ListPlugin } from "@platejs/list/react";
import { MarkdownPlugin } from "@platejs/markdown";
import {
  BlockSelectionPlugin,
  useBlockSelectable,
  useBlockSelected,
} from "@platejs/selection/react";
import { HTML5Backend } from "react-dnd-html5-backend";
import { DndProvider } from "react-dnd";
import { HistoryPlugin, KEYS, NodeIdPlugin, type TElement, type Value } from "platejs";
import {
  BlockPlaceholderPlugin,
  Plate,
  PlateContainer,
  PlateContent,
  PlateElement,
  PlateLeaf,
  useEditorRef,
  useEditorSelector,
  usePlateEditor,
} from "platejs/react";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";

type EditorMode = "public" | "internal";
type EditorSize = "sm" | "md" | "lg";
type GuideVisualKind = "diagram" | "chart";
type EditorBlockType = "p" | "h2" | "h3" | "blockquote";
type GuideVisualTemplate = {
  id: string;
  label: string;
  kind: GuideVisualKind;
  title: string;
  subtitle: string;
  items: string;
};
type EditorPreviewBlock =
  | { type: "heading"; level: 2 | 3; text: string }
  | { type: "paragraph"; text: string }
  | { type: "blockquote"; text: string }
  | { type: "bullets"; items: string[] }
  | { type: "numbered"; items: string[] }
  | { type: "image"; alt: string; src: string }
  | { type: "diagram"; title: string; subtitle: string; steps: { label: string; detail: string }[] }
  | { type: "chart"; title: string; subtitle: string; bars: { label: string; value: number; color: string }[] };

const EMPTY_VALUE: Value = [{ type: "p", children: [{ text: "" }] }];
const BLOCK_TYPE_OPTIONS = [
  { type: "p" as const, label: "Paragraph", shortLabel: "Paragraph", icon: Pilcrow },
  { type: "h2" as const, label: "Heading 2", shortLabel: "H2", icon: Heading2 },
  { type: "h3" as const, label: "Heading 3", shortLabel: "H3", icon: Heading3 },
  { type: "blockquote" as const, label: "Blockquote", shortLabel: "Quote", icon: TextQuote },
];
const GUIDE_VISUAL_TEMPLATES: GuideVisualTemplate[] = [
  {
    id: "diagram-flow",
    label: "Flow chart",
    kind: "diagram",
    title: "Operating loop",
    subtitle: "Keep the flow visible instead of implied",
    items: [
      "Observe|Review the latest signals before acting",
      "Decide|Choose the one decision that matters now",
      "Communicate|Make ownership and timing explicit",
      "Follow through|Check whether the change actually stuck",
    ].join("\n"),
  },
  {
    id: "diagram-architecture",
    label: "Architecture",
    kind: "diagram",
    title: "Guide delivery architecture",
    subtitle: "Show the path from authoring to buyer delivery",
    items: [
      "Authoring UI|Rich text, charts, and image blocks live in Bizfoo",
      "Storage|Guide markdown and assets are stored with the product",
      "Rendering|SummonIQ reads the guide and renders the sample + full reader",
      "Delivery|PDF export and buyer access resolve from the same source",
    ].join("\n"),
  },
  {
    id: "diagram-review",
    label: "Review loop",
    kind: "diagram",
    title: "Weekly review loop",
    subtitle: "A lightweight cadence for tech lead control",
    items: [
      "Signals|Read delivery, incidents, and team load before planning",
      "Decisions|Pick the one or two priorities that need your intervention",
      "Communication|Set the tradeoffs in writing for engineers and partners",
      "Follow-up|Check whether the decision changed the system next week",
    ].join("\n"),
  },
  {
    id: "chart-bar",
    label: "Bar chart",
    kind: "chart",
    title: "Capacity split",
    subtitle: "Show where lead time is really going",
    items: [
      "Delivery control|40|#A3E635",
      "People leadership|25|#38BDF8",
      "Reliability|20|#F59E0B",
      "Planning|15|#F472B6",
    ].join("\n"),
  },
  {
    id: "chart-line",
    label: "Line chart",
    kind: "chart",
    title: "Incident trend",
    subtitle: "Track whether the system is stabilizing over time",
    items: [
      "Week 1|8|#38BDF8",
      "Week 2|6|#38BDF8",
      "Week 3|5|#38BDF8",
      "Week 4|3|#38BDF8",
    ].join("\n"),
  },
  {
    id: "chart-donut",
    label: "Donut",
    kind: "chart",
    title: "Meeting load",
    subtitle: "Make calendar pressure visible before it takes over",
    items: [
      "Team rituals|35|#A3E635",
      "Cross-functional|30|#38BDF8",
      "Hiring|20|#F59E0B",
      "1:1s|15|#F472B6",
    ].join("\n"),
  },
];
const DEFAULT_VISUAL_TITLES: Record<GuideVisualKind, string> = {
  diagram: "Untitled diagram",
  chart: "Untitled chart",
};
const ILLUSTRATION_STYLE_OPTIONS = [
  { value: "storybook", label: "Storybook watercolor" },
  { value: "technical", label: "Technical handbook line art" },
  { value: "blueprint", label: "Blueprint sketch" },
  { value: "ink", label: "Ink wash" },
  { value: "custom", label: "Custom style" },
] as const;
const BODY_SHARED_CLASS =
  "w-full overflow-x-hidden whitespace-pre-wrap break-words pr-5 pb-5 text-sm leading-7 text-foreground";
const EDITOR_BODY_CLASS = `${BODY_SHARED_CLASS} pl-7 pt-0`;
const PARAGRAPH_CLASS = "mb-3 mt-0 leading-7 text-foreground last:mb-0";
const HEADING_TWO_CLASS = "mb-2 mt-5 first:mt-0 text-lg font-semibold tracking-tight text-foreground";
const HEADING_THREE_CLASS = "mb-2 mt-4 first:mt-0 text-base font-semibold tracking-tight text-foreground";
const EDITOR_HEADING_TWO_CLASS = "mb-2 mt-0 text-lg font-semibold tracking-tight text-foreground";
const EDITOR_HEADING_THREE_CLASS = "mb-2 mt-0 text-base font-semibold tracking-tight text-foreground";
const BLOCKQUOTE_CLASS =
  "my-4 first:mt-0 border-l-2 border-brand-400/45 pl-4 text-[0.95rem] leading-7 text-foreground/78 italic";
const LINK_CLASS = "text-brand-500 underline underline-offset-4";
const INLINE_CODE_CLASS =
  "rounded bg-muted px-[0.4em] py-[0.22em] font-mono text-[0.9em] text-foreground";
const BULLET_LIST_CLASS =
  "mb-3 mt-0 list-disc pl-5 marker:text-muted-foreground [&_li]:py-0.5";
const NUMBERED_LIST_CLASS =
  "mb-3 mt-0 list-decimal pl-5 marker:text-muted-foreground [&_li]:py-0.5";
const PREVIEW_MIN_WIDTH = 280;
const PREVIEW_DEFAULT_WIDTH = 500;
const PREVIEW_MAX_WIDTH = 560;

function normalizeMarkdown(value: string | null | undefined) {
  return (value ?? "")
    .replace(/\u200B/g, "")
    .split(/\r?\n/)
    .map((line) => {
      const unescaped = line.replace(/\\\[/g, "[").replace(/\\\]/g, "]");
      return /^\[\[(diagram|chart)\b/.test(unescaped) ? unescaped : line;
    })
    .join("\n")
    .replace(/\s+$/, "");
}

function BlockElement(props: any) {
  const blockRef = useRef<HTMLDivElement | null>(null);
  const blockId =
    typeof (props.element as { id?: unknown } | undefined)?.id === "string"
      ? (props.element as { id: string }).id
      : undefined;
  const selectable = useBlockSelectable();
  const isSelected = Boolean(useBlockSelected(blockId));
  const { dragRef, isDragging } = useDndNode({
    element: props.element,
    nodeRef: blockRef,
  });
  const { dropLine } = useDropLine({ id: blockId });
  const setHandleRef = useCallback(
    (node: HTMLButtonElement | null) => {
      if (!node) return;
      dragRef(node);
    },
    [dragRef],
  );

  return (
    <PlateElement
      ref={blockRef as any}
      {...props}
      onContextMenu={selectable.props.onContextMenu}
      data-selected={isSelected ? "true" : "false"}
      className={cn(
        "group/block relative rounded-md transition-[background-color,box-shadow,opacity]",
        selectable.props.className,
        isSelected && "bg-muted/55 shadow-[inset_0_0_0_1px_rgba(168,240,21,0.32)]",
        isDragging && "opacity-60",
        props.className,
      )}
    >
      {dropLine === "top" ? (
        <div
          contentEditable={false}
          className="pointer-events-none absolute left-[-1.1rem] right-0 top-0 h-px bg-brand-400"
        />
      ) : null}
      {dropLine === "bottom" ? (
        <div
          contentEditable={false}
          className="pointer-events-none absolute left-[-1.1rem] right-0 bottom-0 h-px bg-brand-400"
        />
      ) : null}
      <button
        ref={setHandleRef}
        type="button"
        tabIndex={-1}
        aria-label="Drag block"
        contentEditable={false}
        className="absolute left-[-1.6rem] top-2 z-10 flex h-7 w-7 items-center justify-center rounded-md border border-border/80 bg-background text-muted-foreground opacity-0 shadow-sm transition hover:text-foreground group-hover/block:opacity-100 group-focus-within/block:opacity-100"
        onMouseDown={(event) => event.preventDefault()}
      >
        <GripVertical className="size-3.5" />
      </button>
      {props.children}
    </PlateElement>
  );
}

function getPlainElementText(node: unknown): string {
  if (!node || typeof node !== "object") return "";

  if ("text" in node && typeof (node as { text?: unknown }).text === "string") {
    return (node as { text: string }).text;
  }

  if ("children" in node && Array.isArray((node as { children?: unknown[] }).children)) {
    return ((node as { children: unknown[] }).children ?? []).map(getPlainElementText).join("");
  }

  return "";
}

function ParagraphNode(props: any) {
  const text = getPlainElementText(props.element);
  const image = parsePreviewImage(text);
  const visual = parsePreviewVisual(text);

  if (image) {
    return (
      <BlockElement className={PARAGRAPH_CLASS} {...props}>
        <div contentEditable={false} className="mb-3">
          <PreviewImageCard block={image} className="my-0" />
        </div>
        <div className="rounded-xl border border-border/80 bg-surface/60 px-3 py-2 font-mono text-xs leading-6 text-muted-foreground">
          {props.children}
        </div>
      </BlockElement>
    );
  }

  if (visual?.type === "diagram") {
    return (
      <BlockElement className={PARAGRAPH_CLASS} {...props}>
        <div contentEditable={false} className="mb-3">
          <PreviewDiagramCard block={visual} className="my-0" />
        </div>
        <div className="rounded-xl border border-border/80 bg-surface/60 px-3 py-2 font-mono text-xs leading-6 text-muted-foreground">
          {props.children}
        </div>
      </BlockElement>
    );
  }

  if (visual?.type === "chart") {
    return (
      <BlockElement className={PARAGRAPH_CLASS} {...props}>
        <div contentEditable={false} className="mb-3">
          <PreviewChartCard block={visual} className="my-0" />
        </div>
        <div className="rounded-xl border border-border/80 bg-surface/60 px-3 py-2 font-mono text-xs leading-6 text-muted-foreground">
          {props.children}
        </div>
      </BlockElement>
    );
  }

  return <BlockElement className={PARAGRAPH_CLASS} {...props} />;
}

function HeadingNode(props: any) {
  const nodeType = (props.element as { type?: string } | undefined)?.type;
  const className =
    nodeType === "h2"
      ? EDITOR_HEADING_TWO_CLASS
      : EDITOR_HEADING_THREE_CLASS;

  return <BlockElement as={nodeType === "h2" ? "h3" : "h4"} className={className} {...props} />;
}

function BlockquoteNode(props: any) {
  return <BlockElement as="blockquote" className={BLOCKQUOTE_CLASS} {...props} />;
}

function LinkNode(props: any) {
  const { props: linkProps } = useLink({ element: props.element });
  return (
    <PlateElement
      {...props}
      as="a"
      attributes={{ ...props.attributes, ...linkProps }}
      className={LINK_CLASS}
    />
  );
}

function CodeLeaf(props: any) {
  return <PlateLeaf {...props} as="code" className={INLINE_CODE_CLASS} />;
}

function setBlockType(editor: ReturnType<typeof useEditorRef>, type: EditorBlockType) {
  editor.tf.withoutNormalizing(() => {
    const entries = editor.api.blocks<TElement>({ mode: "lowest" });
    entries.forEach(([node, path]) => {
      if ((node as any)[KEYS.listType]) {
        editor.tf.unsetNodes([KEYS.listType, "indent"], { at: path });
      }
      if (node.type !== type) {
        editor.tf.setNodes({ type }, { at: path });
      }
    });
  });
}

function getCurrentBlockType(editor: ReturnType<typeof useEditorRef>) {
  const [block] = editor.api.block<TElement>() ?? [];
  if (block?.type === "h2" || block?.type === "h3" || block?.type === "blockquote") {
    return block.type as EditorBlockType;
  }
  return "p";
}

function sanitizeShortcodeValue(value: string) {
  return value.replace(/"/g, "'").replace(/\s+/g, " ").trim();
}

function buildGuideVisualShortcode({
  kind,
  title,
  subtitle,
  items,
}: {
  kind: GuideVisualKind;
  title: string;
  subtitle: string;
  items: string;
}) {
  const key = kind === "diagram" ? "steps" : "bars";
  const serializedItems = items
    .split(/\r?\n/)
    .map((line) => sanitizeShortcodeValue(line))
    .filter(Boolean)
    .join(";");

  const attrs = [
    `title="${sanitizeShortcodeValue(title) || DEFAULT_VISUAL_TITLES[kind]}"`,
    subtitle.trim()
      ? `subtitle="${sanitizeShortcodeValue(subtitle)}"`
      : null,
    `${key}="${serializedItems}"`,
  ].filter(Boolean);

  return `[[${kind} ${attrs.join(" ")}]]`;
}

function insertMarkdownBlock(
  editor: ReturnType<typeof useEditorRef>,
  markdown: string,
) {
  editor.tf.insertNodes([
    { type: "p", children: [{ text: markdown }] },
    { type: "p", children: [{ text: "" }] },
  ] as Value);
}

function replaceCurrentMatchingBlock(
  editor: ReturnType<typeof useEditorRef>,
  markdown: string,
  matcher: (text: string) => boolean,
) {
  const entry = editor.api.block<TElement>();
  if (!entry) return false;

  const [block, path] = entry;
  if (!matcher(getPlainElementText(block))) return false;

  editor.tf.withoutNormalizing(() => {
    editor.tf.removeNodes({ at: path });
    editor.tf.insertNodes({ type: "p", children: [{ text: markdown }] }, { at: path });
  });

  return true;
}

function parseShortcodeAttributes(source: string) {
  const attrs: Record<string, string> = {};
  for (const match of source.matchAll(/([a-z]+)="([^"]*)"/g)) {
    attrs[match[1]] = match[2];
  }
  return attrs;
}

function normalizePreviewColor(value: string | undefined) {
  const normalized = value?.trim().toUpperCase() ?? "";
  return /^#[0-9A-F]{6}$/.test(normalized) ? normalized : "#A3E635";
}

function parsePreviewVisual(block: string): EditorPreviewBlock | null {
  const normalizedBlock = normalizeMarkdown(block).trim();
  const match = normalizedBlock.match(/^\[\[(diagram|chart)\s+([\s\S]+)\]\]$/);
  if (!match) return null;

  const kind = match[1];
  const attrs = parseShortcodeAttributes(match[2]);
  const title = attrs.title?.trim();
  if (!title) return null;
  const subtitle = attrs.subtitle?.trim() ?? "";

  if (kind === "diagram") {
    const steps = (attrs.steps ?? "")
      .split(";")
      .map((entry) => entry.trim())
      .filter(Boolean)
      .map((entry) => {
        const [label, detail] = entry.split("|");
        return {
          label: label?.trim() ?? "",
          detail: detail?.trim() ?? "",
        };
      })
      .filter((step) => step.label && step.detail);

    return steps.length > 0 ? { type: "diagram", title, subtitle, steps } : null;
  }

  const bars = (attrs.bars ?? "")
    .split(";")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const [label, rawValue, color] = entry.split("|");
      return {
        label: label?.trim() ?? "",
        value: Number(rawValue?.trim()),
        color: normalizePreviewColor(color),
      };
    })
    .filter((bar) => bar.label && Number.isFinite(bar.value) && bar.value > 0);

  return bars.length > 0 ? { type: "chart", title, subtitle, bars } : null;
}

function parsePreviewImage(block: string): Extract<EditorPreviewBlock, { type: "image" }> | null {
  const normalizedBlock = normalizeMarkdown(block).trim();
  const match = normalizedBlock.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
  if (!match) return null;

  const alt = match[1]?.trim() ?? "";
  const src = match[2]?.trim() ?? "";
  if (!src) return null;
  return { type: "image", alt, src };
}

function serializeVisualItems(block: Extract<EditorPreviewBlock, { type: "diagram" | "chart" }>) {
  if (block.type === "diagram") {
    return block.steps.map((step) => `${step.label}|${step.detail}`).join("\n");
  }

  return block.bars.map((bar) => `${bar.label}|${bar.value}|${bar.color}`).join("\n");
}

function parsePreviewTextBlock(lines: string[]): EditorPreviewBlock | null {
  if (lines.length === 0) return null;

  if (lines.length === 1 && lines[0].startsWith("## ")) {
    return { type: "heading", level: 2, text: lines[0].slice(3) };
  }

  if (lines.length === 1 && lines[0].startsWith("### ")) {
    return { type: "heading", level: 3, text: lines[0].slice(4) };
  }

  if (lines.every((line) => line.startsWith("> "))) {
    return {
      type: "blockquote",
      text: lines.map((line) => line.slice(2)).join(" "),
    };
  }

  if (lines.every((line) => /^- /.test(line))) {
    return {
      type: "bullets",
      items: lines.map((line) => line.slice(2)),
    };
  }

  if (lines.every((line) => /^\d+\.\s+/.test(line))) {
    return {
      type: "numbered",
      items: lines.map((line) => line.replace(/^\d+\.\s+/, "")),
    };
  }

  return {
    type: "paragraph",
    text: lines.join(" "),
  };
}

function parsePreviewBlocks(markdown: string): EditorPreviewBlock[] {
  return markdown
    .trim()
    .split(/\n\s*\n/)
    .map((block) =>
      block
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean),
    )
    .flatMap((lines) => {
      const parsed: EditorPreviewBlock[] = [];
      let textLines: string[] = [];

      function flushText() {
        const block = parsePreviewTextBlock(textLines);
        if (block) parsed.push(block);
        textLines = [];
      }

      lines.forEach((line) => {
        const visual = parsePreviewVisual(line);
        if (visual) {
          flushText();
          parsed.push(visual);
          return;
        }
        const image = parsePreviewImage(line);
        if (image) {
          flushText();
          parsed.push(image);
          return;
        }
        textLines.push(line);
      });

      flushText();
      return parsed;
    });
}

function renderInlinePreview(text: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  const re =
    /(\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*|`([^`]+)`|\*([^*]+)\*|_([^_]+)_)/g;
  let last = 0;
  let match: RegExpExecArray | null;
  let index = 0;

  while ((match = re.exec(text))) {
    if (match.index > last) nodes.push(text.slice(last, match.index));
    const token = match[0];

    if (match[2] && match[3]) {
      nodes.push(
        <a
          key={`l${index++}`}
          href={match[3]}
          target="_blank"
          rel="noreferrer"
          className={LINK_CLASS}
        >
          {match[2]}
        </a>,
      );
    } else if (match[4]) {
      nodes.push(
        <strong key={`b${index++}`} className="font-semibold text-foreground">
          {match[4]}
        </strong>,
      );
    } else if (match[5]) {
      nodes.push(
        <code
          key={`c${index++}`}
          className={INLINE_CODE_CLASS}
        >
          {match[5]}
        </code>,
      );
    } else {
      nodes.push(
        <em key={`i${index++}`} className="italic text-foreground">
          {match[6] ?? match[7]}
        </em>,
      );
    }

    last = match.index + token.length;
  }

  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

function PreviewDiagramCard({
  block,
  className,
}: {
  block: Extract<EditorPreviewBlock, { type: "diagram" }>;
  className?: string;
}) {
  return (
    <div className={cn("my-4 rounded-2xl border border-amber-400/20 bg-surface/70 p-4", className)}>
      <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-300/80">
        Diagram
      </div>
      <div className="mt-2 text-lg font-semibold tracking-tight text-foreground">{block.title}</div>
      {block.subtitle ? (
        <p className="mt-1 text-sm leading-7 text-muted-foreground">{block.subtitle}</p>
      ) : null}
      <div className="mt-4 grid gap-3">
        {block.steps.map((step, index) => (
          <div key={`${step.label}-${index}`} className="rounded-xl border border-border bg-input p-4">
            <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Step {index + 1}
            </div>
            <div className="mt-2 text-sm font-semibold text-foreground">{step.label}</div>
            <p className="mt-1 text-sm leading-7 text-muted-foreground">{step.detail}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function PreviewChartCard({
  block,
  className,
}: {
  block: Extract<EditorPreviewBlock, { type: "chart" }>;
  className?: string;
}) {
  const maxValue = Math.max(...block.bars.map((bar) => bar.value), 1);

  return (
    <div className={cn("my-4 rounded-2xl border border-sky-400/20 bg-surface/70 p-4", className)}>
      <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-300/80">
        Chart
      </div>
      <div className="mt-2 text-lg font-semibold tracking-tight text-foreground">{block.title}</div>
      {block.subtitle ? (
        <p className="mt-1 text-sm leading-7 text-muted-foreground">{block.subtitle}</p>
      ) : null}
      <div className="mt-4 space-y-3">
        {block.bars.map((bar) => (
          <div key={bar.label}>
            <div className="mb-1.5 flex items-center justify-between gap-3 text-xs text-muted-foreground">
              <span>{bar.label}</span>
              <span>{bar.value}</span>
            </div>
            <div className="h-2.5 rounded-full bg-surface-2/80">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${Math.max(10, (bar.value / maxValue) * 100)}%`,
                  backgroundColor: bar.color,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PreviewImageCard({
  block,
  className,
}: {
  block: Extract<EditorPreviewBlock, { type: "image" }>;
  className?: string;
}) {
  return (
    <div className={cn("my-4 overflow-hidden rounded-2xl border border-border bg-surface/70", className)}>
      <img
        src={block.src}
        alt={block.alt || "Guide image"}
        className="block h-auto max-h-[24rem] w-full object-cover"
      />
      {block.alt ? (
        <div className="border-t border-border/70 px-4 py-2 text-xs text-muted-foreground">
          {block.alt}
        </div>
      ) : null}
    </div>
  );
}

function RichMarkdownPreview({
  markdown,
  minHeightClass,
  maxHeightClass,
}: {
  markdown: string;
  minHeightClass: string;
  maxHeightClass: string;
}) {
  const blocks = useMemo(() => parsePreviewBlocks(markdown), [markdown]);
  if (blocks.length === 0) return null;

  return (
    <div
      className={cn(
        "h-full w-full overflow-x-hidden overflow-y-auto whitespace-pre-wrap break-words px-7 pb-5 pt-7 text-sm leading-7 text-foreground",
        minHeightClass,
        maxHeightClass,
      )}
    >
      <div className="flex flex-col">
        {blocks.map((block, blockIndex) => {
          if (block.type === "heading") {
            return block.level === 2 ? (
              <h3 key={blockIndex} className={HEADING_TWO_CLASS}>
                {renderInlinePreview(block.text)}
              </h3>
            ) : (
              <h4 key={blockIndex} className={HEADING_THREE_CLASS}>
                {renderInlinePreview(block.text)}
              </h4>
            );
          }

          if (block.type === "blockquote") {
            return (
              <blockquote key={blockIndex} className={BLOCKQUOTE_CLASS}>
                {renderInlinePreview(block.text)}
              </blockquote>
            );
          }

          if (block.type === "bullets") {
            return <ul key={blockIndex} className={BULLET_LIST_CLASS}>
              {block.items.map((item, itemIndex) => (
                <li key={itemIndex}>{renderInlinePreview(item)}</li>
              ))}
            </ul>;
          }

          if (block.type === "numbered") {
            return <ol key={blockIndex} className={NUMBERED_LIST_CLASS}>
              {block.items.map((item, itemIndex) => (
                <li key={itemIndex}>{renderInlinePreview(item)}</li>
              ))}
            </ol>;
          }

          if (block.type === "diagram") {
            return <PreviewDiagramCard key={blockIndex} block={block} />;
          }

          if (block.type === "chart") {
            return <PreviewChartCard key={blockIndex} block={block} />;
          }

          if (block.type === "image") {
            return <PreviewImageCard key={blockIndex} block={block} />;
          }

          return (
            <p key={blockIndex} className={PARAGRAPH_CLASS}>
              {renderInlinePreview(block.text)}
            </p>
          );
        })}
      </div>
    </div>
  );
}

function ToolbarActionButton({
  active,
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex h-8 min-w-8 cursor-default items-center justify-center rounded-md border border-transparent px-2 text-foreground/80 transition-colors",
        "hover:bg-muted hover:text-foreground",
        active && "border-border bg-muted text-foreground",
        className,
      )}
      onMouseDown={(event) => {
        event.preventDefault();
        props.onMouseDown?.(event);
      }}
      {...props}
    >
      {children}
    </button>
  );
}

interface OverflowToolbarItem {
  id: string;
  label: string;
  group?: string;
  element: ReactElement;
}

const MORE_BUTTON_RESERVED_PX = 36;
const GROUP_SEPARATOR_PX = 9;
const EDGE_SAFETY_PX = 3;

function OverflowToolbar({
  items,
  className,
}: {
  items: Array<OverflowToolbarItem>;
  className?: string;
}) {
  const rowRef = useRef<HTMLDivElement>(null);
  const mirrorRef = useRef<HTMLDivElement>(null);
  const mirrorItemRefs = useRef<Map<string, HTMLElement>>(new Map());
  const [hiddenIds, setHiddenIds] = useState<Array<string>>([]);
  const rafRef = useRef<number | null>(null);

  const setMirrorItemRef = useCallback((id: string, element: HTMLElement | null) => {
    if (element) {
      mirrorItemRefs.current.set(id, element);
    } else {
      mirrorItemRefs.current.delete(id);
    }
  }, []);

  const hiddenSet = useMemo(() => new Set(hiddenIds), [hiddenIds]);

  const doMeasure = useCallback(() => {
    const row = rowRef.current;
    if (!row) return;

    const rowWidth = row.getBoundingClientRect().width;
    const widthFor = (id: string) => {
      const element = mirrorItemRefs.current.get(id);
      if (!element) return 36;
      const width = element.getBoundingClientRect().width;
      return width > 0 ? width : 36;
    };
    const itemWidths = items.map((item) => widthFor(item.id));

    const separatorCount = items.reduce((count, item, index) => {
      const previous = items[index - 1];
      return previous?.group && item.group && previous.group !== item.group ? count + 1 : count;
    }, 0);

    const totalItemsWidth =
      itemWidths.reduce((total, width) => total + width, 0) + separatorCount * GROUP_SEPARATOR_PX;
    const availableWithoutMore = rowWidth - EDGE_SAFETY_PX;

    let next: Array<string> = [];
    if (totalItemsWidth > availableWithoutMore) {
      const totalBudget = availableWithoutMore - MORE_BUTTON_RESERVED_PX;
      let usedWidth = 0;
      let overflowing = false;

      items.forEach((item, index) => {
        const previous = items[index - 1];
        const separatorCost =
          previous?.group && item.group && previous.group !== item.group ? GROUP_SEPARATOR_PX : 0;
        const cost = itemWidths[index] + separatorCost;

        if (overflowing || usedWidth + cost > totalBudget) {
          overflowing = true;
          next.push(item.id);
        } else {
          usedWidth += cost;
        }
      });
    }

    setHiddenIds((previous) =>
      previous.length === next.length && previous.every((value, index) => value === next[index])
        ? previous
        : next,
    );
  }, [items]);

  const measure = useCallback(() => {
    if (rafRef.current !== null) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      doMeasure();
    });
  }, [doMeasure]);

  useLayoutEffect(() => {
    doMeasure();
  }, [doMeasure]);

  useEffect(() => {
    const row = rowRef.current;
    if (!row) return;

    const resizeObserver = new ResizeObserver(() => measure());
    resizeObserver.observe(row);
    if (mirrorRef.current) resizeObserver.observe(mirrorRef.current);
    for (const element of mirrorItemRefs.current.values()) {
      resizeObserver.observe(element);
    }

    window.addEventListener("resize", measure);
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", measure);
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [items, measure]);

  const hiddenItems = items.filter((item) => hiddenSet.has(item.id));
  const anyHidden = hiddenItems.length > 0;

  return (
    <div
      ref={rowRef}
      className={cn("relative flex min-w-0 flex-1 items-center overflow-hidden", className)}
    >
      {renderOverflowToolbarItems(items, hiddenSet)}
      <div className="flex min-w-0 flex-1" />
      <motion.div
        className={cn(
          "flex shrink-0 items-center justify-end overflow-hidden pr-1",
          anyHidden ? "w-9" : "w-0",
        )}
        initial={false}
        animate={{
          opacity: anyHidden ? 1 : 0,
          scale: anyHidden ? 1 : 0.85,
        }}
        transition={{ type: "spring", duration: 0.32, bounce: 0.22 }}
        style={{ pointerEvents: anyHidden ? undefined : "none" }}
        aria-hidden={!anyHidden || undefined}
      >
        <OverflowMoreButton items={hiddenItems} />
      </motion.div>
      <div
        ref={mirrorRef}
        aria-hidden="true"
        className="pointer-events-none absolute left-0 top-[-9999px] flex items-center"
      >
        {items.map((item) => (
          <span
            key={`mirror-${item.id}`}
            ref={(element) => setMirrorItemRef(item.id, element)}
            className="flex shrink-0 items-center"
            tabIndex={-1}
          >
            {item.element}
          </span>
        ))}
      </div>
    </div>
  );
}

function renderOverflowToolbarItems(
  items: Array<OverflowToolbarItem>,
  hiddenSet: Set<string>,
): ReactElement {
  const itemTransition = {
    type: "spring" as const,
    duration: 0.32,
    bounce: 0.18,
  };

  return (
    <>
      {items.map((item, index) => {
        const previous = items[index - 1];
        const hidden = hiddenSet.has(item.id);
        const previousVisible = Boolean(previous) && !hiddenSet.has(previous.id);
        const thisVisible = !hidden;
        const needsSeparator =
          Boolean(previous) &&
          Boolean(item.group) &&
          Boolean(previous?.group) &&
          item.group !== previous?.group &&
          previousVisible &&
          thisVisible;

        return (
          <span key={item.id} className="flex shrink-0 items-center">
            {needsSeparator ? (
              <span aria-hidden="true" className="mx-1 block h-5 w-px bg-border/70" />
            ) : null}
            <motion.span
              className={cn(
                "inline-flex shrink-0 items-center overflow-hidden whitespace-nowrap",
                hidden && "w-0",
              )}
              initial={false}
              animate={{
                opacity: hidden ? 0 : 1,
                scale: hidden ? 0.85 : 1,
              }}
              transition={itemTransition}
              style={{ pointerEvents: hidden ? "none" : undefined }}
              aria-hidden={hidden || undefined}
            >
              {item.element}
            </motion.span>
          </span>
        );
      })}
    </>
  );
}

function OverflowMoreButton({ items }: { items: Array<OverflowToolbarItem> }) {
  const [open, setOpen] = useState(false);
  const grouped = useMemo(() => {
    const chunks: Array<{ key: string; rows: Array<OverflowToolbarItem> }> = [];
    let current: { key: string; rows: Array<OverflowToolbarItem> } | null = null;

    items.forEach((item) => {
      const key = item.group ?? `__solo-${item.id}`;
      if (current && current.key === key) {
        current.rows.push(item);
      } else {
        current = { key, rows: [item] };
        chunks.push(current);
      }
    });

    return chunks;
  }, [items]);

  useEffect(() => {
    if (items.length === 0) {
      setOpen(false);
    }
  }, [items.length]);

  return (
    <div className="relative flex items-center">
      <ToolbarActionButton
        aria-label={
          items.length > 0
            ? `${items.length} more toolbar action${items.length === 1 ? "" : "s"}`
            : "More toolbar actions"
        }
        active={open}
        title={
          items.length > 0
            ? `${items.length} hidden action${items.length === 1 ? "" : "s"}`
            : "All actions visible"
        }
        onClick={() => setOpen((value) => !value)}
      >
        <MoreHorizontal className="size-4" />
      </ToolbarActionButton>

      {open ? (
        <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-auto min-w-48 max-w-72 rounded-lg border border-border bg-popover p-2.5 shadow-2xl shadow-black/35 backdrop-blur-xl">
          {items.length === 0 ? (
            <div className="px-2 py-3 text-sm text-muted-foreground">Nothing hidden.</div>
          ) : (
            <div className="flex flex-col gap-1">
              {grouped.map((chunk, chunkIndex) => (
                <Fragment key={chunk.key}>
                  {chunkIndex > 0 ? <div className="my-1 h-px w-full bg-border/50" /> : null}
                  <ul className="flex flex-col gap-0.5">
                    {chunk.rows.map((item) => (
                      <li key={item.id}>
                        <OverflowMenuRow label={item.label}>{item.element}</OverflowMenuRow>
                      </li>
                    ))}
                  </ul>
                </Fragment>
              ))}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}

function OverflowMenuRow({
  label,
  children,
}: {
  label: string;
  children: ReactElement;
}) {
  const cloned = isValidElement(children) ? cloneElement(children) : children;
  const slotRef = useRef<HTMLDivElement | null>(null);

  const forwardToPrimary = (event: MouseEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    if (target.closest('button, span[role="button"], [data-state]')) return;
    const primary = slotRef.current?.querySelector<HTMLElement>('button, [role="button"]');
    if (!primary) return;

    event.preventDefault();
    primary.click();
  };

  return (
    <div
      className="flex cursor-default items-center gap-2 rounded-md px-1 py-0.5 transition-colors hover:bg-muted/70 focus-within:bg-muted/70"
      onMouseDown={(event) => {
        const target = event.target as HTMLElement;
        if (target.closest('button, span[role="button"]')) return;
        event.preventDefault();
      }}
      onClick={forwardToPrimary}
    >
      <div ref={slotRef} className="flex min-h-8 min-w-8 shrink-0 items-center justify-start">
        {cloned}
      </div>
      <span className="truncate text-sm text-foreground">{label}</span>
    </div>
  );
}

function MarkButton({
  mark,
  icon: Icon,
  label,
}: {
  mark: "bold" | "italic" | "underline" | "strikethrough" | "code";
  icon: typeof Bold;
  label: string;
}) {
  const editor = useEditorRef();
  const active = useEditorSelector(
    (current) => Boolean(current.api.marks?.()?.[mark]),
    [mark],
  );

  return (
    <ToolbarActionButton
      aria-label={label}
      active={active}
      title={label}
      onClick={() => {
        if (!editor.selection) {
          editor.tf.focus?.({ edge: "end" });
        }
        if (active) {
          editor.tf.removeMarks(mark);
        } else {
          editor.tf.addMarks({ [mark]: true } as Record<string, boolean>);
        }
        editor.tf.focus?.();
      }}
    >
      <Icon className="size-4" />
    </ToolbarActionButton>
  );
}

function HistoryButton({
  action,
  icon: Icon,
  label,
}: {
  action: "undo" | "redo";
  icon: typeof Undo2;
  label: string;
}) {
  const editor = useEditorRef();
  const enabled = useEditorSelector((current) => {
    const stack = action === "undo" ? current.history?.undos : current.history?.redos;
    return Boolean(stack && stack.length > 0);
  }, [action]);

  return (
    <ToolbarActionButton
      aria-label={label}
      title={label}
      disabled={!enabled}
      onClick={() => {
        editor.tf[action]?.();
        editor.tf.focus?.();
      }}
    >
      <Icon className="size-4" />
    </ToolbarActionButton>
  );
}

function BlockTypeMenuButton() {
  const editor = useEditorRef();
  const [open, setOpen] = useState(false);
  const selectedType = useEditorSelector(
    (current) => getCurrentBlockType(current as ReturnType<typeof useEditorRef>),
    [],
  );
  const selected =
    BLOCK_TYPE_OPTIONS.find((option) => option.type === selectedType) ?? BLOCK_TYPE_OPTIONS[0];
  const SelectedIcon = selected.icon;

  return (
    <div className="relative flex items-center">
      <ToolbarActionButton
        aria-label="Block type"
        active={open}
        title="Block type"
        className="gap-1.5 px-2.5"
        onClick={() => setOpen((value) => !value)}
      >
        <SelectedIcon className="size-4" />
        <span className="text-xs font-medium">{selected.shortLabel}</span>
        <ChevronDown className="size-3.5 text-foreground/55" />
      </ToolbarActionButton>

      {open ? (
        <div className="absolute left-0 top-[calc(100%+8px)] z-50 min-w-44 rounded-lg border border-border bg-background p-1 shadow-2xl">
          {BLOCK_TYPE_OPTIONS.map((option) => {
            const Icon = option.icon;
            const active = option.type === selectedType;

            return (
              <button
                key={option.type}
                type="button"
                className={cn(
                  "flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm text-foreground/80 transition-colors",
                  "hover:bg-muted hover:text-foreground",
                  active && "bg-muted text-foreground",
                )}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  if (!editor.selection) {
                    editor.tf.focus?.({ edge: "end" });
                  }
                  setBlockType(editor, option.type);
                  editor.tf.focus?.();
                  setOpen(false);
                }}
              >
                <Icon className="size-4" />
                <span>{option.label}</span>
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

function GuideVisualInsertButton() {
  const editor = useEditorRef();
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState<GuideVisualKind>("diagram");
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [items, setItems] = useState("");
  const [editingCurrentBlock, setEditingCurrentBlock] = useState(false);

  const templates = GUIDE_VISUAL_TEMPLATES.filter((template) => template.kind === kind);

  function resetDraft(nextKind: GuideVisualKind) {
    setKind(nextKind);
    setTitle("");
    setSubtitle("");
    setItems("");
    setEditingCurrentBlock(false);
  }

  function loadDraftFromSelection() {
    const entry = editor.api.block<TElement>();
    if (!entry) return false;

    const [block] = entry;
    const visual = parsePreviewVisual(getPlainElementText(block));
    if (!visual || (visual.type !== "diagram" && visual.type !== "chart")) return false;

    setKind(visual.type);
    setTitle(visual.title);
    setSubtitle(visual.subtitle);
    setItems(serializeVisualItems(visual));
    setEditingCurrentBlock(true);
    return true;
  }

  function openMenu() {
    if (!open) {
      const loaded = loadDraftFromSelection();
      if (!loaded) {
        resetDraft(kind);
      }
    }
    setOpen((value) => !value);
  }

  return (
    <div className="relative flex items-center">
      <ToolbarActionButton
        aria-label="Insert visual"
        active={open}
        title="Insert visual"
        className="gap-1.5 px-2.5"
        onClick={openMenu}
      >
        {kind === "diagram" ? <Workflow className="size-4" /> : <BarChart3 className="size-4" />}
        <span className="text-xs font-medium">Visuals</span>
        <ChevronDown className="size-3.5 text-foreground/55" />
      </ToolbarActionButton>

      {open ? (
        <div className="absolute left-0 top-[calc(100%+8px)] z-50 w-[400px] rounded-lg border border-border bg-background p-3 shadow-2xl">
          <div className="mb-3 flex rounded-lg bg-muted p-1">
            {(["diagram", "chart"] as GuideVisualKind[]).map((option) => (
              <button
                key={option}
                type="button"
                className={cn(
                  "flex-1 rounded-md px-2 py-1.5 text-xs font-medium transition-colors",
                  option === kind
                    ? "bg-muted text-foreground"
                    : "text-foreground/60 hover:text-foreground",
                )}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => resetDraft(option)}
              >
                {option === "diagram" ? "Diagram" : "Chart"}
              </button>
            ))}
          </div>

          <div className="mb-3 flex flex-wrap gap-1.5">
            {templates.map((template) => (
              <button
                key={template.id}
                type="button"
                className="rounded-md border border-border bg-input px-2.5 py-1.5 text-xs text-foreground/75 transition-colors hover:text-foreground"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  setKind(template.kind);
                  setTitle(template.title);
                  setSubtitle(template.subtitle);
                  setItems(template.items);
                  setEditingCurrentBlock(false);
                }}
              >
                {template.label}
              </button>
            ))}
          </div>

          <div className="grid gap-2.5">
            <Input
              placeholder="Title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
            <Input
              placeholder="Optional subtitle"
              value={subtitle}
              onChange={(event) => setSubtitle(event.target.value)}
            />
            <Textarea
              rows={kind === "diagram" ? 5 : 4}
              value={items}
              onChange={(event) => setItems(event.target.value)}
              placeholder={
                kind === "diagram"
                  ? "Observe|Review roadmap and incidents"
                  : "Delivery control|40|#A3E635"
              }
            />
            <div className="text-[11px] leading-5 text-muted-foreground">
              {editingCurrentBlock
                ? "Editing the currently selected visual block."
                : kind === "diagram"
                  ? "One row per step: label | detail. Choose a preset above to prefill."
                  : "One row per bar: label | value | color. Choose a preset above to prefill."}
            </div>
            <div className="flex justify-end gap-2">
              <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  const shortCode = buildGuideVisualShortcode({
                    kind,
                    title,
                    subtitle,
                    items,
                  });
                  if (!editor.selection) {
                    editor.tf.focus?.({ edge: "end" });
                  }
                  const updated = replaceCurrentMatchingBlock(
                    editor,
                    shortCode,
                    (text) => Boolean(parsePreviewVisual(text)),
                  );
                  if (!updated) {
                    insertMarkdownBlock(editor, shortCode);
                  }
                  editor.tf.focus?.();
                  setOpen(false);
                }}
              >
                {editingCurrentBlock ? "Update visual" : `Insert ${kind}`}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ImageInsertButton() {
  const editor = useEditorRef();
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [alt, setAlt] = useState("");

  function openMenu() {
    if (!open) {
      const entry = editor.api.block<TElement>();
      const image = entry ? parsePreviewImage(getPlainElementText(entry[0])) : null;
      setUrl(image?.src ?? "");
      setAlt(image?.alt ?? "");
    }
    setOpen((value) => !value);
  }

  return (
    <div className="relative flex items-center">
      <ToolbarActionButton
        aria-label="Insert image"
        active={open}
        title="Insert image"
        onClick={openMenu}
      >
        <Image className="size-4" />
      </ToolbarActionButton>

      {open ? (
        <div className="absolute left-0 top-[calc(100%+8px)] z-50 w-80 rounded-lg border border-border bg-background p-3 shadow-2xl">
          <div className="grid gap-2">
            <Input
              autoFocus
              placeholder="https://..."
              value={url}
              onChange={(event) => setUrl(event.target.value)}
            />
            <Input
              placeholder="Alt text"
              value={alt}
              onChange={(event) => setAlt(event.target.value)}
            />
            <div className="flex justify-end gap-2">
              <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  const src = url.trim();
                  if (!src) return;
                  const markdown = `![${alt.trim()}](${src})`;
                  const updated = replaceCurrentMatchingBlock(
                    editor,
                    markdown,
                    (text) => Boolean(parsePreviewImage(text)),
                  );
                  if (!updated) {
                    insertMarkdownBlock(editor, markdown);
                  }
                  editor.tf.focus?.();
                  setOpen(false);
                }}
              >
                Apply
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function IllustrationInsertButton() {
  const editor = useEditorRef();
  const [open, setOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState<(typeof ILLUSTRATION_STYLE_OPTIONS)[number]["value"]>("storybook");
  const [customStyle, setCustomStyle] = useState("");
  const [aspectRatio, setAspectRatio] = useState<"portrait" | "square" | "landscape">("landscape");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    const trimmedPrompt = prompt.trim();
    if (!trimmedPrompt) return;

    setBusy(true);
    setError(null);

    const res = await fetch("/api/illustrations/nano-banana", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        prompt: trimmedPrompt,
        style: style === "custom" ? customStyle.trim() : style,
        aspectRatio,
      }),
    });

    const json = await res.json().catch(() => ({}));
    setBusy(false);

    if (!res.ok || typeof json.imageUrl !== "string") {
      setError(json.error ?? "Could not generate illustration");
      return;
    }

    insertMarkdownBlock(editor, `![${trimmedPrompt}](${json.imageUrl})`);
    editor.tf.focus?.();
    setOpen(false);
    setPrompt("");
    setCustomStyle("");
  }

  return (
    <div className="relative flex items-center">
      <ToolbarActionButton
        aria-label="Generate illustration"
        active={open}
        title="Generate illustration"
        onClick={() => setOpen((value) => !value)}
      >
        <Sparkles className="size-4" />
      </ToolbarActionButton>

      {open ? (
        <div className="absolute left-0 top-[calc(100%+8px)] z-50 w-[360px] rounded-lg border border-border bg-background p-3 shadow-2xl">
          <div className="grid gap-2.5">
            <Textarea
              rows={4}
              placeholder="Describe the book-style illustration you want..."
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
            />
            <select
              className="h-10 rounded-[0.45rem] border border-border bg-input px-3 text-sm text-foreground focus:border-brand-400/60 focus:outline-none focus:ring-2 focus:ring-ring"
              value={style}
              onChange={(event) =>
                setStyle(event.target.value as (typeof ILLUSTRATION_STYLE_OPTIONS)[number]["value"])
              }
            >
              {ILLUSTRATION_STYLE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {style === "custom" ? (
              <Input
                placeholder="Describe the illustration style"
                value={customStyle}
                onChange={(event) => setCustomStyle(event.target.value)}
              />
            ) : null}
            <select
              className="h-10 rounded-[0.45rem] border border-border bg-input px-3 text-sm text-foreground focus:border-brand-400/60 focus:outline-none focus:ring-2 focus:ring-ring"
              value={aspectRatio}
              onChange={(event) =>
                setAspectRatio(event.target.value as "portrait" | "square" | "landscape")
              }
            >
              <option value="portrait">Portrait</option>
              <option value="square">Square</option>
              <option value="landscape">Landscape</option>
            </select>
            {error ? <div className="text-xs text-rose-400">{error}</div> : null}
            <div className="flex justify-end gap-2">
              <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleGenerate} disabled={busy}>
                {busy ? "Generating" : "Generate"}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function BulletListButton() {
  const editor = useEditorRef();
  const active = useEditorSelector(
    (current) =>
      someList(current, [ListStyleType.Disc, ListStyleType.Circle, ListStyleType.Square]),
    [],
  );

  return (
    <ToolbarActionButton
      aria-label="Bulleted list"
      active={active}
      title="Bulleted list"
      onClick={() => {
        editor.tf.focus?.();
        toggleList(editor, { listStyleType: ListStyleType.Disc });
      }}
    >
      <List className="size-4" />
    </ToolbarActionButton>
  );
}

function NumberedListButton() {
  const editor = useEditorRef();
  const active = useEditorSelector(
    (current) =>
      someList(current, [
        ListStyleType.Decimal,
        ListStyleType.LowerAlpha,
        ListStyleType.UpperAlpha,
        ListStyleType.LowerRoman,
        ListStyleType.UpperRoman,
      ]),
    [],
  );

  return (
    <ToolbarActionButton
      aria-label="Numbered list"
      active={active}
      title="Numbered list"
      onClick={() => {
        editor.tf.focus?.();
        toggleList(editor, { listStyleType: ListStyleType.Decimal });
      }}
    >
      <ListOrdered className="size-4" />
    </ToolbarActionButton>
  );
}

function LinkButton() {
  const editor = useEditorRef();
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [text, setText] = useState("");

  return (
    <div className="relative flex items-center">
      <ToolbarActionButton
        aria-label="Link"
        active={open}
        title="Link"
        onClick={() => {
          const selectedText = editor.selection ? editor.api.string?.(editor.selection) ?? "" : "";
          setText(selectedText);
          setUrl("");
          setOpen((value) => !value);
        }}
      >
        <Link2 className="size-4" />
      </ToolbarActionButton>

      {open ? (
        <div className="absolute left-0 top-[calc(100%+8px)] z-50 w-80 rounded-lg border border-border bg-background p-3 shadow-2xl">
          <div className="grid gap-2">
            <Input
              autoFocus
              placeholder="https://example.com"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
            />
            <Input
              placeholder="Optional link label"
              value={text}
              onChange={(event) => setText(event.target.value)}
            />
            <div className="flex justify-end gap-2">
              <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  unwrapLink(editor);
                  editor.tf.focus?.();
                  setOpen(false);
                }}
              >
                Remove
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  const nextUrl = url.trim();
                  if (!nextUrl) return;
                  upsertLink(editor, {
                    url: nextUrl,
                    text: text.trim() || undefined,
                  });
                  editor.tf.focus?.();
                  setOpen(false);
                }}
              >
                Apply
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function PlateMarkdownEditor({
  defaultValue,
  mode = "public",
  name,
  placeholder = "Write here...",
  required,
  size = "md",
  preview = "none",
  contentClassName,
}: {
  defaultValue?: string | null;
  mode?: EditorMode;
  name: string;
  placeholder?: string;
  required?: boolean;
  size?: EditorSize;
  preview?: "none" | "rich";
  contentClassName?: string;
}) {
  const [markdown, setMarkdown] = useState(() => normalizeMarkdown(defaultValue));
  const [showPreview, setShowPreview] = useState(preview === "rich");
  const appliedDefaultRef = useRef<string | null>(null);
  const splitPaneRef = useRef<HTMLDivElement | null>(null);
  const [previewWidth, setPreviewWidth] = useState<number | null>(null);
  const [isResizingPreview, setIsResizingPreview] = useState(false);

  const plugins = useMemo(
    () => [
      BlockPlaceholderPlugin.configure({
        options: {
          className:
            "before:absolute before:cursor-text before:text-muted-foreground/70 before:content-[attr(placeholder)]",
          placeholders: {
            [KEYS.p]: placeholder,
            h2: placeholder,
            h3: placeholder,
            blockquote: placeholder,
          },
          query: ({ path }) => path.length === 1,
        },
      }),
      NodeIdPlugin.configure({
        options: {
          normalizeInitialValue: true,
        },
      }),
      BlockquotePlugin.withComponent(BlockquoteNode),
      H2Plugin.withComponent(HeadingNode),
      H3Plugin.withComponent(HeadingNode),
      BoldPlugin,
      ItalicPlugin,
      UnderlinePlugin,
      StrikethroughPlugin,
      CodePlugin.withComponent(CodeLeaf),
      LinkPlugin.withComponent(LinkNode),
      ListPlugin,
      HistoryPlugin,
      DndPlugin,
      BlockSelectionPlugin,
      MarkdownPlugin,
    ],
    [placeholder],
  );

  const editor = usePlateEditor({
    value: EMPTY_VALUE,
    plugins,
  });

  useEffect(() => {
    const next = normalizeMarkdown(defaultValue);
    if (appliedDefaultRef.current === next) return;
    appliedDefaultRef.current = next;
    setMarkdown(next);

    const value = next
      ? editor.getApi(MarkdownPlugin).markdown.deserialize(next)
      : EMPTY_VALUE;

    editor.tf.reset();
    editor.tf.insertNodes(Array.isArray(value) && value.length > 0 ? value : EMPTY_VALUE);
  }, [defaultValue, editor]);

  const minHeightClass =
    size === "lg" ? "min-h-[320px]" : size === "sm" ? "min-h-[140px]" : "min-h-[220px]";
  const maxHeightClass =
    size === "lg" ? "max-h-[34rem]" : size === "sm" ? "max-h-64" : "max-h-[28rem]";

  const getDefaultPreviewWidth = useCallback(() => {
    const containerWidth = splitPaneRef.current?.clientWidth ?? 0;
    return containerWidth > 0 ? containerWidth / 2 : PREVIEW_DEFAULT_WIDTH;
  }, []);

  const clampPreviewWidth = useCallback((nextWidth: number) => {
    const containerWidth = splitPaneRef.current?.clientWidth ?? 0;
    const maxWidth =
      containerWidth > 0 ? Math.max(0, containerWidth - 260) : PREVIEW_MAX_WIDTH;
    const minWidth = Math.min(PREVIEW_MIN_WIDTH, maxWidth);

    return Math.min(maxWidth, Math.max(minWidth, nextWidth));
  }, []);

  useEffect(() => {
    if (preview !== "rich" || !showPreview) return;

    const container = splitPaneRef.current;
    if (!container) return;

    const syncPreviewWidth = () => {
      setPreviewWidth((currentWidth) => {
        const nextWidth = clampPreviewWidth(currentWidth ?? getDefaultPreviewWidth());
        return currentWidth === nextWidth ? currentWidth : nextWidth;
      });
    };

    syncPreviewWidth();

    const resizeObserver = new ResizeObserver(syncPreviewWidth);
    resizeObserver.observe(container);

    return () => resizeObserver.disconnect();
  }, [clampPreviewWidth, getDefaultPreviewWidth, preview, showPreview]);

  const handleResizeStart = useCallback(
    (event: React.PointerEvent<HTMLButtonElement>) => {
      event.preventDefault();
      const container = splitPaneRef.current;
      if (!container) return;
      setIsResizingPreview(true);

      const updateWidth = (clientX: number) => {
        const rect = container.getBoundingClientRect();
        setPreviewWidth(clampPreviewWidth(rect.right - clientX));
      };

      updateWidth(event.clientX);

      const handlePointerMove = (moveEvent: PointerEvent) => {
        updateWidth(moveEvent.clientX);
      };

      const handlePointerUp = () => {
        setIsResizingPreview(false);
        window.removeEventListener("pointermove", handlePointerMove);
        window.removeEventListener("pointerup", handlePointerUp);
      };

      window.addEventListener("pointermove", handlePointerMove);
      window.addEventListener("pointerup", handlePointerUp, { once: true });
    },
    [clampPreviewWidth],
  );

  const editorPane = (
    <PlateContainer className="relative z-0 min-w-0 flex-1">
      <PlateContent
        className={cn(
          EDITOR_BODY_CLASS,
          "flex flex-col focus:outline-none",
          "overflow-y-auto",
          "[&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:marker:text-muted-foreground",
          "[&_ul]:list-disc [&_ul]:pl-5 [&_ul]:marker:text-muted-foreground",
          "[&_li]:py-0.5 [&_strong]:font-semibold",
          minHeightClass,
          maxHeightClass,
          contentClassName,
        )}
        disableDefaultStyles
      />
    </PlateContainer>
  );

  const toolbarItems: Array<OverflowToolbarItem> = [
    {
      id: "undo",
      label: "Undo",
      group: "history",
      element: <HistoryButton action="undo" icon={Undo2} label="Undo" />,
    },
    {
      id: "redo",
      label: "Redo",
      group: "history",
      element: <HistoryButton action="redo" icon={Redo2} label="Redo" />,
    },
    {
      id: "block-type",
      label: "Block type",
      group: "block",
      element: <BlockTypeMenuButton />,
    },
    {
      id: "bold",
      label: "Bold",
      group: "marks",
      element: <MarkButton mark="bold" icon={Bold} label="Bold" />,
    },
    {
      id: "italic",
      label: "Italic",
      group: "marks",
      element: <MarkButton mark="italic" icon={Italic} label="Italic" />,
    },
    {
      id: "underline",
      label: "Underline",
      group: "marks",
      element: <MarkButton mark="underline" icon={Underline} label="Underline" />,
    },
    {
      id: "strikethrough",
      label: "Strikethrough",
      group: "marks",
      element: <MarkButton mark="strikethrough" icon={Strikethrough} label="Strikethrough" />,
    },
    {
      id: "code",
      label: "Code",
      group: "marks",
      element: <MarkButton mark="code" icon={Code2} label="Code" />,
    },
    {
      id: "bulleted-list",
      label: "Bulleted list",
      group: "insert",
      element: <BulletListButton />,
    },
    {
      id: "numbered-list",
      label: "Numbered list",
      group: "insert",
      element: <NumberedListButton />,
    },
    {
      id: "link",
      label: "Link",
      group: "insert",
      element: <LinkButton />,
    },
    {
      id: "image",
      label: "Image",
      group: "insert",
      element: <ImageInsertButton />,
    },
    {
      id: "illustration",
      label: "Generate illustration",
      group: "insert",
      element: <IllustrationInsertButton />,
    },
    {
      id: "visuals",
      label: "Visuals",
      group: "insert",
      element: <GuideVisualInsertButton />,
    },
    ...(preview === "rich"
      ? [
          {
            id: "preview",
            label: showPreview ? "Hide preview" : "Show preview",
            group: "view",
            element: (
              <ToolbarActionButton
                aria-label={showPreview ? "Hide preview" : "Show preview"}
                active={showPreview}
                title={showPreview ? "Hide preview" : "Show preview"}
                className="gap-1.5 px-2.5"
                onClick={() => setShowPreview((value) => !value)}
              >
                {showPreview ? (
                  <PanelRightClose className="size-4" />
                ) : (
                  <PanelRightOpen className="size-4" />
                )}
                <span className="text-xs font-medium">Preview</span>
              </ToolbarActionButton>
            ),
          },
        ]
      : []),
  ];

  return (
    <div
      className="relative isolate overflow-visible rounded-[0.45rem] border border-border bg-input"
      data-editor-mode={mode}
    >
      <DndProvider backend={HTML5Backend}>
        <Plate
          editor={editor}
          onValueChange={() => {
            const next = normalizeMarkdown(editor.getApi(MarkdownPlugin).markdown.serialize());
            setMarkdown(next);
          }}
        >
          <div className="relative z-30 flex items-center border-b border-border bg-surface-2/70 px-2 py-1.5 [&_button]:cursor-default">
            <OverflowToolbar items={toolbarItems} />
          </div>

          <div ref={splitPaneRef} className="relative z-0 flex items-stretch overflow-hidden">
            {editorPane}

            <div
              className={cn(
                "relative min-w-0 overflow-visible border-l border-border/0 bg-input opacity-0",
                isResizingPreview
                  ? "transition-[opacity,border-color] duration-150 ease-out"
                  : "transition-[width,opacity,border-color] duration-300 ease-out",
                preview === "rich" && showPreview && "border-border/100 opacity-100",
              )}
              style={{
                width:
                  preview === "rich" && showPreview
                    ? `${clampPreviewWidth(previewWidth ?? getDefaultPreviewWidth())}px`
                    : "0px",
              }}
            >
              {preview === "rich" && showPreview ? (
                <button
                  type="button"
                  aria-label="Resize preview"
                  className="group absolute inset-y-0 left-0 z-10 flex w-6 -translate-x-1/2 cursor-col-resize items-center justify-center"
                  onPointerDown={handleResizeStart}
                >
                  <span className="flex h-6 w-4 cursor-col-resize items-center justify-center rounded-sm border border-border bg-surface-2 shadow-sm transition-colors group-hover:border-brand-400/60">
                    <GripVertical className="size-3 cursor-col-resize text-muted-foreground" />
                  </span>
                </button>
              ) : null}
              <div
                className={cn(
                  "h-full transition-transform duration-300 ease-out",
                  preview === "rich" && showPreview ? "translate-x-0" : "translate-x-3",
                )}
              >
                <RichMarkdownPreview
                  markdown={markdown}
                  minHeightClass={minHeightClass}
                  maxHeightClass={maxHeightClass}
                />
              </div>
            </div>
          </div>
        </Plate>
      </DndProvider>

      <textarea
        hidden
        readOnly
        name={name}
        required={required}
        value={markdown}
      />
    </div>
  );
}
