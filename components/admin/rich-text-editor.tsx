"use client"

import { useEffect, useRef, useState } from "react"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import { Node, mergeAttributes } from "@tiptap/core"
import Link from "@tiptap/extension-link"
import Image from "@tiptap/extension-image"
import { TextStyle } from "@tiptap/extension-text-style"
import { Color } from "@tiptap/extension-color"
import { Highlight } from "@tiptap/extension-highlight"
import { Table } from "@tiptap/extension-table"
import TableRow from "@tiptap/extension-table-row"
import TableCell from "@tiptap/extension-table-cell"
import TableHeader from "@tiptap/extension-table-header"
import TextAlign from "@tiptap/extension-text-align"
import { EditorView } from "@codemirror/view"
import CodeMirror from "@uiw/react-codemirror"
import { html as htmlLang } from "@codemirror/lang-html"
import fontAwesomeIcons from "@/lib/font-awesome-free-icons.json"
import { CONTENT_ICON_OPTIONS, type ContentIconName } from "@/lib/content-icons"
import { CONTENT_KEYWORD_OPTIONS } from "@/lib/content-keywords"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { RichContentRenderer } from "@/components/cms/rich-content-renderer"
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  LinkIcon,
  ImageIcon,
  CodeXml,
  Eye,
  Monitor,
  SeparatorHorizontal,
  SquareStack,
  Columns2,
  RectangleHorizontal,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Table2,
  Plus,
  Minus,
  Trash2,
  SplitSquareHorizontal,
  PlayCircle,
  UploadCloud,
  Palette,
  Highlighter,
  Eraser,
} from "lucide-react"

interface RichTextEditorProps {
  content: string
  onChange: (content: string) => void
}

const PRIMARY_BUTTON_CLASS =
  "inline-flex items-center gap-2 justify-center rounded-md bg-primary px-4 py-2 text-white no-underline hover:opacity-90"
const OUTLINE_BUTTON_CLASS = "inline-flex items-center gap-2 justify-center rounded-md border border-border bg-background px-4 py-2 no-underline"

type ButtonVariant = "primary" | "outline" | "secondary" | "ghost" | "danger"
type ButtonSize = "sm" | "md" | "lg"

const getButtonClass = (variant: ButtonVariant, size: ButtonSize) => {
  const sizeClass = size === "sm" ? "px-3 py-1.5 text-sm" : size === "lg" ? "px-6 py-3 text-base" : "px-4 py-2 text-sm"
  const base = `inline-flex items-center gap-2 justify-center rounded-md no-underline ${sizeClass}`
  if (variant === "primary") return `${base} bg-primary text-white hover:opacity-90`
  if (variant === "outline") return `${base} border border-border bg-background`
  if (variant === "secondary") return `${base} bg-secondary text-secondary-foreground hover:opacity-90`
  if (variant === "ghost") return `${base} bg-transparent border border-transparent hover:bg-muted`
  return `${base} bg-destructive text-destructive-foreground hover:opacity-90`
}

type SectionPresetId =
  | "plain"
  | "soft-slate"
  | "sky-glow"
  | "sunset-blend"
  | "emerald-mist"
  | "midnight-contrast"
  | "royal-blue"
  | "frosted-steel"
type SectionSpacing = "compact" | "comfortable" | "spacious"
type SectionGap = "none" | "minimal" | "moderate" | "maximum"
type SectionRadius = "none" | "lg" | "xl" | "2xl"
type SectionBorder = "none" | "soft" | "strong"
type SectionShadow = "none" | "soft" | "lifted"

type SectionPresetOption = {
  id: SectionPresetId
  label: string
  description: string
  background: string
  textColor?: string
  headingColor?: string
  linkColor?: string
  accentColor?: string
  borderColor?: string
}

const SECTION_PRESET_OPTIONS: SectionPresetOption[] = [
  {
    id: "plain",
    label: "Plain Surface",
    description: "No background fill, ideal when you only need spacing and structure.",
    background: "transparent",
    borderColor: "rgba(148, 163, 184, 0.26)",
  },
  {
    id: "soft-slate",
    label: "Soft Slate Gradient",
    description: "Subtle neutral gradient for calm content blocks and readable long-form text.",
    background: "linear-gradient(135deg, rgba(248, 250, 252, 0.96), rgba(241, 245, 249, 0.94))",
    textColor: "#0f172a",
    headingColor: "#020617",
    linkColor: "#1d4ed8",
    accentColor: "#475569",
    borderColor: "rgba(148, 163, 184, 0.4)",
  },
  {
    id: "sky-glow",
    label: "Sky Glow Gradient",
    description: "Cool blue highlight for feature callouts and informational sections.",
    background: "linear-gradient(130deg, rgba(239, 246, 255, 0.98), rgba(224, 242, 254, 0.94) 55%, rgba(219, 234, 254, 0.92))",
    textColor: "#082f49",
    headingColor: "#0c4a6e",
    linkColor: "#0369a1",
    accentColor: "#0e7490",
    borderColor: "rgba(14, 116, 144, 0.33)",
  },
  {
    id: "sunset-blend",
    label: "Sunset Blend",
    description: "Warm gradient that works well for CTAs without becoming visually harsh.",
    background: "linear-gradient(135deg, rgba(255, 247, 237, 0.98), rgba(254, 242, 242, 0.95) 52%, rgba(255, 251, 235, 0.94))",
    textColor: "#7c2d12",
    headingColor: "#9a3412",
    linkColor: "#b45309",
    accentColor: "#c2410c",
    borderColor: "rgba(194, 65, 12, 0.32)",
  },
  {
    id: "emerald-mist",
    label: "Emerald Mist",
    description: "Fresh green gradient suitable for trust, success, or process sections.",
    background: "linear-gradient(135deg, rgba(240, 253, 250, 0.98), rgba(220, 252, 231, 0.94) 56%, rgba(236, 253, 245, 0.94))",
    textColor: "#064e3b",
    headingColor: "#065f46",
    linkColor: "#047857",
    accentColor: "#0f766e",
    borderColor: "rgba(15, 118, 110, 0.33)",
  },
  {
    id: "midnight-contrast",
    label: "Midnight Contrast",
    description: "Dark high-contrast gradient for standout blocks and bold statements.",
    background: "linear-gradient(140deg, rgba(15, 23, 42, 0.97), rgba(30, 41, 59, 0.96) 50%, rgba(14, 116, 144, 0.9))",
    textColor: "#e2e8f0",
    headingColor: "#f8fafc",
    linkColor: "#7dd3fc",
    accentColor: "#bae6fd",
    borderColor: "rgba(125, 211, 252, 0.38)",
  },
  {
    id: "royal-blue",
    label: "Royal Blue",
    description: "Brand gradient call-to-action band matching the home page CTA section.",
    background: "linear-gradient(135deg, oklch(0.45 0.22 274), oklch(0.5 0.18 232), oklch(0.58 0.15 196))",
    textColor: "#ffffff",
    headingColor: "#ffffff",
    linkColor: "#ffffff",
    accentColor: "#c7d2fe",
    borderColor: "rgba(199, 210, 254, 0.45)",
  },
  {
    id: "frosted-steel",
    label: "Frosted Steel",
    description: "Soft silver gradient for neutral hero or intro sections.",
    background: "linear-gradient(135deg, rgba(222, 230, 236, 0.98), rgba(247, 249, 251, 0.98) 50%, rgba(220, 230, 236, 0.98))",
    textColor: "#5b6572",
    headingColor: "#030712",
    linkColor: "#0b67b2",
    accentColor: "#0b67b2",
    borderColor: "rgba(148, 163, 184, 0.4)",
  },
]

const SECTION_SPACING_OPTIONS: Array<{ value: SectionSpacing; label: string }> = [
  { value: "compact", label: "Compact" },
  { value: "comfortable", label: "Comfortable" },
  { value: "spacious", label: "Spacious" },
]

const SECTION_GAP_OPTIONS: Array<{ value: SectionGap; label: string }> = [
  { value: "none", label: "No gap" },
  { value: "minimal", label: "Minimal" },
  { value: "moderate", label: "Moderate" },
  { value: "maximum", label: "Maximum" },
]

const SECTION_RADIUS_OPTIONS: Array<{ value: SectionRadius; label: string }> = [
  { value: "none", label: "No Radius" },
  { value: "lg", label: "Rounded Large" },
  { value: "xl", label: "Rounded XL" },
  { value: "2xl", label: "Rounded 2XL" },
]

const SECTION_BORDER_OPTIONS: Array<{ value: SectionBorder; label: string }> = [
  { value: "none", label: "No Border" },
  { value: "soft", label: "Soft Border" },
  { value: "strong", label: "Strong Border" },
]

const SECTION_SHADOW_OPTIONS: Array<{ value: SectionShadow; label: string }> = [
  { value: "none", label: "No Shadow" },
  { value: "soft", label: "Soft Shadow" },
  { value: "lifted", label: "Lifted Shadow" },
]

const SECTION_SPACING_CLASS: Record<SectionSpacing, string> = {
  compact: "py-3 px-0",
  comfortable: "py-8 px-0",
  spacious: "py-10 px-4 md:px-6",
}

const SECTION_GAP_BEFORE_CLASS: Record<SectionGap, string> = {
  none: "mt-0",
  minimal: "mt-2",
  moderate: "mt-6",
  maximum: "mt-10",
}

const SECTION_GAP_AFTER_CLASS: Record<SectionGap, string> = {
  none: "mb-0",
  minimal: "mb-2",
  moderate: "mb-6",
  maximum: "mb-10",
}

const SECTION_RADIUS_CLASS: Record<SectionRadius, string> = {
  none: "rounded-none",
  lg: "rounded-lg",
  xl: "rounded-xl",
  "2xl": "rounded-2xl",
}

const SECTION_BORDER_CLASS: Record<SectionBorder, string> = {
  none: "border-0",
  soft: "border",
  strong: "border-2",
}

const SECTION_SHADOW_CLASS: Record<SectionShadow, string> = {
  none: "",
  soft: "shadow-sm",
  lifted: "shadow-lg shadow-black/10",
}

const FULL_WIDTH_SECTION_CLASS =
  "relative left-1/2 right-1/2 ml-[-50vw] mr-[-50vw] w-screen max-w-none px-4 md:px-6 lg:px-8"

const SECTION_PRESET_IDS = SECTION_PRESET_OPTIONS.map((option) => option.id)
const SECTION_SPACING_VALUES = SECTION_SPACING_OPTIONS.map((option) => option.value)
const SECTION_GAP_VALUES = SECTION_GAP_OPTIONS.map((option) => option.value)
const SECTION_RADIUS_VALUES = SECTION_RADIUS_OPTIONS.map((option) => option.value)
const SECTION_BORDER_VALUES = SECTION_BORDER_OPTIONS.map((option) => option.value)
const SECTION_SHADOW_VALUES = SECTION_SHADOW_OPTIONS.map((option) => option.value)

const DEFAULT_SECTION_NODE_PRESET: SectionPresetId = "plain"
const DEFAULT_SECTION_NODE_SPACING: SectionSpacing = "compact"
const DEFAULT_SECTION_NODE_GAP_BEFORE: SectionGap = "none"
const DEFAULT_SECTION_NODE_GAP_AFTER: SectionGap = "none"
const DEFAULT_SECTION_NODE_RADIUS: SectionRadius = "none"
const DEFAULT_SECTION_NODE_BORDER: SectionBorder = "none"
const DEFAULT_SECTION_NODE_SHADOW: SectionShadow = "none"
const DEFAULT_SECTION_NODE_ANIMATE_ENTRANCE = true
const DEFAULT_SECTION_NODE_ANIMATE_EXIT = true

const DEFAULT_SECTION_INSERT_PRESET: SectionPresetId = "soft-slate"
const DEFAULT_SECTION_INSERT_SPACING: SectionSpacing = "spacious"
const DEFAULT_SECTION_INSERT_GAP_BEFORE: SectionGap = "none"
const DEFAULT_SECTION_INSERT_GAP_AFTER: SectionGap = "none"
const DEFAULT_SECTION_INSERT_RADIUS: SectionRadius = "none"
const DEFAULT_SECTION_INSERT_BORDER: SectionBorder = "none"
const DEFAULT_SECTION_INSERT_SHADOW: SectionShadow = "none"
const DEFAULT_SECTION_INSERT_FULL_WIDTH = true
const DEFAULT_SECTION_INSERT_CONSTRAIN_CONTENT = true
const DEFAULT_SECTION_INSERT_ANIMATE_ENTRANCE = true
const DEFAULT_SECTION_INSERT_ANIMATE_EXIT = true

const includesValue = <T extends string>(pool: readonly T[], value: unknown): value is T => typeof value === "string" && pool.includes(value as T)

const normalizeSectionPreset = (value: unknown): SectionPresetId => {
  if (value === "royal-blue-cta") return "royal-blue"
  return includesValue(SECTION_PRESET_IDS, value) ? value : DEFAULT_SECTION_NODE_PRESET
}

const normalizeSectionSpacing = (value: unknown): SectionSpacing =>
  includesValue(SECTION_SPACING_VALUES, value) ? value : DEFAULT_SECTION_NODE_SPACING

const normalizeSectionGap = (value: unknown, fallback: SectionGap): SectionGap =>
  includesValue(SECTION_GAP_VALUES, value) ? value : fallback

const normalizeSectionRadius = (value: unknown): SectionRadius =>
  includesValue(SECTION_RADIUS_VALUES, value) ? value : DEFAULT_SECTION_NODE_RADIUS

const normalizeSectionBorder = (value: unknown): SectionBorder =>
  includesValue(SECTION_BORDER_VALUES, value) ? value : DEFAULT_SECTION_NODE_BORDER

const normalizeSectionShadow = (value: unknown): SectionShadow =>
  includesValue(SECTION_SHADOW_VALUES, value) ? value : DEFAULT_SECTION_NODE_SHADOW

const normalizeSectionFullWidth = (value: unknown) => value === true || value === "true"
const normalizeSectionConstrainContent = (value: unknown) => value === true || value === "true"
const normalizeSectionAnimateFlag = (value: unknown, fallback = true) =>
  value === undefined || value === null ? fallback : value !== false && value !== "false"

const inferSectionGapFromClass = (classText: string | null, direction: "before" | "after"): SectionGap => {
  if (!classText) {
    return direction === "before" ? DEFAULT_SECTION_NODE_GAP_BEFORE : DEFAULT_SECTION_NODE_GAP_AFTER
  }
  const tokenSet = new Set(classText.split(/\s+/).filter(Boolean))
  if (direction === "before") {
    if (tokenSet.has("mt-10") || tokenSet.has("my-10")) return "maximum"
    if (tokenSet.has("mt-6") || tokenSet.has("my-6") || tokenSet.has("my-8")) return "moderate"
    if (tokenSet.has("mt-2") || tokenSet.has("my-2")) return "minimal"
    if (tokenSet.has("mt-0") || tokenSet.has("my-0")) return "none"
    return DEFAULT_SECTION_NODE_GAP_BEFORE
  }
  if (tokenSet.has("mb-10") || tokenSet.has("my-10")) return "maximum"
  if (tokenSet.has("mb-6") || tokenSet.has("my-6") || tokenSet.has("my-8")) return "moderate"
  if (tokenSet.has("mb-2") || tokenSet.has("my-2")) return "minimal"
  if (tokenSet.has("mb-0") || tokenSet.has("my-0")) return "none"
  return DEFAULT_SECTION_NODE_GAP_AFTER
}

const getSectionPreset = (presetId: SectionPresetId) =>
  SECTION_PRESET_OPTIONS.find((option) => option.id === presetId) || SECTION_PRESET_OPTIONS[0]

const buildSectionClassName = ({
  fullWidth,
  spacing,
  gapBefore,
  gapAfter,
  radius,
  border,
  shadow,
}: {
  fullWidth: boolean
  spacing: SectionSpacing
  gapBefore: SectionGap
  gapAfter: SectionGap
  radius: SectionRadius
  border: SectionBorder
  shadow: SectionShadow
}) =>
  [
    "cms-rich-section",
    "transition-colors",
    fullWidth ? FULL_WIDTH_SECTION_CLASS : "",
    SECTION_SPACING_CLASS[spacing],
    SECTION_GAP_BEFORE_CLASS[gapBefore],
    SECTION_GAP_AFTER_CLASS[gapAfter],
    SECTION_RADIUS_CLASS[radius],
    SECTION_BORDER_CLASS[border],
    SECTION_SHADOW_CLASS[shadow],
  ]
    .filter(Boolean)
    .join(" ")

const buildSectionStyle = ({
  presetId,
  border,
}: {
  presetId: SectionPresetId
  border: SectionBorder
}) => {
  const preset = getSectionPreset(presetId)
  const styleParts = [`background:${preset.background};`]
  if (preset.textColor) {
    styleParts.push(`color:${preset.textColor};`)
    styleParts.push(`--tw-prose-body:${preset.textColor};`)
  }
  if (preset.headingColor) {
    styleParts.push(`--tw-prose-headings:${preset.headingColor};`)
    styleParts.push(`--tw-prose-bold:${preset.headingColor};`)
  }
  if (preset.linkColor) {
    styleParts.push(`--tw-prose-links:${preset.linkColor};`)
  }
  if (preset.accentColor) {
    styleParts.push(`--tw-prose-bullets:${preset.accentColor};`)
    styleParts.push(`--tw-prose-counters:${preset.accentColor};`)
    styleParts.push(`--tw-prose-quote-borders:${preset.accentColor};`)
  }
  if (border !== "none" && preset.borderColor) {
    styleParts.push(`border-color:${preset.borderColor};`)
  }
  return styleParts.join("")
}

const buildSectionNodeAttrs = ({
  preset,
  fullWidth,
  constrainContent,
  animateEntrance,
  animateExit,
  spacing,
  gapBefore,
  gapAfter,
  radius,
  border,
  shadow,
}: {
  preset: SectionPresetId
  fullWidth: boolean
  constrainContent: boolean
  animateEntrance: boolean
  animateExit: boolean
  spacing: SectionSpacing
  gapBefore: SectionGap
  gapAfter: SectionGap
  radius: SectionRadius
  border: SectionBorder
  shadow: SectionShadow
}) => ({
  class: buildSectionClassName({ fullWidth, spacing, gapBefore, gapAfter, radius, border, shadow }),
  style: buildSectionStyle({ presetId: preset, border }),
  preset,
  fullWidth,
  constrainContent,
  animateEntrance,
  animateExit,
  spacing,
  gapBefore,
  gapAfter,
  radius,
  border,
  shadow,
})

const CmsLink = Link.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      class: {
        default: "text-primary underline",
      },
      style: {
        default: null,
        parseHTML: (element) => element.getAttribute("style"),
        renderHTML: (attributes) => (attributes.style ? { style: attributes.style } : {}),
      },
      "data-cms-icon": {
        default: null,
        parseHTML: (element) => element.getAttribute("data-cms-icon"),
        renderHTML: (attributes) => (attributes["data-cms-icon"] ? { "data-cms-icon": attributes["data-cms-icon"] } : {}),
      },
      "data-cms-icon-style": {
        default: null,
        parseHTML: (element) => element.getAttribute("data-cms-icon-style"),
        renderHTML: (attributes) =>
          attributes["data-cms-icon-style"] ? { "data-cms-icon-style": attributes["data-cms-icon-style"] } : {},
      },
      "data-cms-button": {
        default: null,
        parseHTML: (element) => element.getAttribute("data-cms-button"),
        renderHTML: (attributes) => (attributes["data-cms-button"] ? { "data-cms-button": attributes["data-cms-button"] } : {}),
      },
    }
  },
})

const CmsTableHeader = TableHeader.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      style: {
        default: null,
        parseHTML: (element) => element.getAttribute("style"),
        renderHTML: (attributes) => (typeof attributes.style === "string" && attributes.style.trim() ? { style: attributes.style } : {}),
      },
    }
  },
})

const CmsTableCell = TableCell.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      style: {
        default: null,
        parseHTML: (element) => element.getAttribute("style"),
        renderHTML: (attributes) => (typeof attributes.style === "string" && attributes.style.trim() ? { style: attributes.style } : {}),
      },
    }
  },
})

const AccordionSummary = Node.create({
  name: "accordionSummary",
  content: "inline*",
  marks: "_",
  parseHTML() {
    return [{ tag: "summary[data-cms-accordion-summary]" }]
  },
  renderHTML({ HTMLAttributes }) {
    return ["summary", mergeAttributes(HTMLAttributes, { "data-cms-accordion-summary": "true", class: "cursor-pointer font-semibold" }), 0]
  },
})

const AccordionDetails = Node.create({
  name: "accordionDetails",
  group: "block",
  content: "accordionSummary block*",
  defining: true,
  parseHTML() {
    return [{ tag: "details[data-cms-accordion]" }]
  },
  renderHTML({ HTMLAttributes }) {
    return ["details", mergeAttributes(HTMLAttributes, { "data-cms-accordion": "true", class: "rounded-md border border-border p-3" }), 0]
  },
})

const CmsCard = Node.create({
  name: "cmsCard",
  group: "block",
  content: "block+",
  defining: true,
  addAttributes() {
    return {
      cardTitle: {
        default: "",
        parseHTML: (element) => element.getAttribute("data-cms-card-title") || "",
        renderHTML: (attributes) =>
          typeof attributes.cardTitle === "string" && attributes.cardTitle.trim()
            ? { "data-cms-card-title": attributes.cardTitle.trim() }
            : {},
      },
      cardBody: {
        default: "",
        parseHTML: (element) => element.getAttribute("data-cms-card-body") || "",
        renderHTML: (attributes) =>
          typeof attributes.cardBody === "string" && attributes.cardBody.trim()
            ? { "data-cms-card-body": attributes.cardBody.trim() }
            : {},
      },
      cardImage: {
        default: "",
        parseHTML: (element) => element.getAttribute("data-cms-card-image") || "",
        renderHTML: (attributes) =>
          typeof attributes.cardImage === "string" && attributes.cardImage.trim()
            ? { "data-cms-card-image": attributes.cardImage.trim() }
            : {},
      },
      cardImageAlt: {
        default: "",
        parseHTML: (element) => element.getAttribute("data-cms-card-image-alt") || "",
        renderHTML: (attributes) =>
          typeof attributes.cardImageAlt === "string" && attributes.cardImageAlt.trim()
            ? { "data-cms-card-image-alt": attributes.cardImageAlt.trim() }
            : {},
      },
      cardImageWidth: {
        default: "",
        parseHTML: (element) => element.getAttribute("data-cms-card-image-width") || "",
        renderHTML: (attributes) =>
          typeof attributes.cardImageWidth === "string" && attributes.cardImageWidth.trim()
            ? { "data-cms-card-image-width": attributes.cardImageWidth.trim() }
            : {},
      },
      cardImageHeight: {
        default: "",
        parseHTML: (element) => element.getAttribute("data-cms-card-image-height") || "",
        renderHTML: (attributes) =>
          typeof attributes.cardImageHeight === "string" && attributes.cardImageHeight.trim()
            ? { "data-cms-card-image-height": attributes.cardImageHeight.trim() }
            : {},
      },
      cardImageLink: {
        default: "",
        parseHTML: (element) => element.getAttribute("data-cms-card-image-link") || "",
        renderHTML: (attributes) =>
          typeof attributes.cardImageLink === "string" && attributes.cardImageLink.trim()
            ? { "data-cms-card-image-link": attributes.cardImageLink.trim() }
            : {},
      },
      cardIcon: {
        default: "",
        parseHTML: (element) => element.getAttribute("data-cms-card-icon") || "",
        renderHTML: (attributes) =>
          typeof attributes.cardIcon === "string" && attributes.cardIcon.trim()
            ? { "data-cms-card-icon": attributes.cardIcon.trim() }
            : {},
      },
    }
  },
  parseHTML() {
    return [{ tag: "article[data-cms-card]" }]
  },
  renderHTML({ HTMLAttributes }) {
    return ["article", mergeAttributes(HTMLAttributes, { "data-cms-card": "true" }), 0]
  },
})

const CmsSection = Node.create({
  name: "cmsSection",
  group: "block",
  content: "block+",
  defining: true,
  addAttributes() {
    return {
      class: {
        default: buildSectionClassName({
          fullWidth: false,
          spacing: DEFAULT_SECTION_NODE_SPACING,
          gapBefore: DEFAULT_SECTION_NODE_GAP_BEFORE,
          gapAfter: DEFAULT_SECTION_NODE_GAP_AFTER,
          radius: DEFAULT_SECTION_NODE_RADIUS,
          border: DEFAULT_SECTION_NODE_BORDER,
          shadow: DEFAULT_SECTION_NODE_SHADOW,
        }),
        parseHTML: (element) =>
          element.getAttribute("class") ||
          buildSectionClassName({
            fullWidth: false,
            spacing: DEFAULT_SECTION_NODE_SPACING,
            gapBefore: DEFAULT_SECTION_NODE_GAP_BEFORE,
            gapAfter: DEFAULT_SECTION_NODE_GAP_AFTER,
            radius: DEFAULT_SECTION_NODE_RADIUS,
            border: DEFAULT_SECTION_NODE_BORDER,
            shadow: DEFAULT_SECTION_NODE_SHADOW,
          }),
        renderHTML: (attributes) => (typeof attributes.class === "string" && attributes.class.trim() ? { class: attributes.class } : {}),
      },
      style: {
        default: buildSectionStyle({
          presetId: DEFAULT_SECTION_NODE_PRESET,
          border: DEFAULT_SECTION_NODE_BORDER,
        }),
        parseHTML: (element) =>
          element.getAttribute("style") ||
          buildSectionStyle({
            presetId: DEFAULT_SECTION_NODE_PRESET,
            border: DEFAULT_SECTION_NODE_BORDER,
          }),
        renderHTML: (attributes) => (typeof attributes.style === "string" && attributes.style.trim() ? { style: attributes.style } : {}),
      },
      preset: {
        default: DEFAULT_SECTION_NODE_PRESET,
        parseHTML: (element) => normalizeSectionPreset(element.getAttribute("data-cms-section-preset")),
        renderHTML: (attributes) => ({ "data-cms-section-preset": normalizeSectionPreset(attributes.preset) }),
      },
      fullWidth: {
        default: false,
        parseHTML: (element) => normalizeSectionFullWidth(element.getAttribute("data-cms-section-full-width")),
        renderHTML: (attributes) => ({ "data-cms-section-full-width": normalizeSectionFullWidth(attributes.fullWidth) ? "true" : "false" }),
      },
      constrainContent: {
        default: false,
        parseHTML: (element) => normalizeSectionConstrainContent(element.getAttribute("data-cms-section-constrain-content")),
        renderHTML: (attributes) => ({
          "data-cms-section-constrain-content": normalizeSectionConstrainContent(attributes.constrainContent) ? "true" : "false",
        }),
      },
      animateEntrance: {
        default: DEFAULT_SECTION_NODE_ANIMATE_ENTRANCE,
        parseHTML: (element) => {
          const explicit = element.getAttribute("data-cms-section-animate-entrance")
          if (explicit !== null) return normalizeSectionAnimateFlag(explicit, DEFAULT_SECTION_NODE_ANIMATE_ENTRANCE)
          const legacy = element.getAttribute("data-cms-section-animate-content")
          if (legacy !== null) return normalizeSectionAnimateFlag(legacy, DEFAULT_SECTION_NODE_ANIMATE_ENTRANCE)
          return !element.hasAttribute("data-motion-skip")
        },
        renderHTML: (attributes) => ({
          "data-cms-section-animate-entrance": normalizeSectionAnimateFlag(
            attributes.animateEntrance,
            DEFAULT_SECTION_NODE_ANIMATE_ENTRANCE,
          )
            ? "true"
            : "false",
        }),
      },
      animateExit: {
        default: DEFAULT_SECTION_NODE_ANIMATE_EXIT,
        parseHTML: (element) => {
          const explicit = element.getAttribute("data-cms-section-animate-exit")
          if (explicit !== null) return normalizeSectionAnimateFlag(explicit, DEFAULT_SECTION_NODE_ANIMATE_EXIT)
          const legacy = element.getAttribute("data-cms-section-animate-content")
          if (legacy !== null) return normalizeSectionAnimateFlag(legacy, DEFAULT_SECTION_NODE_ANIMATE_EXIT)
          return !element.hasAttribute("data-motion-skip")
        },
        renderHTML: (attributes) => {
          const animateEntrance = normalizeSectionAnimateFlag(
            attributes.animateEntrance,
            DEFAULT_SECTION_NODE_ANIMATE_ENTRANCE,
          )
          const animateExit = normalizeSectionAnimateFlag(attributes.animateExit, DEFAULT_SECTION_NODE_ANIMATE_EXIT)
          const anyAnimationEnabled = animateEntrance || animateExit
          return {
            "data-cms-section-animate-exit": animateExit ? "true" : "false",
            "data-cms-section-animate-content": anyAnimationEnabled ? "true" : "false",
            ...(anyAnimationEnabled ? {} : { "data-motion-skip": "true" }),
          }
        },
      },
      gapBefore: {
        default: DEFAULT_SECTION_NODE_GAP_BEFORE,
        parseHTML: (element) =>
          normalizeSectionGap(
            element.getAttribute("data-cms-section-gap-before"),
            inferSectionGapFromClass(element.getAttribute("class"), "before"),
          ),
        renderHTML: (attributes) => ({
          "data-cms-section-gap-before": normalizeSectionGap(attributes.gapBefore, DEFAULT_SECTION_NODE_GAP_BEFORE),
        }),
      },
      gapAfter: {
        default: DEFAULT_SECTION_NODE_GAP_AFTER,
        parseHTML: (element) =>
          normalizeSectionGap(
            element.getAttribute("data-cms-section-gap-after"),
            inferSectionGapFromClass(element.getAttribute("class"), "after"),
          ),
        renderHTML: (attributes) => ({
          "data-cms-section-gap-after": normalizeSectionGap(attributes.gapAfter, DEFAULT_SECTION_NODE_GAP_AFTER),
        }),
      },
      spacing: {
        default: DEFAULT_SECTION_NODE_SPACING,
        parseHTML: (element) => normalizeSectionSpacing(element.getAttribute("data-cms-section-spacing")),
        renderHTML: (attributes) => ({ "data-cms-section-spacing": normalizeSectionSpacing(attributes.spacing) }),
      },
      radius: {
        default: DEFAULT_SECTION_NODE_RADIUS,
        parseHTML: (element) => normalizeSectionRadius(element.getAttribute("data-cms-section-radius")),
        renderHTML: (attributes) => ({ "data-cms-section-radius": normalizeSectionRadius(attributes.radius) }),
      },
      border: {
        default: DEFAULT_SECTION_NODE_BORDER,
        parseHTML: (element) => normalizeSectionBorder(element.getAttribute("data-cms-section-border")),
        renderHTML: (attributes) => ({ "data-cms-section-border": normalizeSectionBorder(attributes.border) }),
      },
      shadow: {
        default: DEFAULT_SECTION_NODE_SHADOW,
        parseHTML: (element) => normalizeSectionShadow(element.getAttribute("data-cms-section-shadow")),
        renderHTML: (attributes) => ({ "data-cms-section-shadow": normalizeSectionShadow(attributes.shadow) }),
      },
    }
  },
  parseHTML() {
    return [{ tag: "section[data-cms-section]" }, { tag: "section" }]
  },
  renderHTML({ HTMLAttributes }) {
    return ["section", mergeAttributes(HTMLAttributes, { "data-cms-section": "true" }), 0]
  },
})

const CmsVideo = Node.create({
  name: "cmsVideo",
  group: "block",
  atom: true,
  selectable: true,
  draggable: true,
  addAttributes() {
    const parseBoolean = (value: string | null, fallback: boolean) => {
      if (value === null) return fallback
      return value.toLowerCase() === "true"
    }

    return {
      class: {
        default: "cms-video",
      },
      src: {
        default: "",
        parseHTML: (element) => element.getAttribute("data-video-src") || "",
      },
      poster: {
        default: "",
        parseHTML: (element) => element.getAttribute("data-video-poster") || "",
      },
      title: {
        default: "Video",
        parseHTML: (element) => element.getAttribute("data-video-title") || "Video",
      },
      caption: {
        default: "",
        parseHTML: (element) => element.querySelector("figcaption")?.textContent?.trim() || "",
      },
      align: {
        default: "left",
        parseHTML: (element) => {
          const value = (element.getAttribute("data-video-align") || "left").toLowerCase()
          if (value === "center" || value === "right") return value
          return "left"
        },
      },
      controls: {
        default: true,
        parseHTML: (element) => parseBoolean(element.getAttribute("data-video-controls"), true),
      },
      autoplay: {
        default: false,
        parseHTML: (element) => parseBoolean(element.getAttribute("data-video-autoplay"), false),
      },
      muted: {
        default: false,
        parseHTML: (element) => parseBoolean(element.getAttribute("data-video-muted"), false),
      },
      loop: {
        default: false,
        parseHTML: (element) => parseBoolean(element.getAttribute("data-video-loop"), false),
      },
      playsInline: {
        default: true,
        parseHTML: (element) => parseBoolean(element.getAttribute("data-video-playsinline"), true),
      },
      preload: {
        default: "metadata",
        parseHTML: (element) => element.getAttribute("data-video-preload") || "metadata",
      },
      aspectRatio: {
        default: "16/9",
        parseHTML: (element) => element.getAttribute("data-video-aspect") || "16/9",
      },
      width: {
        default: "",
        parseHTML: (element) => element.getAttribute("data-video-width") || "",
      },
      height: {
        default: "",
        parseHTML: (element) => element.getAttribute("data-video-height") || "",
      },
      viewType: {
        default: "video",
        parseHTML: (element) => element.getAttribute("data-video-view-type") || "video",
      },
      streamType: {
        default: "on-demand",
        parseHTML: (element) => element.getAttribute("data-video-stream-type") || "on-demand",
      },
      logLevel: {
        default: "warn",
        parseHTML: (element) => element.getAttribute("data-video-log-level") || "warn",
      },
      menuGroup: {
        default: "top",
        parseHTML: (element) => (element.getAttribute("data-video-menu-group") || "top").toLowerCase() === "bottom" ? "bottom" : "top",
      },
      crossOrigin: {
        default: true,
        parseHTML: (element) => parseBoolean(element.getAttribute("data-video-crossorigin"), true),
      },
      thumbnails: {
        default: "",
        parseHTML: (element) => element.getAttribute("data-video-thumbnails") || "",
      },
      tracks: {
        default: "[]",
        parseHTML: (element) => element.getAttribute("data-video-tracks") || "[]",
      },
    }
  },
  parseHTML() {
    return [{ tag: "figure[data-cms-video]" }]
  },
  renderHTML({ HTMLAttributes }) {
    const figureAttributes = mergeAttributes(
      {
        "data-cms-video": "true",
      },
      HTMLAttributes.class ? { class: HTMLAttributes.class } : { class: "cms-video" },
      HTMLAttributes.src ? { "data-video-src": HTMLAttributes.src } : {},
      HTMLAttributes.poster ? { "data-video-poster": HTMLAttributes.poster } : {},
      HTMLAttributes.title ? { "data-video-title": HTMLAttributes.title } : {},
      { "data-video-align": HTMLAttributes.align || "left" },
      { "data-video-controls": String(Boolean(HTMLAttributes.controls)) },
      { "data-video-autoplay": String(Boolean(HTMLAttributes.autoplay)) },
      { "data-video-muted": String(Boolean(HTMLAttributes.muted)) },
      { "data-video-loop": String(Boolean(HTMLAttributes.loop)) },
      { "data-video-playsinline": String(Boolean(HTMLAttributes.playsInline)) },
      { "data-video-preload": HTMLAttributes.preload || "metadata" },
      { "data-video-aspect": HTMLAttributes.aspectRatio || "16/9" },
      HTMLAttributes.width ? { "data-video-width": HTMLAttributes.width } : {},
      HTMLAttributes.height ? { "data-video-height": HTMLAttributes.height } : {},
      { "data-video-view-type": HTMLAttributes.viewType || "video" },
      { "data-video-stream-type": HTMLAttributes.streamType || "on-demand" },
      { "data-video-log-level": HTMLAttributes.logLevel || "warn" },
      { "data-video-menu-group": HTMLAttributes.menuGroup || "top" },
      { "data-video-crossorigin": String(Boolean(HTMLAttributes.crossOrigin)) },
      HTMLAttributes.thumbnails ? { "data-video-thumbnails": HTMLAttributes.thumbnails } : {},
      HTMLAttributes.tracks ? { "data-video-tracks": HTMLAttributes.tracks } : {},
    )

    const caption = typeof HTMLAttributes.caption === "string" ? HTMLAttributes.caption.trim() : ""
    if (caption) {
      return ["figure", figureAttributes, ["figcaption", { class: "mt-2 text-sm text-muted-foreground" }, caption]]
    }
    return ["figure", figureAttributes]
  },
})

const CmsFaIcon = Node.create({
  name: "cmsFaIcon",
  group: "inline",
  inline: true,
  atom: true,
  selectable: false,
  addAttributes() {
    return {
      class: {
        default: "fa-solid fa-arrow-right",
      },
      "data-cms-fa": {
        default: "fa-solid fa-arrow-right",
      },
      "aria-hidden": {
        default: "true",
      },
    }
  },
  parseHTML() {
    return [{ tag: "span[data-cms-fa]" }]
  },
  renderHTML({ HTMLAttributes }) {
    return ["span", mergeAttributes(HTMLAttributes)]
  },
})

const removeImageAlignmentStyle = (style: string) =>
  style
    .split(";")
    .map((part) => part.trim())
    .filter((part) => part && !/^(display|margin-left|margin-right)\s*:/i.test(part))
    .join(";")

const CmsImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      textAlign: {
        default: null,
        parseHTML: (element) => {
          const dataAlign = element.getAttribute("data-image-align")
          if (dataAlign === "center" || dataAlign === "right" || dataAlign === "left") return dataAlign
          const style = element.getAttribute("style") || ""
          if (/margin-left:\s*auto/i.test(style) && /margin-right:\s*auto/i.test(style)) return "center"
          if (/margin-left:\s*auto/i.test(style)) return "right"
          if (/margin-right:\s*auto/i.test(style)) return "left"
          return null
        },
        renderHTML: (attributes) => {
          const value = attributes.textAlign
          if (value !== "center" && value !== "right" && value !== "left") return {}
          const alignStyle =
            value === "center"
              ? "display:block;margin-left:auto;margin-right:auto;"
              : value === "right"
                ? "display:block;margin-left:auto;margin-right:0;"
                : "display:block;margin-left:0;margin-right:auto;"
          const existingStyle = typeof attributes.style === "string" ? removeImageAlignmentStyle(attributes.style) : ""
          return { "data-image-align": value, style: `${existingStyle ? `${existingStyle};` : ""}${alignStyle}` }
        },
      },
      style: {
        default: null,
        parseHTML: (element) => element.getAttribute("style"),
        renderHTML: (attributes) => (attributes.textAlign ? {} : attributes.style ? { style: attributes.style } : {}),
      },
      linkHref: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-image-link"),
        renderHTML: (attributes) => {
          const value = typeof attributes.linkHref === "string" ? attributes.linkHref.trim() : ""
          return value ? { "data-image-link": value } : {}
        },
      },
    }
  },
})

const CARD_ICON_TO_FA_CLASS: Record<ContentIconName, string> = {
  GraduationCap: "fa-solid fa-graduation-cap",
  BookOpen: "fa-solid fa-book-open",
  School: "fa-solid fa-school",
  Award: "fa-solid fa-award",
  Activity: "fa-solid fa-heart-pulse",
  Package: "fa-solid fa-box",
  Users: "fa-solid fa-users",
  Briefcase: "fa-solid fa-briefcase",
  Building2: "fa-solid fa-building",
  Landmark: "fa-solid fa-landmark",
  Target: "fa-solid fa-bullseye",
  ShieldCheck: "fa-solid fa-shield-halved",
  Handshake: "fa-solid fa-handshake",
  Lightbulb: "fa-solid fa-lightbulb",
  Rocket: "fa-solid fa-rocket",
  Workflow: "fa-solid fa-diagram-project",
  Settings: "fa-solid fa-gear",
  Cog: "fa-solid fa-cog",
  Wrench: "fa-solid fa-wrench",
  Monitor: "fa-solid fa-desktop",
  Cpu: "fa-solid fa-microchip",
  Database: "fa-solid fa-database",
  Cloud: "fa-solid fa-cloud",
  BarChart3: "fa-solid fa-chart-column",
  LineChart: "fa-solid fa-chart-line",
  PieChart: "fa-solid fa-chart-pie",
  FileText: "fa-solid fa-file-lines",
  CheckCircle2: "fa-solid fa-circle-check",
  Calendar: "fa-solid fa-calendar",
  MessageSquare: "fa-solid fa-message",
  Mail: "fa-solid fa-envelope",
  Phone: "fa-solid fa-phone",
  ShoppingCart: "fa-solid fa-cart-shopping",
  Truck: "fa-solid fa-truck",
  Boxes: "fa-solid fa-boxes-stacked",
  Globe: "fa-solid fa-globe",
}

const CARD_FA_CLASS_TO_ICON = Object.entries(CARD_ICON_TO_FA_CLASS).reduce<Record<string, ContentIconName>>((acc, [name, className]) => {
  const key = className.trim().toLowerCase()
  if (key) {
    acc[key] = name as ContentIconName
  }
  return acc
}, {})

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")

const extractHtmlAttributeValue = (html: string, attributeName: string) => {
  if (!html || !attributeName) return ""
  const escapedName = attributeName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  const match = html.match(new RegExp(`\\b${escapedName}\\s*=\\s*["']([^"']+)["']`, "i"))
  return match?.[1]?.trim() || ""
}

const extractImagePreviewFromHtml = (html: string) => {
  const trimmed = html.trim()
  if (!trimmed) return null
  const imgMatch = trimmed.match(/<img\b[^>]*>/i)
  if (!imgMatch) return null
  const imgTag = imgMatch[0]
  const src = extractHtmlAttributeValue(imgTag, "src")
  if (!src) return null
  return {
    src,
    alt: extractHtmlAttributeValue(imgTag, "alt"),
  }
}

const SOURCE_EDITOR_THEME = EditorView.theme({
  "&": {
    display: "block",
    width: "100%",
    maxWidth: "100%",
    overflow: "hidden",
  },
  ".cm-editor": {
    width: "100%",
    maxWidth: "100%",
    overflow: "hidden",
  },
  ".cm-scroller": {
    width: "100%",
    maxWidth: "100%",
    overflowX: "auto",
    overflowY: "auto",
  },
  ".cm-content": {
    minWidth: "100%",
  },
})

const SOURCE_EDITOR_NOWRAP_THEME = EditorView.theme({
  ".cm-content": {
    width: "max-content",
    minWidth: "100%",
    whiteSpace: "pre !important",
    wordBreak: "normal",
    overflowWrap: "normal",
  },
  ".cm-line": {
    whiteSpace: "pre !important",
  },
})

const INLINE_SVG_PATTERN = /<svg\b/i

function containsInlineSvgMarkup(raw: string) {
  return INLINE_SVG_PATTERN.test(raw || "")
}

const TEXT_COLOR_OPTIONS = [
  { label: "Default", value: "" },
  { label: "White", value: "#ffffff" },
  { label: "Black", value: "#111827" },
  { label: "Blue", value: "#1d4ed8" },
  { label: "Green", value: "#047857" },
  { label: "Red", value: "#b91c1c" },
  { label: "Orange", value: "#c2410c" },
  { label: "Purple", value: "#7c3aed" },
] as const

const HIGHLIGHT_COLOR_OPTIONS = [
  { label: "White", value: "#ffffff" },
  { label: "Yellow", value: "#fef08a" },
  { label: "Mint", value: "#bbf7d0" },
  { label: "Sky", value: "#bfdbfe" },
  { label: "Rose", value: "#fecdd3" },
] as const

export function RichTextEditor({ content, onChange }: RichTextEditorProps) {
  const [mode, setMode] = useState<"visual" | "source" | "preview">("visual")
  const [sourceHtml, setSourceHtml] = useState(content || "")
  const [sourceWrapEnabled, setSourceWrapEnabled] = useState(true)
  const [selectedTextColor, setSelectedTextColor] = useState(TEXT_COLOR_OPTIONS[1].value)
  const [selectedHighlightColor, setSelectedHighlightColor] = useState(HIGHLIGHT_COLOR_OPTIONS[0].value)
  const [showTextColorMenu, setShowTextColorMenu] = useState(false)
  const [showHighlightColorMenu, setShowHighlightColorMenu] = useState(false)
  const [showIconPicker, setShowIconPicker] = useState(false)
  const [iconSearch, setIconSearch] = useState("")
  const [selectedIconClass, setSelectedIconClass] = useState("")
  const [selectedKeywordToken, setSelectedKeywordToken] = useState(CONTENT_KEYWORD_OPTIONS[0]?.token ?? "{sitetitle}")
  const [pendingButtonVariant, setPendingButtonVariant] = useState<ButtonVariant>("primary")
  const [pendingButtonSize, setPendingButtonSize] = useState<ButtonSize>("md")
  const [pendingButtonLabel, setPendingButtonLabel] = useState("Get Started")
  const [pendingButtonHref, setPendingButtonHref] = useState("/contact")
  const [pendingButtonTextColor, setPendingButtonTextColor] = useState("")
  const [pendingButtonBgColor, setPendingButtonBgColor] = useState("")
  const [pendingButtonHoverColor, setPendingButtonHoverColor] = useState("")
  const [pendingButtonHoverTextColor, setPendingButtonHoverTextColor] = useState("")
  const [pendingButtonBorderColor, setPendingButtonBorderColor] = useState("")
  const [pendingButtonHoverBorderColor, setPendingButtonHoverBorderColor] = useState("")
  const [pendingButtonBorderWidth, setPendingButtonBorderWidth] = useState("1")
  const [pendingButtonRadius, setPendingButtonRadius] = useState("8")
  const [pendingButtonLeadingVisualHtml, setPendingButtonLeadingVisualHtml] = useState("")
  const [buttonFormMode, setButtonFormMode] = useState<"insert" | "edit">("insert")
  const [editingButtonRange, setEditingButtonRange] = useState<{ from: number; to: number } | null>(null)
  const [faIcons, setFaIcons] = useState<Array<{ name: string; className: string }>>(fontAwesomeIcons)
  const [sourceSeed, setSourceSeed] = useState("")
  const [ignoreSourceInitChange, setIgnoreSourceInitChange] = useState(false)
  const [sourceDirty, setSourceDirty] = useState(false)
  const [allowSvgVisualMode, setAllowSvgVisualMode] = useState(false)
  const latestModeRef = useRef<"visual" | "source" | "preview">("visual")
  const latestContentRef = useRef(content || "")
  const allowSvgVisualModeRef = useRef(false)
  const [isCursorInTable, setIsCursorInTable] = useState(false)
  const [isMobileStackActive, setIsMobileStackActive] = useState(true)
  const [tableAlignState, setTableAlignState] = useState<"left" | "center" | "right">("left")
  const [showImageForm, setShowImageForm] = useState(false)
  const [imageSource, setImageSource] = useState("")
  const [imageAltText, setImageAltText] = useState("")
  const [imageTitleText, setImageTitleText] = useState("")
  const [imageWidth, setImageWidth] = useState("")
  const [imageHeight, setImageHeight] = useState("")
  const [imageLinkUrl, setImageLinkUrl] = useState("")
  const [imageFormMode, setImageFormMode] = useState<"insert" | "edit">("insert")
  const [selectedImagePos, setSelectedImagePos] = useState<number | null>(null)
  const [editingImagePos, setEditingImagePos] = useState<number | null>(null)
  const [selectedAccordionPos, setSelectedAccordionPos] = useState<number | null>(null)
  const [showSectionForm, setShowSectionForm] = useState(false)
  const [sectionFormMode, setSectionFormMode] = useState<"insert" | "edit">("insert")
  const [selectedSectionPos, setSelectedSectionPos] = useState<number | null>(null)
  const [editingSectionPos, setEditingSectionPos] = useState<number | null>(null)
  const [sectionPreset, setSectionPreset] = useState<SectionPresetId>(DEFAULT_SECTION_INSERT_PRESET)
  const [sectionFullWidth, setSectionFullWidth] = useState(DEFAULT_SECTION_INSERT_FULL_WIDTH)
  const [sectionConstrainContent, setSectionConstrainContent] = useState(DEFAULT_SECTION_INSERT_CONSTRAIN_CONTENT)
  const [sectionAnimateEntrance, setSectionAnimateEntrance] = useState(DEFAULT_SECTION_INSERT_ANIMATE_ENTRANCE)
  const [sectionAnimateExit, setSectionAnimateExit] = useState(DEFAULT_SECTION_INSERT_ANIMATE_EXIT)
  const [sectionSpacing, setSectionSpacing] = useState<SectionSpacing>(DEFAULT_SECTION_INSERT_SPACING)
  const [sectionGapBefore, setSectionGapBefore] = useState<SectionGap>(DEFAULT_SECTION_INSERT_GAP_BEFORE)
  const [sectionGapAfter, setSectionGapAfter] = useState<SectionGap>(DEFAULT_SECTION_INSERT_GAP_AFTER)
  const [sectionRadius, setSectionRadius] = useState<SectionRadius>(DEFAULT_SECTION_INSERT_RADIUS)
  const [sectionBorder, setSectionBorder] = useState<SectionBorder>(DEFAULT_SECTION_INSERT_BORDER)
  const [sectionShadow, setSectionShadow] = useState<SectionShadow>(DEFAULT_SECTION_INSERT_SHADOW)
  const [sectionFormError, setSectionFormError] = useState<string | null>(null)
  const [showCardForm, setShowCardForm] = useState(false)
  const [cardFormMode, setCardFormMode] = useState<"insert" | "edit">("insert")
  const [selectedCardPos, setSelectedCardPos] = useState<number | null>(null)
  const [editingCardPos, setEditingCardPos] = useState<number | null>(null)
  const [cardTitle, setCardTitle] = useState("")
  const [cardBody, setCardBody] = useState("")
  const [cardImageSource, setCardImageSource] = useState("")
  const [cardImageAltText, setCardImageAltText] = useState("")
  const [cardImageWidth, setCardImageWidth] = useState("")
  const [cardImageHeight, setCardImageHeight] = useState("")
  const [cardImageLinkUrl, setCardImageLinkUrl] = useState("")
  const [cardIconName, setCardIconName] = useState<ContentIconName | "">("")
  const [cardImageUploading, setCardImageUploading] = useState(false)
  const [cardFormError, setCardFormError] = useState<string | null>(null)
  const [showVideoForm, setShowVideoForm] = useState(false)
  const [videoUrl, setVideoUrl] = useState("")
  const [videoPoster, setVideoPoster] = useState("")
  const [videoTitle, setVideoTitle] = useState("")
  const [videoCaption, setVideoCaption] = useState("")
  const [videoAlign, setVideoAlign] = useState<"left" | "center" | "right">("left")
  const [videoAspectRatio, setVideoAspectRatio] = useState("16/9")
  const [videoWidth, setVideoWidth] = useState("")
  const [videoHeight, setVideoHeight] = useState("")
  const [videoPreload, setVideoPreload] = useState<"none" | "metadata" | "auto">("metadata")
  const [videoViewType, setVideoViewType] = useState<"video" | "audio">("video")
  const [videoStreamType, setVideoStreamType] = useState<"unknown" | "on-demand" | "live" | "live:dvr" | "ll-live" | "ll-live:dvr">(
    "on-demand",
  )
  const [videoLogLevel, setVideoLogLevel] = useState<"silent" | "error" | "warn" | "info" | "debug">("warn")
  const [videoCrossOrigin, setVideoCrossOrigin] = useState(true)
  const [videoThumbnails, setVideoThumbnails] = useState("")
  const [videoTracksJson, setVideoTracksJson] = useState("[]")
  const [videoControls, setVideoControls] = useState(true)
  const [videoAutoplay, setVideoAutoplay] = useState(false)
  const [videoMuted, setVideoMuted] = useState(false)
  const [videoLoop, setVideoLoop] = useState(false)
  const [videoPlaysInline, setVideoPlaysInline] = useState(true)
  const [videoUploading, setVideoUploading] = useState(false)
  const [videoUploadError, setVideoUploadError] = useState<string | null>(null)
  const [posterUploading, setPosterUploading] = useState(false)
  const [posterUploadError, setPosterUploadError] = useState<string | null>(null)
  const [imageUploading, setImageUploading] = useState(false)
  const [imageUploadError, setImageUploadError] = useState<string | null>(null)
  const [videoTracksError, setVideoTracksError] = useState<string | null>(null)
  const [videoFormMode, setVideoFormMode] = useState<"insert" | "edit">("insert")
  const [selectedVideoPos, setSelectedVideoPos] = useState<number | null>(null)
  const [editingVideoPos, setEditingVideoPos] = useState<number | null>(null)
  const videoFileInputRef = useRef<HTMLInputElement | null>(null)
  const posterFileInputRef = useRef<HTMLInputElement | null>(null)
  const imageFileInputRef = useRef<HTMLInputElement | null>(null)
  const cardImageFileInputRef = useRef<HTMLInputElement | null>(null)
  const toImageDimensionInput = (value: unknown) => {
    if (typeof value === "number" && Number.isFinite(value)) return String(value)
    if (typeof value === "string") return value
    return ""
  }

  const openImageFormForNode = (attrs: Record<string, unknown>, nodePos: number) => {
    setShowIconPicker(false)
    setPendingButtonVariant("primary")
    setPendingButtonLabel("")
    setPendingButtonHref("")
    setShowVideoForm(false)
    setShowCardForm(false)
    setShowSectionForm(false)
    setImageSource(typeof attrs.src === "string" ? attrs.src : "")
    setImageAltText(typeof attrs.alt === "string" ? attrs.alt : "")
    setImageTitleText(typeof attrs.title === "string" ? attrs.title : "")
    setImageWidth(toImageDimensionInput(attrs.width))
    setImageHeight(toImageDimensionInput(attrs.height))
    setImageLinkUrl(typeof attrs.linkHref === "string" ? attrs.linkHref : "")
    setImageUploadError(null)
    setImageUploading(false)
    setImageFormMode("edit")
    setEditingImagePos(nodePos)
    setShowImageForm(true)
  }

  const isContentIconName = (value: string): value is ContentIconName =>
    CONTENT_ICON_OPTIONS.includes(value as ContentIconName)

  const normalizeCardIconNameFromClass = (value: string) => {
    const normalized = value.trim().toLowerCase()
    if (!normalized) return ""
    const exact = CARD_FA_CLASS_TO_ICON[normalized]
    if (exact) return exact
    const tokens = new Set(normalized.split(/\s+/).filter(Boolean))
    for (const [name, className] of Object.entries(CARD_ICON_TO_FA_CLASS)) {
      const required = className.toLowerCase().split(/\s+/).filter(Boolean)
      if (required.every((token) => tokens.has(token))) {
        return name as ContentIconName
      }
    }
    return ""
  }

  const buildCardHtml = (params: {
    title: string
    body: string
    imageSource: string
    imageAltText: string
    imageWidth: string
    imageHeight: string
    imageLinkUrl: string
    iconName: ContentIconName | ""
  }) => {
    const titleText = params.title.trim() || "Card title"
    const bodyText = params.body.trim() || "Card description text."
    const imageSource = params.imageSource.trim()
    const imageAltText = params.imageAltText.trim()
    const imageWidth = params.imageWidth.trim()
    const imageHeight = params.imageHeight.trim()
    const imageLinkUrl = params.imageLinkUrl.trim()
    const iconName = imageSource ? "" : params.iconName
    const iconClass = iconName ? CARD_ICON_TO_FA_CLASS[iconName] || "" : ""

    const mediaHtml = imageSource
      ? (() => {
          const src = escapeHtml(imageSource)
          const alt = imageAltText ? ` alt="${escapeHtml(imageAltText)}"` : ""
          const width = imageWidth && /^\d+$/.test(imageWidth) ? ` width="${imageWidth}"` : ""
          const height = imageHeight && /^\d+$/.test(imageHeight) ? ` height="${imageHeight}"` : ""
          const link = imageLinkUrl ? ` data-image-link="${escapeHtml(imageLinkUrl)}"` : ""
          return `<p><img src="${src}"${alt}${width}${height}${link} class="max-w-full h-auto rounded-lg" /></p>`
        })()
      : iconClass
        ? `<p><span data-cms-fa="${escapeHtml(iconClass)}" class="${escapeHtml(iconClass)} text-2xl" aria-hidden="true"></span></p>`
        : ""

    const cardAttrs = [
      `data-cms-card="true"`,
      `data-cms-card-title="${escapeHtml(titleText)}"`,
      `data-cms-card-body="${escapeHtml(bodyText)}"`,
      imageSource ? `data-cms-card-image="${escapeHtml(imageSource)}"` : "",
      imageAltText ? `data-cms-card-image-alt="${escapeHtml(imageAltText)}"` : "",
      imageWidth && /^\d+$/.test(imageWidth) ? `data-cms-card-image-width="${imageWidth}"` : "",
      imageHeight && /^\d+$/.test(imageHeight) ? `data-cms-card-image-height="${imageHeight}"` : "",
      imageLinkUrl ? `data-cms-card-image-link="${escapeHtml(imageLinkUrl)}"` : "",
      iconName ? `data-cms-card-icon="${escapeHtml(iconName)}"` : "",
    ]
      .filter(Boolean)
      .join(" ")

    return `<article ${cardAttrs}>${mediaHtml}<h3>${escapeHtml(titleText)}</h3><p>${escapeHtml(bodyText)}</p></article>`
  }

  const resetCardForm = () => {
    setCardTitle("")
    setCardBody("")
    setCardImageSource("")
    setCardImageAltText("")
    setCardImageWidth("")
    setCardImageHeight("")
    setCardImageLinkUrl("")
    setCardIconName("")
    setCardFormError(null)
    setCardImageUploading(false)
  }

  const closeCardForm = () => {
    setShowCardForm(false)
    setCardFormMode("insert")
    setEditingCardPos(null)
    resetCardForm()
    if (cardImageFileInputRef.current) {
      cardImageFileInputRef.current.value = ""
    }
  }

  const startInsertCardFlow = () => {
    setShowIconPicker(false)
    setShowImageForm(false)
    setShowVideoForm(false)
    setShowSectionForm(false)
    setPendingButtonVariant("primary")
    setPendingButtonLabel("")
    setPendingButtonHref("")
    resetCardForm()
    setCardFormMode("insert")
    setEditingCardPos(null)
    setShowCardForm(true)
  }

  const extractCardDataFromNode = (nodePos: number) => {
    const node = editor.state.doc.nodeAt(nodePos)
    if (!node || node.type.name !== "cmsCard") return null
    const attrs = node.attrs as Record<string, unknown>

    let nextTitle = typeof attrs.cardTitle === "string" ? attrs.cardTitle.trim() : ""
    let nextBody = typeof attrs.cardBody === "string" ? attrs.cardBody.trim() : ""
    let nextImageSource = typeof attrs.cardImage === "string" ? attrs.cardImage.trim() : ""
    let nextImageAlt = typeof attrs.cardImageAlt === "string" ? attrs.cardImageAlt.trim() : ""
    let nextImageWidth = typeof attrs.cardImageWidth === "string" ? attrs.cardImageWidth.trim() : ""
    let nextImageHeight = typeof attrs.cardImageHeight === "string" ? attrs.cardImageHeight.trim() : ""
    let nextImageLink = typeof attrs.cardImageLink === "string" ? attrs.cardImageLink.trim() : ""
    let nextIconName: ContentIconName | "" =
      typeof attrs.cardIcon === "string" && isContentIconName(attrs.cardIcon.trim()) ? attrs.cardIcon.trim() : ""

    const bodyParts: string[] = []
    node.forEach((blockNode) => {
      if (blockNode.type.name === "heading" && !nextTitle) {
        const headingText = blockNode.textContent.trim()
        if (headingText) nextTitle = headingText
        return
      }
      if (blockNode.type.name !== "paragraph") return

      let hasMedia = false
      blockNode.forEach((inlineNode) => {
        if (inlineNode.type.name === "image" && !nextImageSource) {
          const imageAttrs = inlineNode.attrs as Record<string, unknown>
          nextImageSource = typeof imageAttrs.src === "string" ? imageAttrs.src.trim() : ""
          nextImageAlt = typeof imageAttrs.alt === "string" ? imageAttrs.alt.trim() : ""
          nextImageWidth = toImageDimensionInput(imageAttrs.width)
          nextImageHeight = toImageDimensionInput(imageAttrs.height)
          nextImageLink = typeof imageAttrs.linkHref === "string" ? imageAttrs.linkHref.trim() : ""
          hasMedia = true
        } else if (inlineNode.type.name === "cmsFaIcon" && !nextIconName) {
          const className = typeof inlineNode.attrs?.class === "string" ? inlineNode.attrs.class : ""
          const mapped = normalizeCardIconNameFromClass(className)
          if (mapped) {
            nextIconName = mapped
          }
          hasMedia = true
        }
      })

      const text = blockNode.textContent.trim()
      if (!hasMedia && text) {
        bodyParts.push(text)
      }
    })

    if (!nextTitle) {
      nextTitle = "Card title"
    }
    if (!nextBody) {
      nextBody = bodyParts.join("\n\n") || "Card description text."
    }

    return {
      title: nextTitle,
      body: nextBody,
      imageSource: nextImageSource,
      imageAltText: nextImageAlt,
      imageWidth: nextImageWidth,
      imageHeight: nextImageHeight,
      imageLinkUrl: nextImageLink,
      iconName: nextIconName,
    }
  }

  const startEditCardFlow = () => {
    if (selectedCardPos === null) return
    const existing = extractCardDataFromNode(selectedCardPos)
    if (!existing) return

    setShowIconPicker(false)
    setShowImageForm(false)
    setShowVideoForm(false)
    setShowSectionForm(false)
    setCardTitle(existing.title)
    setCardBody(existing.body)
    setCardImageSource(existing.imageSource)
    setCardImageAltText(existing.imageAltText)
    setCardImageWidth(existing.imageWidth)
    setCardImageHeight(existing.imageHeight)
    setCardImageLinkUrl(existing.imageLinkUrl)
    setCardIconName(existing.iconName)
    setCardFormError(null)
    setCardFormMode("edit")
    setEditingCardPos(selectedCardPos)
    setShowCardForm(true)
  }

  const submitCardForm = () => {
    const imageSource = cardImageSource.trim()
    const imageWidth = cardImageWidth.trim()
    const imageHeight = cardImageHeight.trim()

    if (imageWidth && !/^\d+$/.test(imageWidth)) {
      setCardFormError("Card image width must be a positive number in pixels.")
      return
    }
    if (imageHeight && !/^\d+$/.test(imageHeight)) {
      setCardFormError("Card image height must be a positive number in pixels.")
      return
    }

    const html = buildCardHtml({
      title: cardTitle,
      body: cardBody,
      imageSource,
      imageAltText: cardImageAltText,
      imageWidth,
      imageHeight,
      imageLinkUrl: cardImageLinkUrl,
      iconName: cardIconName,
    })

    if (cardFormMode === "edit" && editingCardPos !== null) {
      const node = editor.state.doc.nodeAt(editingCardPos)
      if (!node || node.type.name !== "cmsCard") {
        setCardFormError("Could not update the selected card. Please select the card again.")
        return
      }
      const updated = editor
        .chain()
        .focus()
        .insertContentAt({ from: editingCardPos, to: editingCardPos + node.nodeSize }, html)
        .run()
      if (!updated) {
        setCardFormError("Could not update the selected card.")
        return
      }
    } else {
      const inserted = editor.chain().focus().insertContent(`${html}<p></p>`).run()
      if (!inserted) {
        setCardFormError("Could not insert card at the current cursor position.")
        return
      }
    }

    closeCardForm()
  }

  const uploadCardImage = async (file: File | null) => {
    if (!file) return
    if (!file.type.startsWith("image/")) {
      setCardFormError("Please choose a valid image file.")
      return
    }
    setCardImageUploading(true)
    setCardFormError(null)
    try {
      const payload = new FormData()
      payload.append("file", file)
      payload.append("folder", "images")
      const response = await fetch("/api/admin/uploads", { method: "POST", body: payload })
      const result = await response.json().catch(() => ({}))
      if (!response.ok || (!result?.key && !result?.url)) {
        throw new Error(result?.error || "Image upload failed")
      }
      const src =
        typeof result?.key === "string" && result.key.trim().length > 0
          ? result.key.trim()
          : typeof result?.url === "string"
            ? result.url.trim()
            : ""
      if (!src) {
        throw new Error("Image upload failed")
      }
      setCardImageSource(src)
    } catch (error) {
      setCardFormError(error instanceof Error ? error.message : "Image upload failed")
    } finally {
      setCardImageUploading(false)
      if (cardImageFileInputRef.current) {
        cardImageFileInputRef.current.value = ""
      }
    }
  }

  const resetSectionForm = () => {
    setSectionPreset(DEFAULT_SECTION_INSERT_PRESET)
    setSectionFullWidth(DEFAULT_SECTION_INSERT_FULL_WIDTH)
    setSectionConstrainContent(DEFAULT_SECTION_INSERT_CONSTRAIN_CONTENT)
    setSectionAnimateEntrance(DEFAULT_SECTION_INSERT_ANIMATE_ENTRANCE)
    setSectionAnimateExit(DEFAULT_SECTION_INSERT_ANIMATE_EXIT)
    setSectionSpacing(DEFAULT_SECTION_INSERT_SPACING)
    setSectionGapBefore(DEFAULT_SECTION_INSERT_GAP_BEFORE)
    setSectionGapAfter(DEFAULT_SECTION_INSERT_GAP_AFTER)
    setSectionRadius(DEFAULT_SECTION_INSERT_RADIUS)
    setSectionBorder(DEFAULT_SECTION_INSERT_BORDER)
    setSectionShadow(DEFAULT_SECTION_INSERT_SHADOW)
    setSectionFormError(null)
  }

  const closeSectionForm = () => {
    setShowSectionForm(false)
    setSectionFormMode("insert")
    setEditingSectionPos(null)
    setSectionFormError(null)
  }

  const startInsertSectionFlow = () => {
    setShowIconPicker(false)
    setShowImageForm(false)
    setShowVideoForm(false)
    setShowCardForm(false)
    setPendingButtonVariant("primary")
    setPendingButtonLabel("")
    setPendingButtonHref("")
    resetSectionForm()
    setSectionFormMode("insert")
    setEditingSectionPos(null)
    setShowSectionForm(true)
  }

  const startEditSectionFlow = () => {
    if (selectedSectionPos === null) return
    const node = editor.state.doc.nodeAt(selectedSectionPos)
    if (!node || node.type.name !== "cmsSection") return

    const attrs = node.attrs as Record<string, unknown>
    setSectionPreset(normalizeSectionPreset(attrs.preset))
    setSectionFullWidth(normalizeSectionFullWidth(attrs.fullWidth))
    setSectionConstrainContent(normalizeSectionConstrainContent(attrs.constrainContent))
    const legacyAnimateFlag = normalizeSectionAnimateFlag(attrs.animateContent, true)
    setSectionAnimateEntrance(normalizeSectionAnimateFlag(attrs.animateEntrance, legacyAnimateFlag))
    setSectionAnimateExit(normalizeSectionAnimateFlag(attrs.animateExit, legacyAnimateFlag))
    setSectionSpacing(normalizeSectionSpacing(attrs.spacing))
    setSectionGapBefore(normalizeSectionGap(attrs.gapBefore, DEFAULT_SECTION_NODE_GAP_BEFORE))
    setSectionGapAfter(normalizeSectionGap(attrs.gapAfter, DEFAULT_SECTION_NODE_GAP_AFTER))
    setSectionRadius(normalizeSectionRadius(attrs.radius))
    setSectionBorder(normalizeSectionBorder(attrs.border))
    setSectionShadow(normalizeSectionShadow(attrs.shadow))
    setSectionFormError(null)
    setSectionFormMode("edit")
    setEditingSectionPos(selectedSectionPos)
    setShowIconPicker(false)
    setShowImageForm(false)
    setShowVideoForm(false)
    setShowCardForm(false)
    setShowSectionForm(true)
  }

  const submitSectionForm = () => {
    const nextAttrs = buildSectionNodeAttrs({
      preset: sectionPreset,
      fullWidth: sectionFullWidth,
      constrainContent: sectionConstrainContent,
      animateEntrance: sectionAnimateEntrance,
      animateExit: sectionAnimateExit,
      spacing: sectionSpacing,
      gapBefore: sectionGapBefore,
      gapAfter: sectionGapAfter,
      radius: sectionRadius,
      border: sectionBorder,
      shadow: sectionShadow,
    })

    if (sectionFormMode === "edit" && editingSectionPos !== null) {
      const updated = editor
        .chain()
        .focus()
        .command(({ tr, dispatch }) => {
          const node = tr.doc.nodeAt(editingSectionPos)
          if (!node || node.type.name !== "cmsSection") return false
          tr.setNodeMarkup(editingSectionPos, undefined, { ...node.attrs, ...nextAttrs })
          if (dispatch) dispatch(tr)
          return true
        })
        .run()
      if (!updated) {
        setSectionFormError("Could not update the selected section. Please select the section again.")
        return
      }
      editor.commands.setNodeSelection(editingSectionPos)
    } else {
      const inserted = editor
        .chain()
        .focus()
        .insertContent([
          {
            type: "cmsSection",
            attrs: nextAttrs,
            content: [
              {
                type: "heading",
                attrs: { level: 2 },
                content: [{ type: "text", text: "Section heading" }],
              },
              {
                type: "paragraph",
                content: [{ type: "text", text: "Section content goes here." }],
              },
            ],
          },
          { type: "paragraph" },
        ])
        .run()
      if (!inserted) {
        setSectionFormError("Could not insert section at the current cursor position.")
        return
      }
    }

    closeSectionForm()
  }

  const startEditAccordionFlow = () => {
    if (selectedAccordionPos === null) return
    const node = editor.state.doc.nodeAt(selectedAccordionPos)
    if (!node || node.type.name !== "accordionDetails") return

    const summaryNode = node.firstChild
    const currentTitle =
      summaryNode && summaryNode.type.name === "accordionSummary"
        ? summaryNode.textContent.trim() || "Accordion title"
        : "Accordion title"

    const bodyParts: string[] = []
    for (let index = 1; index < node.childCount; index += 1) {
      const child = node.child(index)
      const text = child.textContent.trim()
      if (text) {
        bodyParts.push(text)
      }
    }
    const currentBody = bodyParts.join("\n\n") || "Accordion content goes here."

    const nextTitleRaw = window.prompt("Accordion title", currentTitle)
    if (nextTitleRaw === null) return
    const nextTitle = nextTitleRaw.trim() || "Accordion title"
    const nextBodyRaw = window.prompt("Accordion content", currentBody)
    if (nextBodyRaw === null) return
    const nextBody = nextBodyRaw.trim() || "Accordion content goes here."

    const replacement =
      `<details data-cms-accordion="true" class="rounded-md border border-border p-3">` +
      `<summary data-cms-accordion-summary="true" class="cursor-pointer font-semibold">${escapeHtml(nextTitle)}</summary>` +
      `<p class="mt-2 text-muted-foreground">${escapeHtml(nextBody)}</p>` +
      `</details>`

    const updated = editor
      .chain()
      .focus()
      .insertContentAt({ from: selectedAccordionPos, to: selectedAccordionPos + node.nodeSize }, replacement)
      .run()
    if (!updated) {
      window.alert("Could not update the selected accordion.")
    }
  }

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      CmsLink.configure({
        openOnClick: false,
      }),
      CmsImage.configure({
        HTMLAttributes: {
          class: "max-w-full h-auto rounded-lg",
        },
      }),
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: "cms-table",
        },
      }).extend({
        addAttributes() {
          return {
            ...this.parent?.(),
            class: {
              default: "cms-table cms-table-border-solid",
              parseHTML: (element) => element.getAttribute("class"),
              renderHTML: (attributes) => (attributes.class ? { class: attributes.class } : {}),
            },
            borderStyle: {
              default: "solid",
              parseHTML: (element) => element.getAttribute("data-border-style") || "solid",
              renderHTML: (attributes) => (attributes.borderStyle ? { "data-border-style": attributes.borderStyle } : {}),
            },
            style: {
              default: null,
              parseHTML: (element) => element.getAttribute("style"),
              renderHTML: (attributes) => (attributes.style ? { style: attributes.style } : {}),
            },
            responsiveMode: {
              default: "stack",
              parseHTML: (element) => element.getAttribute("data-responsive-mode") || "stack",
              renderHTML: (attributes) => ({ "data-responsive-mode": attributes.responsiveMode || "stack" }),
            },
          }
        },
      }),
      TableRow,
      CmsTableHeader,
      CmsTableCell,
      TextAlign.configure({
        types: ["heading", "paragraph", "tableHeader", "tableCell", "image"],
      }),
      AccordionSummary,
      AccordionDetails,
      CmsSection,
      CmsCard,
      CmsVideo,
      CmsFaIcon,
    ],
    content,
    onUpdate: ({ editor }) => {
      if (latestModeRef.current !== "visual") return
      const nextHtml = editor.getHTML()
      const incoming = latestContentRef.current
      if (!allowSvgVisualModeRef.current && containsInlineSvgMarkup(incoming) && !containsInlineSvgMarkup(nextHtml)) return
      onChange(nextHtml)
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none h-[520px] overflow-y-auto overflow-x-hidden p-4 border border-input rounded-b-md focus:outline-none focus:ring-2 focus:ring-ring",
      },
    },
    immediatelyRender: false,
  })

  useEffect(() => {
    latestModeRef.current = mode
  }, [mode])

  useEffect(() => {
    latestContentRef.current = content || ""
  }, [content])

  useEffect(() => {
    allowSvgVisualModeRef.current = allowSvgVisualMode
  }, [allowSvgVisualMode])

  useEffect(() => {
    if (containsInlineSvgMarkup(content || "")) return
    setAllowSvgVisualMode(false)
  }, [content])

  useEffect(() => {
    if (!editor) return
    const incoming = content || ""
    if (mode !== "source") {
      setSourceHtml(incoming)
    }
    if (mode === "visual" && incoming !== editor.getHTML()) {
      editor.commands.setContent(incoming, { emitUpdate: false })
    }
  }, [content, editor, mode])

  useEffect(() => {
    if (!editor || mode !== "visual" || allowSvgVisualMode) return
    const incoming = content || ""
    if (!containsInlineSvgMarkup(incoming)) return
    const editorHtml = editor.getHTML()
    if (containsInlineSvgMarkup(editorHtml)) return
    setSourceSeed(incoming)
    setSourceHtml(incoming)
    setIgnoreSourceInitChange(true)
    setMode("source")
  }, [allowSvgVisualMode, content, editor, mode])

  useEffect(() => {
    if (faIcons.length === 0) setFaIcons(fontAwesomeIcons)
  }, [faIcons.length])

  useEffect(() => {
    if (!editor) return
    const updateTableState = () => setIsCursorInTable(editor.isActive("table"))
    updateTableState()
    editor.on("selectionUpdate", updateTableState)
    editor.on("transaction", updateTableState)
    return () => {
      editor.off("selectionUpdate", updateTableState)
      editor.off("transaction", updateTableState)
    }
  }, [editor])

  useEffect(() => {
    if (!editor) return

    const updateResponsiveState = () => {
      if (!editor.isActive("table")) {
        setIsMobileStackActive(false)
        return
      }

      const attrs = editor.getAttributes("table") as Record<string, unknown>
      const mode = typeof attrs.responsiveMode === "string" ? attrs.responsiveMode : "stack"
      setIsMobileStackActive(mode === "stack")
    }

    updateResponsiveState()
    editor.on("selectionUpdate", updateResponsiveState)
    editor.on("transaction", updateResponsiveState)
    return () => {
      editor.off("selectionUpdate", updateResponsiveState)
      editor.off("transaction", updateResponsiveState)
    }
  }, [editor])

  useEffect(() => {
    if (!editor) return

    const updateTableAlignState = () => {
      if (!editor.isActive("table")) {
        setTableAlignState("left")
        return
      }
      const attrs = editor.getAttributes("table") as Record<string, unknown>
      const styleVars = parseStyleVars(typeof attrs.style === "string" ? attrs.style : null)
      const marginLeft = (styleVars["margin-left"] || "").trim().toLowerCase()
      const marginRight = (styleVars["margin-right"] || "").trim().toLowerCase()

      if (marginLeft === "auto" && marginRight === "auto") {
        setTableAlignState("center")
        return
      }
      if (marginLeft === "auto" && marginRight !== "auto") {
        setTableAlignState("right")
        return
      }
      setTableAlignState("left")
    }

    updateTableAlignState()
    editor.on("selectionUpdate", updateTableAlignState)
    editor.on("transaction", updateTableAlignState)
    return () => {
      editor.off("selectionUpdate", updateTableAlignState)
      editor.off("transaction", updateTableAlignState)
    }
  }, [editor])

  useEffect(() => {
    if (!editor) return

    const updateSelectedVideo = () => {
      let foundPos: number | null = null

      editor.state.doc.nodesBetween(editor.state.selection.from, editor.state.selection.to, (node, pos) => {
        if (node.type.name !== "cmsVideo") return true
        foundPos = pos
        return false
      })

      if (foundPos === null) {
        const { $from } = editor.state.selection
        for (let depth = $from.depth; depth >= 0; depth -= 1) {
          const node = $from.node(depth)
          if (node.type.name !== "cmsVideo") continue
          foundPos = depth > 0 ? $from.before(depth) : 0
          break
        }
      }

      setSelectedVideoPos(foundPos)
    }

    updateSelectedVideo()
    editor.on("selectionUpdate", updateSelectedVideo)
    editor.on("transaction", updateSelectedVideo)
    return () => {
      editor.off("selectionUpdate", updateSelectedVideo)
      editor.off("transaction", updateSelectedVideo)
    }
  }, [editor])

  useEffect(() => {
    if (!editor) return

    const updateSelectedImage = () => {
      let foundPos: number | null = null

      editor.state.doc.nodesBetween(editor.state.selection.from, editor.state.selection.to, (node, pos) => {
        if (node.type.name !== "image") return true
        foundPos = pos
        return false
      })

      const selection = editor.state.selection

      if (foundPos === null && selection.empty) {
        const { $from, from } = selection
        if ($from.nodeBefore?.type.name === "image") {
          foundPos = from - $from.nodeBefore.nodeSize
        } else if ($from.nodeAfter?.type.name === "image") {
          foundPos = from
        }
      }

      if (foundPos === null) {
        const { $from } = selection
        for (let depth = $from.depth; depth >= 0; depth -= 1) {
          const node = $from.node(depth)
          if (node.type.name !== "image") continue
          foundPos = depth > 0 ? $from.before(depth) : 0
          break
        }
      }

      setSelectedImagePos(foundPos)
    }

    updateSelectedImage()
    editor.on("selectionUpdate", updateSelectedImage)
    editor.on("transaction", updateSelectedImage)
    return () => {
      editor.off("selectionUpdate", updateSelectedImage)
      editor.off("transaction", updateSelectedImage)
    }
  }, [editor])

  useEffect(() => {
    if (!editor) return

    const updateSelectedAccordion = () => {
      let foundPos: number | null = null

      editor.state.doc.nodesBetween(editor.state.selection.from, editor.state.selection.to, (node, pos) => {
        if (node.type.name !== "accordionDetails") return true
        foundPos = pos
        return false
      })

      if (foundPos === null) {
        const { $from } = editor.state.selection
        for (let depth = $from.depth; depth >= 0; depth -= 1) {
          const node = $from.node(depth)
          if (node.type.name !== "accordionDetails") continue
          foundPos = depth > 0 ? $from.before(depth) : 0
          break
        }
      }

      setSelectedAccordionPos(foundPos)
    }

    updateSelectedAccordion()
    editor.on("selectionUpdate", updateSelectedAccordion)
    editor.on("transaction", updateSelectedAccordion)
    return () => {
      editor.off("selectionUpdate", updateSelectedAccordion)
      editor.off("transaction", updateSelectedAccordion)
    }
  }, [editor])

  useEffect(() => {
    if (!editor) return

    const updateSelectedCard = () => {
      let foundPos: number | null = null

      editor.state.doc.nodesBetween(editor.state.selection.from, editor.state.selection.to, (node, pos) => {
        if (node.type.name !== "cmsCard") return true
        foundPos = pos
        return false
      })

      if (foundPos === null) {
        const { $from } = editor.state.selection
        for (let depth = $from.depth; depth >= 0; depth -= 1) {
          const node = $from.node(depth)
          if (node.type.name !== "cmsCard") continue
          foundPos = depth > 0 ? $from.before(depth) : 0
          break
        }
      }

      setSelectedCardPos(foundPos)
    }

    updateSelectedCard()
    editor.on("selectionUpdate", updateSelectedCard)
    editor.on("transaction", updateSelectedCard)
    return () => {
      editor.off("selectionUpdate", updateSelectedCard)
      editor.off("transaction", updateSelectedCard)
    }
  }, [editor])

  useEffect(() => {
    if (!editor) return

    const updateSelectedSection = () => {
      let foundPos: number | null = null

      editor.state.doc.nodesBetween(editor.state.selection.from, editor.state.selection.to, (node, pos) => {
        if (node.type.name !== "cmsSection") return true
        foundPos = pos
        return false
      })

      if (foundPos === null) {
        const { $from } = editor.state.selection
        for (let depth = $from.depth; depth >= 0; depth -= 1) {
          const node = $from.node(depth)
          if (node.type.name !== "cmsSection") continue
          foundPos = depth > 0 ? $from.before(depth) : 0
          break
        }
      }

      setSelectedSectionPos(foundPos)
    }

    updateSelectedSection()
    editor.on("selectionUpdate", updateSelectedSection)
    editor.on("transaction", updateSelectedSection)
    return () => {
      editor.off("selectionUpdate", updateSelectedSection)
      editor.off("transaction", updateSelectedSection)
    }
  }, [editor])

  useEffect(() => {
    if (!editor) return

    const readCssVarFromStyle = (styleText: string | null | undefined, variableName: string, fallback: string) => {
      if (!styleText) return fallback
      const match = styleText.match(new RegExp(`${variableName}\\s*:\\s*([^;]+)`, "i"))
      return match?.[1]?.trim() || fallback
    }

    const syncEditorTableBorders = () => {
      editor.state.doc.descendants((node, pos) => {
        if (node.type.name !== "table") return true

        const nodeDom = editor.view.nodeDOM(pos)
        const tableEl =
          nodeDom instanceof HTMLTableElement
            ? nodeDom
            : nodeDom instanceof HTMLElement
              ? nodeDom.querySelector<HTMLTableElement>("table")
              : null

        if (!tableEl) return true

        const borderStyle = typeof node.attrs.borderStyle === "string" ? node.attrs.borderStyle : "solid"
        const styleText = typeof node.attrs.style === "string" ? node.attrs.style : null

        let resolvedStyle = "solid"
        let resolvedWidth = "1px"
        let resolvedColor = "var(--border)"

        if (borderStyle === "none") {
          resolvedStyle = "dotted"
        } else if (borderStyle === "dashed") {
          resolvedStyle = "dashed"
        } else if (borderStyle === "double") {
          resolvedStyle = "double"
          resolvedWidth = "3px"
        } else if (borderStyle === "custom") {
          resolvedStyle = readCssVarFromStyle(styleText, "--cms-table-border-style", "solid")
          resolvedWidth = readCssVarFromStyle(styleText, "--cms-table-border-width", "1px")
          resolvedColor = readCssVarFromStyle(styleText, "--cms-table-border-color", "var(--border)")
        }

        tableEl.setAttribute("data-cms-editor-border", borderStyle)
        tableEl.setAttribute("data-border-style", borderStyle)
        tableEl.style.setProperty("--cms-editor-table-border-style", resolvedStyle)
        tableEl.style.setProperty("--cms-editor-table-border-width", resolvedWidth)
        tableEl.style.setProperty("--cms-editor-table-border-color", resolvedColor)
        tableEl.style.setProperty("--cms-table-border-style", resolvedStyle)
        tableEl.style.setProperty("--cms-table-border-width", resolvedWidth)
        tableEl.style.setProperty("--cms-table-border-color", resolvedColor)

        return true
      })
    }

    syncEditorTableBorders()
    editor.on("transaction", syncEditorTableBorders)
    editor.on("selectionUpdate", syncEditorTableBorders)

    return () => {
      editor.off("transaction", syncEditorTableBorders)
      editor.off("selectionUpdate", syncEditorTableBorders)
    }
  }, [editor, mode])

  if (!editor) {
    return null
  }

  const fallbackIcons: Array<{ name: string; className: string }> = [
    { name: "arrow-right", className: "fa-solid fa-arrow-right" },
    { name: "arrow-left", className: "fa-solid fa-arrow-left" },
    { name: "check", className: "fa-solid fa-check" },
    { name: "circle-check", className: "fa-solid fa-circle-check" },
    { name: "bolt", className: "fa-solid fa-bolt" },
    { name: "gear", className: "fa-solid fa-gear" },
    { name: "book", className: "fa-solid fa-book" },
    { name: "graduation-cap", className: "fa-solid fa-graduation-cap" },
    { name: "users", className: "fa-solid fa-users" },
    { name: "phone", className: "fa-solid fa-phone" },
    { name: "envelope", className: "fa-solid fa-envelope" },
    { name: "download", className: "fa-solid fa-download" },
    { name: "upload", className: "fa-solid fa-upload" },
    { name: "play", className: "fa-solid fa-play" },
    { name: "circle-info", className: "fa-solid fa-circle-info" },
    { name: "star", className: "fa-solid fa-star" },
    { name: "calendar", className: "fa-solid fa-calendar" },
    { name: "clock", className: "fa-solid fa-clock" },
    { name: "wrench", className: "fa-solid fa-wrench" },
  ]
  const iconPool = faIcons.length > 0 ? faIcons : fallbackIcons
  const normalizedIconSearch = iconSearch.trim().toLowerCase()
  const filteredIcons = normalizedIconSearch
    ? iconPool.filter((icon) => icon.name.includes(normalizedIconSearch))
    : iconPool
  const visibleIcons = normalizedIconSearch ? filteredIcons.slice(0, 320) : filteredIcons.slice(0, 96)
  const hasHiddenIcons = filteredIcons.length > visibleIcons.length
  const isLinkActive = editor.isActive("link")
  const activeLinkAttrs = (isLinkActive ? (editor.getAttributes("link") as Record<string, unknown>) : {}) as Record<string, unknown>
  const activeLinkIsButton =
    activeLinkAttrs["data-cms-button"] === true ||
    (typeof activeLinkAttrs["data-cms-button"] === "string" && activeLinkAttrs["data-cms-button"].toLowerCase() === "true")
  const sectionPresetOption = getSectionPreset(sectionPreset)

  const getSelectedVideoAlign = (): "left" | "center" | "right" => {
    if (selectedVideoPos === null) return "left"
    const node = editor.state.doc.nodeAt(selectedVideoPos)
    if (!node || node.type.name !== "cmsVideo") return "left"
    const value = typeof node.attrs.align === "string" ? node.attrs.align.toLowerCase() : "left"
    if (value === "center" || value === "right") return value
    return "left"
  }

  const isAlignmentActive = (alignment: "left" | "center" | "right") => {
    if (selectedImagePos !== null) {
      const node = editor.state.doc.nodeAt(selectedImagePos)
      return node?.type.name === "image" && node.attrs.textAlign === alignment
    }
    if (selectedVideoPos !== null) {
      return getSelectedVideoAlign() === alignment
    }
    return editor.isActive({ textAlign: alignment })
  }

  const applyAlignment = (alignment: "left" | "center" | "right") => {
    if (selectedImagePos !== null) {
      const updated = editor
        .chain()
        .focus()
        .command(({ tr, dispatch }) => {
          const node = tr.doc.nodeAt(selectedImagePos)
          if (!node || node.type.name !== "image") return false
          tr.setNodeMarkup(selectedImagePos, undefined, { ...node.attrs, textAlign: alignment })
          if (dispatch) dispatch(tr)
          return true
        })
        .run()
      if (updated) {
        editor.commands.setNodeSelection(selectedImagePos)
      }
      return
    }
    if (selectedVideoPos === null) {
      editor.chain().focus().setTextAlign(alignment).run()
      return
    }
    const updated = editor
      .chain()
      .focus()
      .command(({ tr, dispatch }) => {
        const node = tr.doc.nodeAt(selectedVideoPos)
        if (!node || node.type.name !== "cmsVideo") return false
        tr.setNodeMarkup(selectedVideoPos, undefined, { ...node.attrs, align: alignment })
        if (dispatch) dispatch(tr)
        return true
      })
      .run()
    if (updated) {
      editor.commands.setNodeSelection(selectedVideoPos)
      setVideoAlign(alignment)
    }
  }

  const setLink = () => {
    const url = window.prompt("Enter URL")
    if (url) {
      editor.chain().focus().setLink({ href: url }).run()
    }
  }

  const editSelectedLinkUrl = () => {
    if (!editor.isActive("link")) return
    const currentAttrs = editor.getAttributes("link") as Record<string, unknown>
    const currentHref = typeof currentAttrs.href === "string" ? currentAttrs.href : ""
    const entered = window.prompt("Edit URL", currentHref)
    if (entered === null) return
    const nextHref = entered.trim()
    if (!nextHref) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run()
      return
    }
    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({
        ...currentAttrs,
        href: nextHref,
      })
      .run()
  }

  const applyTextColor = (color: string) => {
    setSelectedTextColor(color)
    if (!color) {
      editor.chain().focus().unsetColor().run()
      return
    }
    editor.chain().focus().setColor(color).run()
  }

  const clearTextColor = () => {
    if (editor.state.selection.empty) return
    setSelectedTextColor("")
    editor.chain().focus().unsetColor().run()
  }

  const applyHighlightColor = (color: string) => {
    setSelectedHighlightColor(color)
    editor.chain().focus().setHighlight({ color }).run()
  }

  const clearHighlightColor = () => {
    if (editor.state.selection.empty) return
    editor.chain().focus().unsetHighlight().run()
  }

  const startInsertImageFlow = () => {
    setShowIconPicker(false)
    setPendingButtonVariant("primary")
    setPendingButtonLabel("")
    setPendingButtonHref("")
    setShowVideoForm(false)
    setShowCardForm(false)
    setShowSectionForm(false)
    setImageSource("")
    setImageAltText("")
    setImageTitleText("")
    setImageWidth("")
    setImageHeight("")
    setImageLinkUrl("")
    setImageUploadError(null)
    setImageFormMode("insert")
    setEditingImagePos(null)
    setShowImageForm(true)
  }

  const startEditImageFlow = () => {
    if (selectedImagePos === null) return
    const node = editor.state.doc.nodeAt(selectedImagePos)
    if (!node || node.type.name !== "image") return
    editor.commands.setNodeSelection(selectedImagePos)
    openImageFormForNode((node.attrs || {}) as Record<string, unknown>, selectedImagePos)
  }

  const closeImageForm = () => {
    setShowImageForm(false)
    setImageUploadError(null)
    setImageUploading(false)
    setImageFormMode("insert")
    setEditingImagePos(null)
    if (imageFileInputRef.current) {
      imageFileInputRef.current.value = ""
    }
  }

  const insertImageFromForm = () => {
    const src = imageSource.trim()
    if (!src) {
      setImageUploadError("Image URL or uploaded image is required.")
      return
    }
    const widthRaw = imageWidth.trim()
    const heightRaw = imageHeight.trim()
    if (widthRaw && !/^\d+$/.test(widthRaw)) {
      setImageUploadError("Width must be a positive number in pixels.")
      return
    }
    if (heightRaw && !/^\d+$/.test(heightRaw)) {
      setImageUploadError("Height must be a positive number in pixels.")
      return
    }

    const activeTextAlign = editor.getAttributes("paragraph").textAlign || editor.getAttributes("heading").textAlign
    const currentTextAlign = activeTextAlign === "center" || activeTextAlign === "right" || activeTextAlign === "left" ? activeTextAlign : null
    const imageAttrs: {
      src: string
      alt?: string
      title?: string
      width?: number
      height?: number
      linkHref?: string
      textAlign?: "left" | "center" | "right"
    } = { src }
    const alt = imageAltText.trim()
    const title = imageTitleText.trim()
    const linkHref = imageLinkUrl.trim()
    if (alt) imageAttrs.alt = alt
    if (title) imageAttrs.title = title
    if (widthRaw) imageAttrs.width = Number(widthRaw)
    if (heightRaw) imageAttrs.height = Number(heightRaw)
    if (linkHref) imageAttrs.linkHref = linkHref
    if (currentTextAlign) imageAttrs.textAlign = currentTextAlign

    if (imageFormMode === "edit" && editingImagePos !== null) {
      const updated = editor
        .chain()
        .focus()
        .command(({ tr, dispatch }) => {
          const node = tr.doc.nodeAt(editingImagePos)
          if (!node || node.type.name !== "image") return false
          tr.setNodeMarkup(editingImagePos, undefined, {
            ...node.attrs,
            src: imageAttrs.src,
            alt: imageAttrs.alt || null,
            title: imageAttrs.title || null,
            width: imageAttrs.width || null,
            height: imageAttrs.height || null,
            linkHref: imageAttrs.linkHref || null,
          })
          if (dispatch) dispatch(tr)
          return true
        })
        .run()
      if (!updated) {
        setImageUploadError("Could not update the selected image. Please select the image again.")
        return
      }
      editor.commands.setNodeSelection(editingImagePos)
    } else {
      editor.chain().focus().setImage(imageAttrs).run()
    }
    closeImageForm()
  }

  const uploadImage = async (file: File | null) => {
    if (!file) return
    if (!file.type.startsWith("image/")) {
      setImageUploadError("Please choose a valid image file.")
      return
    }
    setImageUploading(true)
    setImageUploadError(null)
    try {
      const payload = new FormData()
      payload.append("file", file)
      payload.append("folder", "images")
      const response = await fetch("/api/admin/uploads", { method: "POST", body: payload })
      const result = await response.json().catch(() => ({}))
      if (!response.ok || (!result?.key && !result?.url)) {
        throw new Error(result?.error || "Image upload failed")
      }
      const src =
        typeof result?.key === "string" && result.key.trim().length > 0
          ? result.key.trim()
          : typeof result?.url === "string"
            ? result.url.trim()
            : ""
      if (!src) {
        throw new Error("Image upload failed")
      }
      setImageSource(src)
    } catch (error) {
      setImageUploadError(error instanceof Error ? error.message : "Image upload failed")
    } finally {
      setImageUploading(false)
      if (imageFileInputRef.current) {
        imageFileInputRef.current.value = ""
      }
    }
  }

  const normalizeSize = (value: string) => {
    const raw = value.trim()
    if (!raw) return ""
    if (/^\d+(\.\d+)?$/.test(raw)) return `${raw}px`
    return raw
  }

  const parseVideoTracks = () => {
    const raw = videoTracksJson.trim()
    if (!raw) return []
    try {
      const parsed = JSON.parse(raw)
      if (!Array.isArray(parsed)) {
        throw new Error("Tracks must be a JSON array.")
      }
      const tracks = parsed
        .filter((item) => item && typeof item === "object")
        .map((item) => {
          const record = item as Record<string, unknown>
          return {
            src: typeof record.src === "string" ? record.src.trim() : "",
            kind: typeof record.kind === "string" ? record.kind.trim() : "subtitles",
            label: typeof record.label === "string" ? record.label.trim() : "",
            language:
              typeof record.language === "string"
                ? record.language.trim()
                : typeof record.lang === "string"
                  ? record.lang.trim()
                  : "",
            default: Boolean(record.default),
            type: typeof record.type === "string" ? record.type.trim() : "vtt",
          }
        })
        .filter((track) => track.src.length > 0)

      setVideoTracksError(null)
      return tracks
    } catch (error) {
      setVideoTracksError(error instanceof Error ? error.message : "Invalid tracks JSON.")
      return null
    }
  }

  const resetVideoForm = () => {
    setVideoUrl("")
    setVideoPoster("")
    setVideoTitle("")
    setVideoCaption("")
    setVideoAlign("left")
    setVideoAspectRatio("16/9")
    setVideoWidth("")
    setVideoHeight("")
    setVideoPreload("metadata")
    setVideoViewType("video")
    setVideoStreamType("on-demand")
    setVideoLogLevel("warn")
    setVideoCrossOrigin(true)
    setVideoThumbnails("")
    setVideoTracksJson("[]")
    setVideoControls(true)
    setVideoAutoplay(false)
    setVideoMuted(false)
    setVideoLoop(false)
    setVideoPlaysInline(true)
    setVideoUploadError(null)
    setPosterUploadError(null)
    setVideoTracksError(null)
  }

  const uploadVideo = async (file: File | null) => {
    if (!file) return
    if (!file.type.startsWith("video/")) {
      setVideoUploadError("Please choose a valid video file.")
      return
    }
    setVideoUploading(true)
    setVideoUploadError(null)
    try {
      const payload = new FormData()
      payload.append("file", file)
      payload.append("folder", "videos")
      const response = await fetch("/api/admin/uploads", { method: "POST", body: payload })
      const result = await response.json().catch(() => ({}))
      if (!response.ok || (!result?.key && !result?.url)) {
        throw new Error(result?.error || "Video upload failed")
      }
      setVideoUrl(result.key || result.url)
    } catch (error) {
      setVideoUploadError(error instanceof Error ? error.message : "Video upload failed")
    } finally {
      setVideoUploading(false)
      if (videoFileInputRef.current) {
        videoFileInputRef.current.value = ""
      }
    }
  }

  const uploadPoster = async (file: File | null) => {
    if (!file) return
    if (!file.type.startsWith("image/")) {
      setPosterUploadError("Please choose a valid image file.")
      return
    }
    setPosterUploading(true)
    setPosterUploadError(null)
    try {
      const payload = new FormData()
      payload.append("file", file)
      payload.append("folder", "videos")
      const response = await fetch("/api/admin/uploads", { method: "POST", body: payload })
      const result = await response.json().catch(() => ({}))
      if (!response.ok || (!result?.key && !result?.url)) {
        throw new Error(result?.error || "Poster upload failed")
      }
      setVideoPoster(result.key || result.url)
    } catch (error) {
      setPosterUploadError(error instanceof Error ? error.message : "Poster upload failed")
    } finally {
      setPosterUploading(false)
      if (posterFileInputRef.current) {
        posterFileInputRef.current.value = ""
      }
    }
  }

  const startInsertVideoFlow = () => {
    setShowIconPicker(false)
    setShowImageForm(false)
    setShowCardForm(false)
    setShowSectionForm(false)
    setPendingButtonVariant("primary")
    resetVideoForm()
    setVideoUploading(false)
    setPosterUploading(false)
    setVideoFormMode("insert")
    setEditingVideoPos(null)
    setShowVideoForm(true)
  }

  const applyVidstackDemoPreset = () => {
    setVideoUrl("https://files.vidstack.io/sprite-fight/720p.mp4")
    setVideoPoster("https://files.vidstack.io/sprite-fight/poster.webp")
    setVideoTitle("Sprite Fight")
    setVideoCaption("")
    setVideoAlign("left")
    setVideoAspectRatio("16/9")
    setVideoWidth("")
    setVideoHeight("")
    setVideoPreload("metadata")
    setVideoViewType("video")
    setVideoStreamType("on-demand")
    setVideoLogLevel("warn")
    setVideoCrossOrigin(true)
    setVideoThumbnails("https://files.vidstack.io/sprite-fight/thumbnails.vtt")
    setVideoControls(true)
    setVideoAutoplay(false)
    setVideoMuted(false)
    setVideoLoop(false)
    setVideoPlaysInline(true)
    setVideoTracksJson(
      JSON.stringify(
        [
          {
            src: "https://files.vidstack.io/sprite-fight/subs/english.vtt",
            label: "English",
            language: "en-US",
            kind: "subtitles",
            type: "vtt",
            default: true,
          },
          {
            src: "https://files.vidstack.io/sprite-fight/subs/spanish.vtt",
            label: "Spanish",
            language: "es-ES",
            kind: "subtitles",
            type: "vtt",
          },
          {
            src: "https://files.vidstack.io/sprite-fight/chapters.vtt",
            language: "en-US",
            kind: "chapters",
            type: "vtt",
            default: true,
          },
        ],
        null,
        2,
      ),
    )
    setVideoUploadError(null)
    setPosterUploadError(null)
    setVideoTracksError(null)
  }

  const startEditVideoFlow = () => {
    if (selectedVideoPos === null) return
    const node = editor.state.doc.nodeAt(selectedVideoPos)
    if (!node || node.type.name !== "cmsVideo") return

    const attrs = node.attrs as Record<string, unknown>
    setVideoUrl(typeof attrs.src === "string" ? attrs.src : "")
    setVideoPoster(typeof attrs.poster === "string" ? attrs.poster : "")
    setVideoTitle(typeof attrs.title === "string" ? attrs.title : "Video")
    setVideoCaption(typeof attrs.caption === "string" ? attrs.caption : "")
    const alignValue = typeof attrs.align === "string" ? attrs.align.toLowerCase() : "left"
    setVideoAlign(alignValue === "center" || alignValue === "right" ? alignValue : "left")
    setVideoAspectRatio(typeof attrs.aspectRatio === "string" ? attrs.aspectRatio : "16/9")
    setVideoWidth(typeof attrs.width === "string" ? attrs.width : "")
    setVideoHeight(typeof attrs.height === "string" ? attrs.height : "")
    setVideoPreload((typeof attrs.preload === "string" ? attrs.preload : "metadata") as "none" | "metadata" | "auto")
    setVideoViewType((typeof attrs.viewType === "string" ? attrs.viewType : "video") as "video" | "audio")
    setVideoStreamType(
      (typeof attrs.streamType === "string" ? attrs.streamType : "on-demand") as
        | "unknown"
        | "on-demand"
        | "live"
        | "live:dvr"
        | "ll-live"
        | "ll-live:dvr",
    )
    setVideoLogLevel((typeof attrs.logLevel === "string" ? attrs.logLevel : "warn") as "silent" | "error" | "warn" | "info" | "debug")
    setVideoCrossOrigin(typeof attrs.crossOrigin === "boolean" ? attrs.crossOrigin : true)
    setVideoThumbnails(typeof attrs.thumbnails === "string" ? attrs.thumbnails : "")
    if (typeof attrs.tracks === "string" && attrs.tracks.trim()) {
      try {
        setVideoTracksJson(JSON.stringify(JSON.parse(attrs.tracks), null, 2))
      } catch {
        setVideoTracksJson(attrs.tracks)
      }
    } else {
      setVideoTracksJson("[]")
    }
    setVideoControls(typeof attrs.controls === "boolean" ? attrs.controls : true)
    setVideoAutoplay(typeof attrs.autoplay === "boolean" ? attrs.autoplay : false)
    setVideoMuted(typeof attrs.muted === "boolean" ? attrs.muted : false)
    setVideoLoop(typeof attrs.loop === "boolean" ? attrs.loop : false)
    setVideoPlaysInline(typeof attrs.playsInline === "boolean" ? attrs.playsInline : true)
    setVideoUploadError(null)
    setPosterUploadError(null)
    setVideoTracksError(null)
    setVideoFormMode("edit")
    setEditingVideoPos(selectedVideoPos)
    setShowImageForm(false)
    setShowCardForm(false)
    setShowSectionForm(false)
    setShowVideoForm(true)
  }

  const insertVideo = () => {
    const source = videoUrl.trim()
    if (!source) {
      setVideoUploadError("Video URL or uploaded video is required.")
      return
    }
    const tracks = parseVideoTracks()
    if (tracks === null) return

    const nextAttrs = {
      class: "cms-video",
      src: source,
      poster: videoPoster.trim(),
      title: videoTitle.trim() || "Video",
      caption: videoCaption.trim(),
      align: videoAlign,
      controls: videoControls,
      autoplay: videoAutoplay,
      muted: videoMuted,
      loop: videoLoop,
      playsInline: videoPlaysInline,
      preload: videoPreload,
      aspectRatio: videoAspectRatio.trim() || "16/9",
      width: normalizeSize(videoWidth),
      height: normalizeSize(videoHeight),
      viewType: videoViewType,
      streamType: videoStreamType,
      logLevel: videoLogLevel,
      menuGroup: "top",
      crossOrigin: videoCrossOrigin,
      thumbnails: videoThumbnails.trim(),
      tracks: JSON.stringify(tracks),
    }

    if (videoFormMode === "edit" && editingVideoPos !== null) {
      const updated = editor
        .chain()
        .focus()
        .command(({ tr, dispatch }) => {
          const node = tr.doc.nodeAt(editingVideoPos)
          if (!node || node.type.name !== "cmsVideo") return false
          tr.setNodeMarkup(editingVideoPos, undefined, { ...node.attrs, ...nextAttrs })
          if (dispatch) dispatch(tr)
          return true
        })
        .run()
      if (!updated) {
        setVideoUploadError("Could not update the selected video. Please select the video block again.")
        return
      }
      editor.commands.setNodeSelection(editingVideoPos)
    } else {
      const inserted = editor
        .chain()
        .focus()
        .insertContent([
          {
            type: "cmsVideo",
            attrs: nextAttrs,
          },
          { type: "paragraph" },
        ])
        .run()
      if (!inserted) {
        setVideoUploadError("Could not insert video at the current cursor position.")
        return
      }
    }

    setShowVideoForm(false)
    setVideoFormMode("insert")
    setEditingVideoPos(null)
    resetVideoForm()
  }

  const switchModeAny = (next: "visual" | "source" | "preview") => {
    if (next === mode) return
    if (next === "source") {
      const raw =
        mode === "preview"
          ? sourceHtml || content || sourceSeed || editor.getHTML() || ""
          : sourceHtml || content || sourceSeed || editor.getHTML() || ""
      setSourceSeed(raw)
      setSourceHtml(raw)
      setIgnoreSourceInitChange(true)
      setSourceDirty(false)
    } else if (mode === "source") {
      const resolvedHtml = sourceDirty
        ? sourceHtml
        : sourceHtml.trim().length > 0
          ? sourceHtml
          : sourceSeed.trim().length > 0
            ? sourceSeed
            : content || editor.getHTML()
      if (sourceDirty) {
        onChange(resolvedHtml || "")
      }
      if (next === "visual") {
        editor.commands.setContent(resolvedHtml || "", { emitUpdate: false })
      }
      setIgnoreSourceInitChange(false)
      setSourceSeed(resolvedHtml || "")
      setSourceDirty(false)
    }
    setMode(next)
  }

  const resetPendingButtonForm = () => {
    setPendingButtonVariant("primary")
    setPendingButtonSize("md")
    setPendingButtonLabel("Get Started")
    setPendingButtonHref("/contact")
    setPendingButtonTextColor("#ffffff")
    setPendingButtonBgColor("var(--primary)")
    setPendingButtonHoverColor("var(--primary)")
    setPendingButtonHoverTextColor("#ffffff")
    setPendingButtonBorderColor("var(--primary)")
    setPendingButtonHoverBorderColor("var(--primary)")
    setPendingButtonBorderWidth("1")
    setPendingButtonRadius("8")
    setPendingButtonLeadingVisualHtml("")
    setSelectedIconClass("")
    setIconSearch("")
    setButtonFormMode("insert")
    setEditingButtonRange(null)
  }

  const resolveCssColorValue = (value: string) => {
    const raw = value.trim()
    if (!raw) return ""
    if (typeof window === "undefined" || typeof document === "undefined") return raw
    const probe = document.createElement("span")
    probe.style.display = "none"
    probe.style.color = raw
    document.body.appendChild(probe)
    const computed = window.getComputedStyle(probe).color || raw
    document.body.removeChild(probe)
    const toHex = (channel: number) => Math.max(0, Math.min(255, Math.round(channel))).toString(16).padStart(2, "0")
    const canvas = document.createElement("canvas")
    canvas.width = 1
    canvas.height = 1
    const ctx = canvas.getContext("2d")
    if (ctx) {
      ctx.clearRect(0, 0, 1, 1)
      ctx.fillStyle = "rgba(0,0,0,0)"
      ctx.fillRect(0, 0, 1, 1)
      ctx.fillStyle = computed
      ctx.fillRect(0, 0, 1, 1)
      const [r, g, b, aByte] = ctx.getImageData(0, 0, 1, 1).data
      const alpha = aByte / 255
      if (alpha === 0) {
        return "transparent"
      }
      if (alpha > 0 && alpha < 1) {
        return `rgba(${r}, ${g}, ${b}, ${alpha.toFixed(3).replace(/0+$/, "").replace(/\.$/, "")})`
      }
      return `#${toHex(r)}${toHex(g)}${toHex(b)}`
    }
    return computed
  }

  const toPickerHex = (value: string) => {
    const resolved = resolveCssColorValue(value)
    if (resolved === "transparent") return "#ffffff"
    const rgbMatch = resolved.match(/^rgba?\(([^)]+)\)$/i)
    if (rgbMatch) {
      const parts = rgbMatch[1].split(",").map((part) => part.trim())
      if (parts.length >= 3) {
        const toHex = (channel: number) => Math.max(0, Math.min(255, Math.round(channel))).toString(16).padStart(2, "0")
        const r = Number.parseFloat(parts[0])
        const g = Number.parseFloat(parts[1])
        const b = Number.parseFloat(parts[2])
        if (Number.isFinite(r) && Number.isFinite(g) && Number.isFinite(b)) {
          return `#${toHex(r)}${toHex(g)}${toHex(b)}`
        }
      }
    }
    const hexMatch = resolved.match(/^#([0-9a-f]{6})$/i)
    if (hexMatch) return `#${hexMatch[1]}`
    return "#000000"
  }

  const applyPendingButtonVariantDefaults = (variant: ButtonVariant) => {
    setPendingButtonVariant(variant)
    const defaults =
      variant === "primary"
        ? { text: "#ffffff", bg: "var(--primary)", border: "var(--primary)" }
      : variant === "outline"
        ? { text: "var(--foreground)", bg: "transparent", border: "var(--border)" }
          : variant === "secondary"
            ? { text: "var(--secondary-foreground)", bg: "var(--secondary)", border: "var(--secondary)" }
            : variant === "ghost"
              ? { text: "var(--foreground)", bg: "transparent", border: "transparent" }
              : { text: "var(--destructive-foreground)", bg: "var(--destructive)", border: "var(--destructive)" }
    setPendingButtonTextColor(resolveCssColorValue(defaults.text))
    setPendingButtonBgColor(resolveCssColorValue(defaults.bg))
    setPendingButtonHoverColor(resolveCssColorValue(defaults.bg))
    setPendingButtonHoverTextColor(resolveCssColorValue(defaults.text))
    setPendingButtonBorderColor(resolveCssColorValue(defaults.border))
    setPendingButtonHoverBorderColor(resolveCssColorValue(defaults.border))
  }

  const getButtonVariantFallbacks = (variant: ButtonVariant) =>
    variant === "primary"
      ? { text: "#ffffff", bg: "var(--primary)", border: "var(--primary)" }
      : variant === "outline"
        ? { text: "var(--foreground)", bg: "transparent", border: "var(--border)" }
        : variant === "secondary"
          ? { text: "var(--secondary-foreground)", bg: "var(--secondary)", border: "var(--secondary)" }
          : variant === "ghost"
            ? { text: "var(--foreground)", bg: "transparent", border: "transparent" }
            : { text: "var(--destructive-foreground)", bg: "var(--destructive)", border: "var(--destructive)" }

  const pickFirstNonEmpty = (...values: Array<string | undefined>) => {
    for (const value of values) {
      if (typeof value === "string" && value.trim().length > 0) return value.trim()
    }
    return ""
  }

  const collectAdjacentButtonSegments = (anchor: HTMLAnchorElement | null) => {
    if (!anchor) return [] as HTMLAnchorElement[]
    const href = (anchor.getAttribute("href") || "").trim()
    const parent = anchor.parentElement
    if (!parent) return [anchor]

    const isSameSegment = (element: Element | null): element is HTMLAnchorElement => {
      if (!(element instanceof HTMLAnchorElement)) return false
      if (element.getAttribute("data-cms-button") !== "true") return false
      if ((element.getAttribute("href") || "").trim() !== href) return false
      return true
    }

    const segments: HTMLAnchorElement[] = [anchor]
    let prev = anchor.previousElementSibling
    while (isSameSegment(prev)) {
      segments.unshift(prev)
      prev = prev.previousElementSibling
    }

    let next = anchor.nextElementSibling
    while (isSameSegment(next)) {
      segments.push(next)
      next = next.nextElementSibling
    }

    return segments
  }

  const startInsertButtonFlow = () => {
    setShowVideoForm(false)
    setShowImageForm(false)
    setShowCardForm(false)
    setShowSectionForm(false)
    resetPendingButtonForm()
    setShowIconPicker(true)
  }

  const editSelectedButton = () => {
    if (!editor.isActive("link")) return
    editor.chain().focus().extendMarkRange("link").run()

    const selectionFrom = editor.state.selection.from
    const selectionTo = editor.state.selection.to
    if (selectionTo <= selectionFrom) return

    const currentAttrs = editor.getAttributes("link") as Record<string, unknown>
    const isButton =
      currentAttrs["data-cms-button"] === true ||
      (typeof currentAttrs["data-cms-button"] === "string" && currentAttrs["data-cms-button"].toLowerCase() === "true")
    if (!isButton) return
    setEditingButtonRange({ from: selectionFrom, to: selectionTo })
    setShowVideoForm(false)
    setShowImageForm(false)
    setShowCardForm(false)
    setShowSectionForm(false)

    const domAt = editor.view.domAtPos(selectionFrom)
    const selectionElement = domAt.node instanceof HTMLElement ? domAt.node : domAt.node.parentElement
    const buttonElement = selectionElement?.closest?.('a[data-cms-button="true"]') as HTMLAnchorElement | null

    const buttonSegments = collectAdjacentButtonSegments(buttonElement)
    const className = pickFirstNonEmpty(typeof currentAttrs.class === "string" ? currentAttrs.class : "", buttonElement?.getAttribute("class") || "")
    const styleText = pickFirstNonEmpty(typeof currentAttrs.style === "string" ? currentAttrs.style : "", buttonElement?.getAttribute("style") || "")
    const styleVars = parseStyleVars(styleText)
    const segmentChildren = buttonSegments.flatMap((segment) => Array.from(segment.children))
    const directChildren = segmentChildren.length > 0 ? segmentChildren : buttonElement ? Array.from(buttonElement.children) : []
    const labelByTailSpan = [...directChildren]
      .reverse()
      .find(
        (child) =>
          child.tagName.toLowerCase() === "span" &&
          !child.hasAttribute("data-cms-fa") &&
          (child.textContent || "").trim().length > 0,
      )
    const labelChild =
      directChildren.find((child) => child.getAttribute("data-cms-button-label") === "true") || labelByTailSpan || null
    const leadingVisualChildren = directChildren.filter((child) => child !== labelChild)

    const detectedVariant: ButtonVariant = className.includes("bg-destructive")
      ? "danger"
      : className.includes("bg-secondary")
        ? "secondary"
        : className.includes("bg-transparent")
          ? "ghost"
          : className.includes("border") && className.includes("bg-background")
            ? "outline"
            : "primary"

    const detectedSize: ButtonSize = className.includes("px-3 py-1.5") ? "sm" : className.includes("px-6 py-3") ? "lg" : "md"

    const selectedText = editor.state.doc.textBetween(selectionFrom, selectionTo, " ").trim()
    const combinedDomText = buttonSegments.map((segment) => segment.textContent || "").join(" ").trim()
    const labelFromDom = labelChild?.textContent?.trim() || combinedDomText || buttonElement?.textContent?.trim() || ""
    const iconNode =
      buttonSegments
        .map((segment) => segment.querySelector<HTMLElement>("[data-cms-fa], i[class*='fa-'], span[class*='fa-']"))
        .find((node) => node instanceof HTMLElement) || null
    const rawIconClass = pickFirstNonEmpty(iconNode?.getAttribute("data-cms-fa") || "", iconNode?.getAttribute("class") || "")
    const iconTokens = new Set(rawIconClass.toLowerCase().split(/\s+/).filter(Boolean))
    const matchedIcon =
      iconPool.find((icon) => icon.className.toLowerCase().split(/\s+/).every((token) => iconTokens.has(token)))?.className || ""
    const preservedLeadingVisualHtml = !matchedIcon ? leadingVisualChildren.map((child) => child.outerHTML.trim()).join("") : ""

    setPendingButtonLabel(selectedText || labelFromDom || "Button")
    setPendingButtonHref(
      pickFirstNonEmpty(
        typeof currentAttrs.href === "string" ? currentAttrs.href : "",
        buttonElement?.getAttribute("href") || "",
        "/",
      ),
    )
    setPendingButtonVariant(detectedVariant)
    setPendingButtonSize(detectedSize)
    const stripComputedButtonExpression = (value: string | undefined) => {
      if (typeof value !== "string") return ""
      const trimmed = value.trim()
      if (!trimmed) return ""
      if (trimmed.includes("--cms-button-")) return ""
      return trimmed
    }

    const fallbackDefaults = getButtonVariantFallbacks(detectedVariant)
    const baseTextColor = pickFirstNonEmpty(styleVars["--cms-button-text"], stripComputedButtonExpression(styleVars.color), fallbackDefaults.text)
    const baseBgColor = pickFirstNonEmpty(
      styleVars["--cms-button-bg"],
      stripComputedButtonExpression(styleVars["background-color"]),
      fallbackDefaults.bg,
    )
    const baseBorderColor = pickFirstNonEmpty(
      styleVars["--cms-button-border"],
      stripComputedButtonExpression(styleVars["border-color"]),
      fallbackDefaults.border,
    )
    const hoverBgColor = pickFirstNonEmpty(styleVars["--cms-button-hover-bg"], baseBgColor)
    const hoverTextColor = pickFirstNonEmpty(styleVars["--cms-button-hover-text"], baseTextColor)
    const hoverBorderColor = pickFirstNonEmpty(styleVars["--cms-button-hover-border"], hoverBgColor, baseBorderColor)

    setPendingButtonTextColor(resolveCssColorValue(baseTextColor))
    setPendingButtonBgColor(resolveCssColorValue(baseBgColor))
    setPendingButtonHoverColor(resolveCssColorValue(hoverBgColor))
    setPendingButtonHoverTextColor(resolveCssColorValue(hoverTextColor))
    setPendingButtonBorderColor(resolveCssColorValue(baseBorderColor))
    setPendingButtonHoverBorderColor(resolveCssColorValue(hoverBorderColor))
    setPendingButtonBorderWidth((styleVars["border-width"] || "1px").replace("px", "").trim())
    setPendingButtonRadius((styleVars["border-radius"] || "8px").replace("px", "").trim())
    setPendingButtonLeadingVisualHtml(preservedLeadingVisualHtml)
    setSelectedIconClass(matchedIcon)
    setIconSearch("")
    setButtonFormMode("edit")
    setShowIconPicker(true)
  }

  const insertButtonWithIcon = () => {
    const buttonLabel = pendingButtonLabel.trim() || "Button"
    const classes = getButtonClass(pendingButtonVariant, pendingButtonSize)
    const iconMeta = iconPool.find((icon) => icon.className === selectedIconClass)
    const preservedLeadingVisual = buttonFormMode === "edit" ? pendingButtonLeadingVisualHtml.trim() : ""
    const iconHtml = iconMeta
      ? `<span data-cms-fa="${iconMeta.className}" class="${iconMeta.className}" aria-hidden="true" style="color:inherit"></span>`
      : preservedLeadingVisual
    const styleParts: string[] = []
    if (pendingButtonTextColor.trim()) styleParts.push(`--cms-button-text:${pendingButtonTextColor.trim()}`)
    if (pendingButtonBgColor.trim()) styleParts.push(`--cms-button-bg:${pendingButtonBgColor.trim()}`)
    if (pendingButtonHoverColor.trim()) styleParts.push(`--cms-button-hover-bg:${pendingButtonHoverColor.trim()}`)
    if (pendingButtonHoverTextColor.trim()) styleParts.push(`--cms-button-hover-text:${pendingButtonHoverTextColor.trim()}`)
    if (pendingButtonBorderColor.trim()) styleParts.push(`--cms-button-border:${pendingButtonBorderColor.trim()}`)
    if (pendingButtonHoverBorderColor.trim()) styleParts.push(`--cms-button-hover-border:${pendingButtonHoverBorderColor.trim()}`)
    styleParts.push(`color:var(--cms-button-text-current, var(--cms-button-text, inherit))`)
    styleParts.push(`background-color:var(--cms-button-bg-current, var(--cms-button-bg, transparent))`)
    styleParts.push(`border-color:var(--cms-button-border-current, var(--cms-button-border, currentColor))`)
    const borderWidth = Number.parseInt(pendingButtonBorderWidth, 10)
    if (Number.isFinite(borderWidth) && borderWidth >= 0) styleParts.push(`border-width:${borderWidth}px`)
    const radius = Number.parseInt(pendingButtonRadius, 10)
    if (Number.isFinite(radius) && radius >= 0) styleParts.push(`border-radius:${radius}px`)
    const styleAttr = styleParts.length > 0 ? ` style="${styleParts.join(";")};"` : ""
    const buttonHtml = `<a href="${pendingButtonHref || "/"}" class="${classes}" data-cms-button="true"${styleAttr}>${iconHtml}<span data-cms-button-label="true">${buttonLabel}</span></a>`
    if (buttonFormMode === "edit" && editingButtonRange) {
      editor.chain().focus().insertContentAt(editingButtonRange, buttonHtml).run()
    } else if (buttonFormMode === "edit" && editor.isActive("link")) {
      editor.chain().focus().extendMarkRange("link").deleteSelection().insertContent(buttonHtml).run()
    } else {
      editor.chain().focus().insertContent(`<p>${buttonHtml}</p>`).run()
    }
    setShowIconPicker(false)
    resetPendingButtonForm()
  }

  const insertAccordion = () => {
    setShowIconPicker(false)
    setShowImageForm(false)
    setShowVideoForm(false)
    setShowCardForm(false)
    setShowSectionForm(false)
    const groupId = `cms-accordion-${Date.now()}`
    const countRaw = window.prompt("How many accordion items?", "1")?.trim() || "1"
    const count = Math.min(Math.max(Number.parseInt(countRaw || "1", 10) || 1, 1), 10)
    let html = ""

    for (let i = 0; i < count; i += 1) {
      const idx = i + 1
      const title = window.prompt(`Accordion title ${idx}`, `Accordion title ${idx}`)?.trim() || `Accordion title ${idx}`
      const body = window.prompt(`Accordion content ${idx}`, "Accordion content goes here.")?.trim() || "Accordion content goes here."
      html += `<details data-cms-accordion="true" name="${groupId}" class="rounded-md border border-border p-3"><summary data-cms-accordion-summary="true" class="cursor-pointer font-semibold">${escapeHtml(title)}</summary><p class="mt-2 text-muted-foreground">${escapeHtml(body)}</p></details>`
    }

    editor
      .chain()
      .focus()
      .insertContent(`${html}<p></p>`)
      .run()
  }

  const insertCard = () => {
    startInsertCardFlow()
  }

  const insertSection = () => {
    startInsertSectionFlow()
  }

  const insertSeparator = () => {
    editor.chain().focus().insertContent(`<hr class="my-8 border-border" />`).run()
  }

  const insertSelectedKeyword = () => {
    const keywordToken = selectedKeywordToken.trim()
    if (!keywordToken) return
    editor.chain().focus().insertContent(keywordToken).run()
  }

  const insertTable = () => {
    const rows = Math.min(Math.max(Number.parseInt(window.prompt("Rows", "2") || "2", 10) || 2, 1), 10)
    const cols = Math.min(Math.max(Number.parseInt(window.prompt("Columns", "3") || "3", 10) || 3, 1), 10)
    editor.chain().focus().insertTable({ rows, cols, withHeaderRow: false }).run()
    editor
      .chain()
      .focus()
      .updateAttributes("table", { class: "cms-table cms-table-border-solid", borderStyle: "solid", responsiveMode: "stack" })
      .run()
    editor.chain().focus().setTextAlign("center").run()
  }

  const parseStyleVars = (styleText: string | null | undefined): Record<string, string> => {
    if (!styleText) return {}
    return styleText
      .split(";")
      .map((entry) => entry.trim())
      .filter(Boolean)
      .reduce<Record<string, string>>((acc, chunk) => {
        const separatorIndex = chunk.indexOf(":")
        if (separatorIndex <= 0) return acc
        const key = chunk.slice(0, separatorIndex).trim()
        const value = chunk.slice(separatorIndex + 1).trim()
        if (key && value) acc[key] = value
        return acc
      }, {})
  }

  const styleVarsToString = (vars: Record<string, string>) => Object.entries(vars).map(([key, value]) => `${key}:${value}`).join(";")

  const readSizeFromStyle = (styleText: string | null | undefined, keys: string[], fallback: string) => {
    const vars = parseStyleVars(styleText)
    for (const key of keys) {
      const value = vars[key]
      if (typeof value === "string" && value.trim().length > 0) return value.trim()
    }
    return fallback
  }

  const getLengthInput = (label: string, initialValue: string) => {
    const raw = (window.prompt(label, initialValue) || "").trim()
    if (!raw) return null
    const match = raw.match(/^(\d+(?:\.\d+)?)(px|%)$/i)
    if (!match) {
      window.alert("Invalid format. Use values like 320px or 75%")
      return null
    }
    const value = Number.parseFloat(match[1])
    const unit = match[2].toLowerCase()
    if (!Number.isFinite(value) || value <= 0) {
      window.alert("Value must be greater than 0.")
      return null
    }
    if (unit === "%" && value > 100) {
      window.alert("Percent value must be 100 or less.")
      return null
    }
    return `${value}${unit}`
  }

  const updateCurrentTableAttrs = (mutator: (attrs: Record<string, unknown>) => Record<string, unknown>) =>
    editor
      .chain()
      .focus()
      .command(({ state, tr, dispatch }) => {
        const { $from } = state.selection
        for (let depth = $from.depth; depth > 0; depth -= 1) {
          const node = $from.node(depth)
          if (node.type.name !== "table") continue
          const pos = $from.before(depth)
          tr.setNodeMarkup(pos, undefined, mutator(node.attrs as Record<string, unknown>))
          if (dispatch) dispatch(tr)
          return true
        }
        return false
      })
      .run()

  const setTableWidth = () => {
    if (!editor.isActive("table")) return
    const tableAttrs = editor.getAttributes("table") as Record<string, unknown>
    const currentWidth = readSizeFromStyle(typeof tableAttrs.style === "string" ? tableAttrs.style : null, ["width", "--cms-table-width"], "100%")
    const value = getLengthInput("Table width (e.g. 100% or 960px)", currentWidth)
    if (!value) return
    updateCurrentTableAttrs((attrs) => {
      const styleVars = parseStyleVars(typeof attrs.style === "string" ? attrs.style : null)
      styleVars.width = value
      styleVars["--cms-table-width"] = value
      return { ...attrs, style: styleVarsToString(styleVars) }
    })
  }

  const toggleTableAlignState = () => {
    if (!editor.isActive("table")) return
    const nextState = tableAlignState === "left" ? "center" : tableAlignState === "center" ? "right" : "left"
    updateCurrentTableAttrs((attrs) => {
      const styleVars = parseStyleVars(typeof attrs.style === "string" ? attrs.style : null)
      if (nextState === "center") {
        styleVars["margin-left"] = "auto"
        styleVars["margin-right"] = "auto"
      } else if (nextState === "right") {
        styleVars["margin-left"] = "auto"
        styleVars["margin-right"] = "0"
      } else {
        styleVars["margin-left"] = "0"
        styleVars["margin-right"] = "auto"
      }
      return { ...attrs, style: styleVarsToString(styleVars) }
    })
    setTableAlignState(nextState)
  }

  const setCurrentColumnWidth = () => {
    if (!editor.isActive("table")) return
    let initialWidth = "33%"
    const { $from } = editor.state.selection
    let tableDepth = -1
    let rowDepth = -1
    for (let depth = $from.depth; depth > 0; depth -= 1) {
      const nodeName = $from.node(depth).type.name
      if (nodeName === "table" && tableDepth < 0) tableDepth = depth
      if (nodeName === "tableRow" && rowDepth < 0) rowDepth = depth
      if (tableDepth >= 0 && rowDepth >= 0) break
    }
    if (rowDepth >= 0) {
      const rowNode = $from.node(rowDepth)
      const selectedColIndex = $from.index(rowDepth)
      if (tableDepth >= 0 && selectedColIndex >= 0) {
        const tableNode = $from.node(tableDepth)
        const tableStyle = typeof tableNode.attrs.style === "string" ? tableNode.attrs.style : null
        initialWidth = readSizeFromStyle(tableStyle, [`--cms-col-width-${selectedColIndex}`], initialWidth)
      }
      if (selectedColIndex < rowNode.childCount) {
        const cellNode = rowNode.child(selectedColIndex)
        const styleText = typeof cellNode.attrs.style === "string" ? cellNode.attrs.style : ""
        initialWidth = readSizeFromStyle(styleText, ["--cms-col-width", "width", "min-width"], initialWidth)
      }
    }
    const value = getLengthInput("Column width for selected column (e.g. 33% or 320px)", initialWidth)
    if (!value) return
    editor
      .chain()
      .focus()
      .command(({ state, tr, dispatch }) => {
        const { $from } = state.selection
        let tableDepth = -1
        let rowDepth = -1
        for (let depth = $from.depth; depth > 0; depth -= 1) {
          const nodeName = $from.node(depth).type.name
          if (nodeName === "table" && tableDepth < 0) tableDepth = depth
          if (nodeName === "tableRow" && rowDepth < 0) rowDepth = depth
        }
        if (tableDepth < 0 || rowDepth < 0) return false

        const tableNode = $from.node(tableDepth)
        const tablePos = $from.before(tableDepth)
        const selectedColIndex = $from.index(rowDepth)
        const tableStyleVars = parseStyleVars(typeof tableNode.attrs.style === "string" ? tableNode.attrs.style : null)
        tableStyleVars[`--cms-col-width-${selectedColIndex}`] = value
        tr.setNodeMarkup(tablePos, undefined, {
          ...(tableNode.attrs as Record<string, unknown>),
          style: styleVarsToString(tableStyleVars),
        })

        let rowOffset = 1
        for (let rowIndex = 0; rowIndex < tableNode.childCount; rowIndex += 1) {
          const rowNode = tableNode.child(rowIndex)
          if (selectedColIndex < rowNode.childCount) {
            let cellOffset = 1
            for (let colIndex = 0; colIndex < rowNode.childCount; colIndex += 1) {
              const cellNode = rowNode.child(colIndex)
              if (colIndex === selectedColIndex) {
                const cellPos = tablePos + rowOffset + cellOffset
                const existingStyle = typeof cellNode.attrs.style === "string" ? cellNode.attrs.style : ""
                const styleVars = parseStyleVars(existingStyle)
                styleVars.width = value
                styleVars["min-width"] = value
                styleVars["--cms-col-width"] = value
                tr.setNodeMarkup(cellPos, undefined, {
                  ...cellNode.attrs,
                  colwidth: null,
                  style: styleVarsToString(styleVars),
                })
              }
              cellOffset += cellNode.nodeSize
            }
          }
          rowOffset += rowNode.nodeSize
        }

        if (dispatch) dispatch(tr)
        return true
      })
      .run()
  }

  const setCurrentRowHeight = () => {
    if (!editor.isActive("table")) return
    let initialHeight = "180px"
    const { $from } = editor.state.selection
    let tableDepth = -1
    let rowDepth = -1
    for (let depth = $from.depth; depth > 0; depth -= 1) {
      const nodeName = $from.node(depth).type.name
      if (nodeName === "table" && tableDepth < 0) tableDepth = depth
      if (nodeName === "tableRow" && rowDepth < 0) rowDepth = depth
      if (tableDepth >= 0 && rowDepth >= 0) break
    }
    if (rowDepth >= 0) {
      const rowNode = $from.node(rowDepth)
      const selectedRowIndex = tableDepth >= 0 ? $from.index(tableDepth) : -1
      if (tableDepth >= 0 && selectedRowIndex >= 0) {
        const tableNode = $from.node(tableDepth)
        const tableStyle = typeof tableNode.attrs.style === "string" ? tableNode.attrs.style : null
        initialHeight = readSizeFromStyle(tableStyle, [`--cms-row-height-${selectedRowIndex}`], initialHeight)
      }
      if (rowNode.childCount > 0) {
        const sampleCell = rowNode.child(0)
        const styleText = typeof sampleCell.attrs.style === "string" ? sampleCell.attrs.style : ""
        initialHeight = readSizeFromStyle(styleText, ["--cms-row-height", "height", "min-height"], initialHeight)
      }
    }
    const value = getLengthInput("Row height for selected row (e.g. 180px or 25%)", initialHeight)
    if (!value) return
    editor
      .chain()
      .focus()
      .command(({ state, tr, dispatch }) => {
        const { $from } = state.selection
        let tableDepth = -1
        let rowDepth = -1
        for (let depth = $from.depth; depth > 0; depth -= 1) {
          const nodeName = $from.node(depth).type.name
          if (nodeName === "table" && tableDepth < 0) tableDepth = depth
          if (nodeName === "tableRow" && rowDepth < 0) rowDepth = depth
        }
        if (tableDepth < 0 || rowDepth < 0) return false

        const tableNode = $from.node(tableDepth)
        const tablePos = $from.before(tableDepth)
        const selectedRowIndex = $from.index(tableDepth)
        if (selectedRowIndex >= tableNode.childCount) return false
        const tableStyleVars = parseStyleVars(typeof tableNode.attrs.style === "string" ? tableNode.attrs.style : null)
        tableStyleVars[`--cms-row-height-${selectedRowIndex}`] = value
        tr.setNodeMarkup(tablePos, undefined, {
          ...(tableNode.attrs as Record<string, unknown>),
          style: styleVarsToString(tableStyleVars),
        })

        let rowOffset = 1
        for (let rowIndex = 0; rowIndex < tableNode.childCount; rowIndex += 1) {
          const rowNode = tableNode.child(rowIndex)
          if (rowIndex === selectedRowIndex) {
            let cellOffset = 1
            for (let colIndex = 0; colIndex < rowNode.childCount; colIndex += 1) {
              const cellNode = rowNode.child(colIndex)
              const cellPos = tablePos + rowOffset + cellOffset
              const existingStyle = typeof cellNode.attrs.style === "string" ? cellNode.attrs.style : ""
              const styleVars = parseStyleVars(existingStyle)
              styleVars.height = value
              styleVars["min-height"] = value
              styleVars["--cms-row-height"] = value
              tr.setNodeMarkup(cellPos, undefined, {
                ...cellNode.attrs,
                style: styleVarsToString(styleVars),
              })
              cellOffset += cellNode.nodeSize
            }
            break
          }
          rowOffset += rowNode.nodeSize
        }

        if (dispatch) dispatch(tr)
        return true
      })
      .run()
  }

  const toggleMobileStackTable = () => {
    if (!editor.isActive("table")) return
    updateCurrentTableAttrs((attrs) => {
      const current = typeof attrs.responsiveMode === "string" ? attrs.responsiveMode : "stack"
      const next = current === "stack" ? "scroll" : "stack"
      return { ...attrs, responsiveMode: next }
    })
  }

  const setTableBorderPreset = (preset: "none" | "solid" | "dashed" | "double") => {
    if (!editor.isActive("table")) return
    editor
      .chain()
      .focus()
      .command(({ state, tr, dispatch }) => {
        const { $from } = state.selection
        for (let depth = $from.depth; depth > 0; depth -= 1) {
          const node = $from.node(depth)
          if (node.type.name !== "table") continue
          const pos = $from.before(depth)
          const existingStyleVars = parseStyleVars(typeof node.attrs.style === "string" ? node.attrs.style : null)
          delete existingStyleVars["--cms-table-border-style"]
          delete existingStyleVars["--cms-table-border-width"]
          delete existingStyleVars["--cms-table-border-color"]
          const attrs = {
            ...node.attrs,
            class: `cms-table cms-table-border-${preset}`,
            borderStyle: preset,
            style: Object.keys(existingStyleVars).length > 0 ? styleVarsToString(existingStyleVars) : null,
          }
          tr.setNodeMarkup(pos, undefined, attrs)
          if (dispatch) dispatch(tr)
          return true
        }
        return false
      })
      .run()
  }

  const setTableBorderCustom = () => {
    if (!editor.isActive("table")) return
    const style = (window.prompt("Border style (solid / dashed / double)", "solid") || "solid").trim().toLowerCase()
    const widthRaw = (window.prompt("Border width in px", "1") || "1").trim()
    const color = (window.prompt("Border color (hex or css color)", "#d8dfe4") || "#d8dfe4").trim()
    const width = Number.parseInt(widthRaw, 10)
    const safeWidth = Number.isFinite(width) && width > 0 ? width : 1
    const safeStyle = ["solid", "dashed", "double"].includes(style) ? style : "solid"

    editor
      .chain()
      .focus()
      .command(({ state, tr, dispatch }) => {
        const { $from } = state.selection
        for (let depth = $from.depth; depth > 0; depth -= 1) {
          const node = $from.node(depth)
          if (node.type.name !== "table") continue
          const pos = $from.before(depth)
          const existingStyleVars = parseStyleVars(typeof node.attrs.style === "string" ? node.attrs.style : null)
          existingStyleVars["--cms-table-border-style"] = safeStyle
          existingStyleVars["--cms-table-border-width"] = `${safeWidth}px`
          existingStyleVars["--cms-table-border-color"] = color
          const attrs = {
            ...node.attrs,
            class: "cms-table cms-table-border-custom",
            borderStyle: "custom",
            style: styleVarsToString(existingStyleVars),
          }
          tr.setNodeMarkup(pos, undefined, attrs)
          if (dispatch) dispatch(tr)
          return true
        }
        return false
      })
      .run()
  }

  const preservedLeadingVisual = pendingButtonLeadingVisualHtml.trim()
  const preservedLeadingImagePreview = extractImagePreviewFromHtml(preservedLeadingVisual)
  const hasInlineSvgInContent = containsInlineSvgMarkup(content || "")
  const visualModeLockedBySvg = hasInlineSvgInContent && !allowSvgVisualMode
  const sourceEditorValue = sourceDirty ? sourceHtml : sourceHtml || sourceSeed || content || editor.getHTML()
  const previewContentValue =
    mode === "preview" ? sourceHtml : sourceDirty ? sourceHtml : sourceHtml || content || editor.getHTML()

  return (
    <div className="border border-input rounded-md">
      <div className="flex items-center justify-between gap-2 p-2 border-b border-input bg-muted/30">
        <div className="flex items-center gap-1">
          <Button
            type="button"
            size="sm"
            variant={mode === "visual" ? "default" : "ghost"}
            onClick={() => switchModeAny("visual")}
            disabled={visualModeLockedBySvg}
            title={visualModeLockedBySvg ? "Inline SVG content is locked to HTML Source mode." : undefined}
          >
            <Eye className="h-4 w-4 mr-1" />
            Visual
          </Button>
          <Button type="button" size="sm" variant={mode === "source" ? "default" : "ghost"} onClick={() => switchModeAny("source")}>
            <CodeXml className="h-4 w-4 mr-1" />
            HTML Source
          </Button>
          <Button type="button" size="sm" variant={mode === "preview" ? "default" : "ghost"} onClick={() => switchModeAny("preview")}>
            <Monitor className="h-4 w-4 mr-1" />
            Preview
          </Button>
        </div>
        {hasInlineSvgInContent ? (
          <div className="flex items-center gap-2">
            <p className="text-xs text-muted-foreground">
              {allowSvgVisualMode
                ? "Visual mode unlocked for SVG content. SVG bullets may change while editing."
                : "Inline SVG detected. Visual mode is locked to prevent SVG bullet loss."}
            </p>
            {allowSvgVisualMode ? (
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => {
                  setAllowSvgVisualMode(false)
                  if (mode === "visual") switchModeAny("source")
                }}
              >
                Re-lock Safety
              </Button>
            ) : (
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => {
                  if (
                    !window.confirm(
                      "Unlock Visual mode for SVG content?\n\nWarning: editing in Visual mode may alter or remove SVG bullet icons.",
                    )
                  ) {
                    return
                  }
                  setAllowSvgVisualMode(true)
                  switchModeAny("visual")
                }}
              >
                Unlock Visual Mode
              </Button>
            )}
          </div>
        ) : null}
      </div>

      {mode === "visual" ? (
        <>
      <div className="flex flex-wrap gap-1 p-2 border-b border-input bg-muted/30">
        <Button
          type="button"
          size="sm"
          variant={editor.isActive("bold") ? "default" : "ghost"}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size="sm"
          variant={editor.isActive("italic") ? "default" : "ghost"}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size="sm"
          variant={editor.isActive("strike") ? "default" : "ghost"}
          onClick={() => editor.chain().focus().toggleStrike().run()}
        >
          <Strikethrough className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size="sm"
          variant={editor.isActive("code") ? "default" : "ghost"}
          onClick={() => editor.chain().focus().toggleCode().run()}
        >
          <Code className="h-4 w-4" />
        </Button>
        <div className="w-px h-6 bg-border mx-1" />
        <Button
          type="button"
          size="sm"
          variant={editor.isActive("heading", { level: 1 }) ? "default" : "ghost"}
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        >
          <Heading1 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size="sm"
          variant={editor.isActive("heading", { level: 2 }) ? "default" : "ghost"}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          <Heading2 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size="sm"
          variant={editor.isActive("heading", { level: 3 }) ? "default" : "ghost"}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        >
          <Heading3 className="h-4 w-4" />
        </Button>
        <div className="w-px h-6 bg-border mx-1" />
        <Button
          type="button"
          size="sm"
          variant={editor.isActive("bulletList") ? "default" : "ghost"}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size="sm"
          variant={editor.isActive("orderedList") ? "default" : "ghost"}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size="sm"
          variant={editor.isActive("blockquote") ? "default" : "ghost"}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <Quote className="h-4 w-4" />
        </Button>
        <div className="relative">
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => {
              setShowTextColorMenu((open) => !open)
              setShowHighlightColorMenu(false)
            }}
            title="Text color palette"
          >
            <Palette className="h-4 w-4" />
          </Button>
          {showTextColorMenu ? (
            <div className="absolute left-0 top-10 z-40 min-w-[120px] rounded-md border border-input bg-background p-2 shadow-md">
              <div className="grid grid-cols-4 gap-1">
                {TEXT_COLOR_OPTIONS.map((option) => (
                  <button
                    key={`text-${option.label}`}
                    type="button"
                    title={option.label}
                    aria-label={`Text color ${option.label}`}
                    onMouseDown={(event) => {
                      event.preventDefault()
                      applyTextColor(option.value)
                      setShowTextColorMenu(false)
                    }}
                    className={`h-5 w-5 rounded-sm border ${selectedTextColor === option.value ? "ring-2 ring-primary ring-offset-1" : ""}`}
                    style={{ background: option.value || "linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%)", borderColor: "#cbd5e1" }}
                  />
                ))}
              </div>
            </div>
          ) : null}
        </div>
        <Button
          type="button"
          size="sm"
          variant={editor.isActive("textStyle", { color: selectedTextColor }) ? "default" : "ghost"}
          onMouseDown={(event) => event.preventDefault()}
          onClick={clearTextColor}
          title="Clear text color"
        >
          <Eraser className="h-4 w-4" />
        </Button>
        <div className="relative">
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => {
              setShowHighlightColorMenu((open) => !open)
              setShowTextColorMenu(false)
            }}
            title="Highlight color palette"
          >
            <Highlighter className="h-4 w-4" />
          </Button>
          {showHighlightColorMenu ? (
            <div className="absolute left-0 top-10 z-40 min-w-[120px] rounded-md border border-input bg-background p-2 shadow-md">
              <div className="grid grid-cols-4 gap-1">
                {HIGHLIGHT_COLOR_OPTIONS.map((option) => (
                  <button
                    key={`hl-${option.value}`}
                    type="button"
                    title={option.label}
                    aria-label={`Highlight color ${option.label}`}
                    onMouseDown={(event) => {
                      event.preventDefault()
                      applyHighlightColor(option.value)
                      setShowHighlightColorMenu(false)
                    }}
                    className={`h-5 w-5 rounded-sm border ${selectedHighlightColor === option.value ? "ring-2 ring-primary ring-offset-1" : ""}`}
                    style={{ background: option.value, borderColor: "#cbd5e1" }}
                  />
                ))}
              </div>
            </div>
          ) : null}
        </div>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onMouseDown={(event) => event.preventDefault()}
          onClick={clearHighlightColor}
          title="Clear highlight"
        >
          <Eraser className="h-4 w-4" />
        </Button>
        <div className="w-px h-6 bg-border mx-1" />
        <Button type="button" size="sm" variant={editor.isActive("link") ? "default" : "ghost"} onClick={setLink}>
          <LinkIcon className="h-4 w-4" />
        </Button>
        {isLinkActive ? (
          <Button type="button" size="sm" variant="ghost" onClick={editSelectedLinkUrl}>
            Edit URL
          </Button>
        ) : null}
        <Button
          type="button"
          size="sm"
          variant={isAlignmentActive("left") ? "default" : "ghost"}
          onClick={() => applyAlignment("left")}
        >
          <AlignLeft className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size="sm"
          variant={isAlignmentActive("center") ? "default" : "ghost"}
          onClick={() => applyAlignment("center")}
        >
          <AlignCenter className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size="sm"
          variant={isAlignmentActive("right") ? "default" : "ghost"}
          onClick={() => applyAlignment("right")}
        >
          <AlignRight className="h-4 w-4" />
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={startInsertImageFlow}>
          <ImageIcon className="h-4 w-4" />
        </Button>
        {selectedImagePos !== null ? (
          <Button type="button" size="sm" variant="ghost" onClick={startEditImageFlow}>
            Edit Image
          </Button>
        ) : null}
        <div className="w-px h-6 bg-border mx-1" />
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
        >
          <Undo className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
        >
          <Redo className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex flex-wrap gap-2 p-2 border-b border-input bg-background">
        <Button type="button" size="sm" variant="outline" onClick={startInsertButtonFlow}>
          <RectangleHorizontal className="h-4 w-4 mr-1" />
          Add Button
        </Button>
        {activeLinkIsButton ? (
          <Button type="button" size="sm" variant="outline" onClick={editSelectedButton}>
            Edit Button
          </Button>
        ) : null}
        <Button type="button" size="sm" variant="outline" onClick={insertAccordion}>
          <Columns2 className="h-4 w-4 mr-1" />
          Accordion
        </Button>
        {selectedAccordionPos !== null ? (
          <Button type="button" size="sm" variant="outline" onClick={startEditAccordionFlow}>
            Edit Accordion
          </Button>
        ) : null}
        <Button type="button" size="sm" variant="outline" onClick={insertCard}>
          <SquareStack className="h-4 w-4 mr-1" />
          Card
        </Button>
        {selectedCardPos !== null ? (
          <Button type="button" size="sm" variant="outline" onClick={startEditCardFlow}>
            Edit Card
          </Button>
        ) : null}
        <Button type="button" size="sm" variant="outline" onClick={insertSection}>
          <Columns2 className="h-4 w-4 mr-1" />
          Section
        </Button>
        {selectedSectionPos !== null ? (
          <Button type="button" size="sm" variant="outline" onClick={startEditSectionFlow}>
            Edit Section
          </Button>
        ) : null}
        <Button type="button" size="sm" variant="outline" onClick={insertSeparator}>
          <SeparatorHorizontal className="h-4 w-4 mr-1" />
          Separator
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={insertTable}>
          <Table2 className="h-4 w-4 mr-1" />
          Table
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={startInsertVideoFlow}>
          <PlayCircle className="h-4 w-4 mr-1" />
          Video
        </Button>
        {selectedVideoPos !== null ? (
          <Button type="button" size="sm" variant="outline" onClick={startEditVideoFlow}>
            Edit Video
          </Button>
        ) : null}
        <div className="flex items-center gap-2">
          <select
            className="h-9 min-w-[160px] rounded-md border border-input bg-background px-3 text-sm"
            value={selectedKeywordToken}
            onChange={(event) => setSelectedKeywordToken(event.target.value)}
          >
            {CONTENT_KEYWORD_OPTIONS.map((keyword) => (
              <option key={keyword.token} value={keyword.token}>
                {keyword.label}
              </option>
            ))}
          </select>
          <Button type="button" size="sm" variant="outline" onClick={insertSelectedKeyword}>
            Insert Keyword
          </Button>
        </div>
      </div>
      {isCursorInTable && (
        <div className="flex flex-wrap gap-2 p-2 border-b border-input bg-muted/20">
          <Button type="button" size="sm" variant="outline" onClick={() => setTableBorderPreset("none")}>
            No Border
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={() => setTableBorderPreset("solid")}>
            Solid Border
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={() => setTableBorderPreset("dashed")}>
            Dashed Border
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={() => setTableBorderPreset("double")}>
            Double Border
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={setTableBorderCustom}>
            Custom Border
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={setTableWidth}>
            Table Width
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={toggleTableAlignState}
            title={`Table alignment: ${tableAlignState.toUpperCase()} (click to cycle L/C/R)`}
          >
            {tableAlignState.toUpperCase()}
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={setCurrentColumnWidth}>
            Column Width
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={setCurrentRowHeight}>
            Row Height
          </Button>
          <Button
            type="button"
            size="sm"
            variant={isMobileStackActive ? "default" : "outline"}
            onClick={toggleMobileStackTable}
            title={isMobileStackActive ? "Mobile Stack is ON for this table" : "Mobile Stack is OFF for this table"}
          >
            Mobile Stack: {isMobileStackActive ? "ON" : "OFF"}
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={() => editor.chain().focus().addColumnBefore().run()}>
            <Plus className="h-4 w-4 mr-1" />
            Col Before
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={() => editor.chain().focus().addColumnAfter().run()}>
            <Plus className="h-4 w-4 mr-1" />
            Col After
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={() => editor.chain().focus().deleteColumn().run()}>
            <Minus className="h-4 w-4 mr-1" />
            Del Col
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={() => editor.chain().focus().addRowBefore().run()}>
            <Plus className="h-4 w-4 mr-1" />
            Row Before
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={() => editor.chain().focus().addRowAfter().run()}>
            <Plus className="h-4 w-4 mr-1" />
            Row After
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={() => editor.chain().focus().deleteRow().run()}>
            <Minus className="h-4 w-4 mr-1" />
            Del Row
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={() => editor.chain().focus().mergeOrSplit().run()}>
            <SplitSquareHorizontal className="h-4 w-4 mr-1" />
            Merge/Split
          </Button>
          <Button type="button" size="sm" variant="destructive" onClick={() => editor.chain().focus().deleteTable().run()}>
            <Trash2 className="h-4 w-4 mr-1" />
            Delete Table
          </Button>
        </div>
      )}
      {showSectionForm && (
        <div className="p-3 border-b border-input bg-muted/20 space-y-3">
          <p className="text-sm font-medium">{sectionFormMode === "edit" ? "Edit Section" : "Insert Section"}</p>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-1.5 md:col-span-2 lg:col-span-3">
              <label className="text-xs font-medium text-muted-foreground">Color Theme</label>
              <select
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={sectionPreset}
                onChange={(event) => setSectionPreset(normalizeSectionPreset(event.target.value))}
              >
                {SECTION_PRESET_OPTIONS.map((presetOption) => (
                  <option key={presetOption.id} value={presetOption.id}>
                    {presetOption.label}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-muted-foreground">{sectionPresetOption.description}</p>
            </div>
            <div className="space-y-1.5 md:col-span-2 lg:col-span-3">
              <label className="text-xs font-medium text-muted-foreground">Section Width</label>
              <div className="grid gap-2 sm:grid-cols-2">
                <label className="inline-flex items-center gap-2 text-xs">
                  <input
                    type="checkbox"
                    checked={sectionFullWidth}
                    onChange={(event) => setSectionFullWidth(event.target.checked)}
                  />
                  Full width section band
                </label>
                <label className="inline-flex items-center gap-2 text-xs">
                  <input
                    type="checkbox"
                    checked={sectionConstrainContent}
                    onChange={(event) => setSectionConstrainContent(event.target.checked)}
                  />
                  Restrict content to page width
                </label>
              </div>
              <p className="text-[11px] text-muted-foreground">
                The band controls the section background width. The content option keeps text and blocks inside the normal page container.
              </p>
            </div>
            <div className="space-y-1.5 md:col-span-2 lg:col-span-3">
              <label className="text-xs font-medium text-muted-foreground">Content Animation</label>
              <div className="grid gap-2 sm:grid-cols-2">
                <label className="inline-flex items-center gap-2 text-xs">
                  <input
                    type="checkbox"
                    checked={sectionAnimateEntrance}
                    onChange={(event) => setSectionAnimateEntrance(event.target.checked)}
                  />
                  Enable entrance animation
                </label>
                <label className="inline-flex items-center gap-2 text-xs">
                  <input
                    type="checkbox"
                    checked={sectionAnimateExit}
                    onChange={(event) => setSectionAnimateExit(event.target.checked)}
                  />
                  Enable exit animation
                </label>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Entrance controls reveal animation. Exit controls hide animation when section leaves viewport. Cards inside this section follow
                these settings with their own card animation style.
              </p>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Spacing</label>
              <select
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={sectionSpacing}
                onChange={(event) => setSectionSpacing(normalizeSectionSpacing(event.target.value))}
              >
                {SECTION_SPACING_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Gap Before Section</label>
              <select
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={sectionGapBefore}
                onChange={(event) => setSectionGapBefore(normalizeSectionGap(event.target.value, DEFAULT_SECTION_NODE_GAP_BEFORE))}
              >
                {SECTION_GAP_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Gap After Section</label>
              <select
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={sectionGapAfter}
                onChange={(event) => setSectionGapAfter(normalizeSectionGap(event.target.value, DEFAULT_SECTION_NODE_GAP_AFTER))}
              >
                {SECTION_GAP_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Corner Radius</label>
              <select
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={sectionRadius}
                onChange={(event) => setSectionRadius(normalizeSectionRadius(event.target.value))}
              >
                {SECTION_RADIUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Border</label>
              <select
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={sectionBorder}
                onChange={(event) => setSectionBorder(normalizeSectionBorder(event.target.value))}
              >
                {SECTION_BORDER_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Shadow</label>
              <select
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={sectionShadow}
                onChange={(event) => setSectionShadow(normalizeSectionShadow(event.target.value))}
              >
                {SECTION_SHADOW_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5 md:col-span-2 lg:col-span-3">
              <p className="text-xs font-medium text-muted-foreground">Theme Preview</p>
              <div
                className="rounded-md border px-3 py-2 text-xs"
                style={{
                  background: sectionPresetOption.background,
                  color: sectionPresetOption.headingColor || sectionPresetOption.textColor || "inherit",
                  borderColor: sectionPresetOption.borderColor || "rgba(148, 163, 184, 0.32)",
                }}
              >
                {sectionPresetOption.label}: {sectionPresetOption.description}
              </div>
            </div>
            {sectionFormError ? <p className="md:col-span-2 lg:col-span-3 text-xs text-destructive">{sectionFormError}</p> : null}
          </div>
          <div className="flex items-center justify-end gap-2">
            <Button type="button" size="sm" variant="outline" onClick={closeSectionForm}>
              Cancel
            </Button>
            <Button type="button" size="sm" onClick={submitSectionForm}>
              {sectionFormMode === "edit" ? "Update Section" : "Insert Section"}
            </Button>
          </div>
        </div>
      )}
      {showImageForm && (
        <div className="p-3 border-b border-input bg-muted/20 space-y-3">
          <p className="text-sm font-medium">{imageFormMode === "edit" ? "Edit Image" : "Insert Image"}</p>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Image URL or File Key</label>
            <Input
              value={imageSource}
              onChange={(e) => setImageSource(e.target.value)}
              placeholder="https://example.com/image.jpg or images/file.jpg"
            />
            <label
              htmlFor="cms-inline-image-upload"
              className="inline-flex cursor-pointer items-center gap-2 text-xs text-primary hover:underline"
            >
              <UploadCloud className="h-3.5 w-3.5" />
              Upload image file
            </label>
            <input
              ref={imageFileInputRef}
              id="cms-inline-image-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => uploadImage(e.target.files?.[0] || null)}
            />
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Image Click Link (optional)</label>
              <Input
                value={imageLinkUrl}
                onChange={(e) => setImageLinkUrl(e.target.value)}
                placeholder="https://example.com/page or /contact"
              />
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Alt Text (optional)</label>
                <Input
                  value={imageAltText}
                  onChange={(e) => setImageAltText(e.target.value)}
                  placeholder="Describe the image"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Title (optional)</label>
                <Input
                  value={imageTitleText}
                  onChange={(e) => setImageTitleText(e.target.value)}
                  placeholder="Image title"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Width (px, optional)</label>
                <Input value={imageWidth} onChange={(e) => setImageWidth(e.target.value)} placeholder="640" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Height (px, optional)</label>
                <Input value={imageHeight} onChange={(e) => setImageHeight(e.target.value)} placeholder="360" />
              </div>
            </div>
            {imageUploading ? <p className="text-xs text-muted-foreground">Uploading image...</p> : null}
            {imageUploadError ? <p className="text-xs text-destructive">{imageUploadError}</p> : null}
          </div>
          <div className="flex items-center justify-end gap-2">
            <Button type="button" size="sm" variant="outline" onClick={closeImageForm}>
              Cancel
            </Button>
            <Button type="button" size="sm" onClick={insertImageFromForm} disabled={imageUploading}>
              {imageFormMode === "edit" ? "Update Image" : "Insert Image"}
            </Button>
          </div>
        </div>
      )}
      {showCardForm && (
        <div className="p-3 border-b border-input bg-muted/20 space-y-3">
          <p className="text-sm font-medium">{cardFormMode === "edit" ? "Edit Card" : "Insert Card"}</p>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Card Title</label>
              <Input value={cardTitle} onChange={(e) => setCardTitle(e.target.value)} placeholder="Card title" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Icon</label>
              <select
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={cardIconName}
                onChange={(e) => setCardIconName(e.target.value && isContentIconName(e.target.value) ? e.target.value : "")}
                disabled={cardImageSource.trim().length > 0}
              >
                <option value="">None</option>
                {CONTENT_ICON_OPTIONS.map((iconOption) => (
                  <option key={iconOption} value={iconOption}>
                    {iconOption}
                  </option>
                ))}
              </select>
              {cardImageSource.trim().length > 0 ? (
                <p className="text-[11px] text-muted-foreground">Image is currently set, so icon is ignored.</p>
              ) : null}
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-medium text-muted-foreground">Card Description</label>
              <textarea
                value={cardBody}
                onChange={(e) => setCardBody(e.target.value)}
                placeholder="Card description text."
                className="min-h-[90px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-medium text-muted-foreground">Image URL or File Key (optional)</label>
              <Input
                value={cardImageSource}
                onChange={(e) => setCardImageSource(e.target.value)}
                placeholder="https://example.com/image.jpg or images/file.jpg"
              />
              <label
                htmlFor="cms-card-image-upload"
                className="inline-flex cursor-pointer items-center gap-2 text-xs text-primary hover:underline"
              >
                <UploadCloud className="h-3.5 w-3.5" />
                Upload image file
              </label>
              <input
                ref={cardImageFileInputRef}
                id="cms-card-image-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => uploadCardImage(e.target.files?.[0] || null)}
              />
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-medium text-muted-foreground">Image Click Link (optional)</label>
              <Input
                value={cardImageLinkUrl}
                onChange={(e) => setCardImageLinkUrl(e.target.value)}
                placeholder="https://example.com/page or /contact"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Image Alt Text (optional)</label>
              <Input
                value={cardImageAltText}
                onChange={(e) => setCardImageAltText(e.target.value)}
                placeholder="Describe the card image"
              />
            </div>
            <div className="grid gap-3 grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Image Width (px)</label>
                <Input value={cardImageWidth} onChange={(e) => setCardImageWidth(e.target.value)} placeholder="320" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Image Height (px)</label>
                <Input value={cardImageHeight} onChange={(e) => setCardImageHeight(e.target.value)} placeholder="200" />
              </div>
            </div>
            {cardImageUploading ? <p className="md:col-span-2 text-xs text-muted-foreground">Uploading image...</p> : null}
            {cardFormError ? <p className="md:col-span-2 text-xs text-destructive">{cardFormError}</p> : null}
          </div>
          <div className="flex items-center justify-end gap-2">
            <Button type="button" size="sm" variant="outline" onClick={closeCardForm}>
              Cancel
            </Button>
            <Button type="button" size="sm" onClick={submitCardForm} disabled={cardImageUploading}>
              {cardFormMode === "edit" ? "Update Card" : "Insert Card"}
            </Button>
          </div>
        </div>
      )}
      {showIconPicker && (
        <div className="p-3 border-b border-input bg-muted/20 space-y-3">
          <p className="text-sm font-medium">{buttonFormMode === "edit" ? "Edit Button" : "Add Button"}</p>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Button Label</label>
              <Input value={pendingButtonLabel} onChange={(e) => setPendingButtonLabel(e.target.value)} placeholder="Get Started" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Button URL</label>
              <Input value={pendingButtonHref} onChange={(e) => setPendingButtonHref(e.target.value)} placeholder="/contact" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Button Style</label>
              <select
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={pendingButtonVariant}
                onChange={(e) => applyPendingButtonVariantDefaults(e.target.value as ButtonVariant)}
              >
                <option value="primary">Primary</option>
                <option value="outline">Outline</option>
                <option value="secondary">Secondary</option>
                <option value="ghost">Ghost</option>
                <option value="danger">Danger</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Button Size</label>
              <select
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={pendingButtonSize}
                onChange={(e) => setPendingButtonSize((e.target.value as ButtonSize) || "md")}
              >
                <option value="sm">Small</option>
                <option value="md">Medium</option>
                <option value="lg">Large</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Text Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={toPickerHex(pendingButtonTextColor || "#ffffff")}
                  onChange={(e) => setPendingButtonTextColor(e.target.value)}
                  className="h-9 w-12 rounded-md border border-input bg-background p-1"
                />
                <Input value={pendingButtonTextColor} onChange={(e) => setPendingButtonTextColor(e.target.value)} placeholder="#ffffff or white" />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Background Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={toPickerHex(pendingButtonBgColor || "#2563eb")}
                  onChange={(e) => setPendingButtonBgColor(e.target.value)}
                  className="h-9 w-12 rounded-md border border-input bg-background p-1"
                />
                <Input value={pendingButtonBgColor} onChange={(e) => setPendingButtonBgColor(e.target.value)} placeholder="#2563eb" />
                <Button type="button" size="sm" variant="outline" onClick={() => setPendingButtonBgColor("transparent")}>
                  Transparent
                </Button>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Hover Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={toPickerHex(pendingButtonHoverColor || "#1d4ed8")}
                  onChange={(e) => setPendingButtonHoverColor(e.target.value)}
                  className="h-9 w-12 rounded-md border border-input bg-background p-1"
                />
                <Input value={pendingButtonHoverColor} onChange={(e) => setPendingButtonHoverColor(e.target.value)} placeholder="#1d4ed8" />
                <Button type="button" size="sm" variant="outline" onClick={() => setPendingButtonHoverColor("transparent")}>
                  Transparent
                </Button>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Hover Text Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={toPickerHex(pendingButtonHoverTextColor || "#ffffff")}
                  onChange={(e) => setPendingButtonHoverTextColor(e.target.value)}
                  className="h-9 w-12 rounded-md border border-input bg-background p-1"
                />
                <Input value={pendingButtonHoverTextColor} onChange={(e) => setPendingButtonHoverTextColor(e.target.value)} placeholder="#ffffff" />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Border Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={toPickerHex(pendingButtonBorderColor || "#cbd5e1")}
                  onChange={(e) => setPendingButtonBorderColor(e.target.value)}
                  className="h-9 w-12 rounded-md border border-input bg-background p-1"
                />
                <Input value={pendingButtonBorderColor} onChange={(e) => setPendingButtonBorderColor(e.target.value)} placeholder="#cbd5e1" />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Hover Border Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={toPickerHex(pendingButtonHoverBorderColor || pendingButtonBorderColor || "#cbd5e1")}
                  onChange={(e) => setPendingButtonHoverBorderColor(e.target.value)}
                  className="h-9 w-12 rounded-md border border-input bg-background p-1"
                />
                <Input
                  value={pendingButtonHoverBorderColor}
                  onChange={(e) => setPendingButtonHoverBorderColor(e.target.value)}
                  placeholder="#cbd5e1"
                />
                <Button type="button" size="sm" variant="outline" onClick={() => setPendingButtonHoverBorderColor("transparent")}>
                  Transparent
                </Button>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Border Width (px)</label>
              <Input value={pendingButtonBorderWidth} onChange={(e) => setPendingButtonBorderWidth(e.target.value)} placeholder="1" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Corner Radius (px)</label>
              <Input value={pendingButtonRadius} onChange={(e) => setPendingButtonRadius(e.target.value)} placeholder="8" />
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-medium text-muted-foreground">Quick Presets</label>
              <div className="flex flex-wrap gap-2">
                <Button type="button" size="sm" variant="outline" onClick={() => applyPendingButtonVariantDefaults("primary")}>
                  Primary
                </Button>
                <Button type="button" size="sm" variant="outline" onClick={() => applyPendingButtonVariantDefaults("outline")}>
                  Outline
                </Button>
                <Button type="button" size="sm" variant="outline" onClick={() => applyPendingButtonVariantDefaults("danger")}>
                  Danger
                </Button>
              </div>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Icon (optional)</p>
          <Input
            value={iconSearch}
            onChange={(e) => setIconSearch(e.target.value)}
            placeholder="Search Font Awesome icons (e.g. arrow-right, phone)"
          />
          {hasHiddenIcons ? (
            <p className="text-[11px] text-muted-foreground">
              Showing {visibleIcons.length} of {filteredIcons.length} icons. Type more characters to narrow results.
            </p>
          ) : null}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-h-56 overflow-auto">
            {visibleIcons.map((icon) => {
              const iconClass = icon.className
              return (
              <button
                key={icon.name}
                type="button"
                onClick={() => setSelectedIconClass(iconClass)}
                className={`flex items-center gap-2 rounded-md border px-2 py-1.5 text-sm text-left ${
                  selectedIconClass === iconClass ? "border-primary bg-primary/10" : "border-border bg-background"
                }`}
              >
                <i className={iconClass} aria-hidden="true" />
                <span>{icon.name}</span>
              </button>
            )})}
          </div>
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs text-muted-foreground">Selected icon: {selectedIconClass || "None"}</p>
            {buttonFormMode === "edit" && !selectedIconClass && preservedLeadingVisual ? (
              <p className="text-xs text-muted-foreground">Existing button image/icon will be preserved.</p>
            ) : null}
            <div className="flex items-center gap-2">
              {buttonFormMode === "edit" && preservedLeadingVisual ? (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setPendingButtonLeadingVisualHtml("")
                    setSelectedIconClass("")
                  }}
                >
                  Remove Existing Image/Icon
                </Button>
              ) : null}
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => {
                  setShowIconPicker(false)
                  resetPendingButtonForm()
                }}
              >
                Cancel
              </Button>
              <Button type="button" size="sm" onClick={insertButtonWithIcon}>
                {buttonFormMode === "edit" ? "Update Button" : "Insert Button"}
              </Button>
            </div>
          </div>
          {buttonFormMode === "edit" && !selectedIconClass && preservedLeadingVisual ? (
            <div className="rounded-md border border-border bg-muted/30 p-2">
              <p className="text-xs font-medium text-foreground">Loaded existing button visual</p>
              {preservedLeadingImagePreview ? (
                <div className="mt-2 flex items-center gap-2">
                  <img
                    src={preservedLeadingImagePreview.src}
                    alt={preservedLeadingImagePreview.alt || "Button visual"}
                    className="h-9 w-9 rounded object-contain border border-border bg-background"
                  />
                  <p className="min-w-0 text-[11px] text-muted-foreground truncate">{preservedLeadingImagePreview.src}</p>
                </div>
              ) : (
                <p className="mt-1 text-[11px] text-muted-foreground">Existing icon/image markup is loaded and will be kept on update.</p>
              )}
            </div>
          ) : null}
        </div>
      )}
      {showVideoForm && (
        <div className="p-3 border-b border-input bg-muted/20 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium">{videoFormMode === "edit" ? "Edit Selected Video" : "Insert Video"}</p>
            <Button type="button" size="sm" variant="outline" onClick={applyVidstackDemoPreset}>
              Use Demo Preset
            </Button>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Video URL or File Key</label>
              <Input
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://youtube.com/watch?v=... or videos/file.mp4"
              />
              <label
                htmlFor="cms-video-upload"
                className="inline-flex cursor-pointer items-center gap-2 text-xs text-primary hover:underline"
              >
                <UploadCloud className="h-3.5 w-3.5" />
                Upload video file
              </label>
              <input
                ref={videoFileInputRef}
                id="cms-video-upload"
                type="file"
                accept="video/*"
                className="hidden"
                onChange={(e) => uploadVideo(e.target.files?.[0] || null)}
              />
              {videoUploading ? <p className="text-xs text-muted-foreground">Uploading video...</p> : null}
              {videoUploadError ? <p className="text-xs text-destructive">{videoUploadError}</p> : null}
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Poster URL or Key (optional)</label>
              <Input
                value={videoPoster}
                onChange={(e) => setVideoPoster(e.target.value)}
                placeholder="videos/poster.jpg"
              />
              <label
                htmlFor="cms-video-poster-upload"
                className="inline-flex cursor-pointer items-center gap-2 text-xs text-primary hover:underline"
              >
                <UploadCloud className="h-3.5 w-3.5" />
                Upload poster image
              </label>
              <input
                ref={posterFileInputRef}
                id="cms-video-poster-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => uploadPoster(e.target.files?.[0] || null)}
              />
              {posterUploading ? <p className="text-xs text-muted-foreground">Uploading poster...</p> : null}
              {posterUploadError ? <p className="text-xs text-destructive">{posterUploadError}</p> : null}
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Thumbnails VTT URL/Key (optional)</label>
              <Input
                value={videoThumbnails}
                onChange={(e) => setVideoThumbnails(e.target.value)}
                placeholder="videos/thumbnails.vtt"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Player Title</label>
              <Input value={videoTitle} onChange={(e) => setVideoTitle(e.target.value)} placeholder="Video title" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Caption (optional)</label>
              <Input value={videoCaption} onChange={(e) => setVideoCaption(e.target.value)} placeholder="Caption text" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Aspect Ratio</label>
              <select
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={videoAspectRatio}
                onChange={(e) => setVideoAspectRatio(e.target.value)}
              >
                <option value="16/9">16:9</option>
                <option value="4/3">4:3</option>
                <option value="1/1">1:1</option>
                <option value="21/9">21:9</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Width (optional)</label>
              <Input value={videoWidth} onChange={(e) => setVideoWidth(e.target.value)} placeholder="100% or 960px" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Height (optional)</label>
              <Input value={videoHeight} onChange={(e) => setVideoHeight(e.target.value)} placeholder="540px" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Preload</label>
              <select
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={videoPreload}
                onChange={(e) => setVideoPreload(e.target.value as "none" | "metadata" | "auto")}
              >
                <option value="metadata">metadata</option>
                <option value="auto">auto</option>
                <option value="none">none</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">View Type</label>
              <select
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={videoViewType}
                onChange={(e) => setVideoViewType(e.target.value as "video" | "audio")}
              >
                <option value="video">video</option>
                <option value="audio">audio</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Stream Type</label>
              <select
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={videoStreamType}
                onChange={(e) =>
                  setVideoStreamType(
                    e.target.value as "unknown" | "on-demand" | "live" | "live:dvr" | "ll-live" | "ll-live:dvr",
                  )
                }
              >
                <option value="on-demand">on-demand</option>
                <option value="live">live</option>
                <option value="live:dvr">live:dvr</option>
                <option value="ll-live">ll-live</option>
                <option value="ll-live:dvr">ll-live:dvr</option>
                <option value="unknown">unknown</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Log Level</label>
              <select
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={videoLogLevel}
                onChange={(e) => setVideoLogLevel(e.target.value as "silent" | "error" | "warn" | "info" | "debug")}
              >
                <option value="silent">silent</option>
                <option value="error">error</option>
                <option value="warn">warn</option>
                <option value="info">info</option>
                <option value="debug">debug</option>
              </select>
            </div>
          </div>
          <div className="grid gap-2 md:grid-cols-4">
            <label className="flex items-center gap-2 text-xs">
              <input
                type="checkbox"
                checked={videoControls}
                onChange={(e) => setVideoControls(e.target.checked)}
              />
              Show controls
            </label>
            <label className="flex items-center gap-2 text-xs">
              <input
                type="checkbox"
                checked={videoAutoplay}
                onChange={(e) => {
                  const checked = e.target.checked
                  setVideoAutoplay(checked)
                  if (checked) setVideoMuted(true)
                }}
              />
              Autoplay
            </label>
            <label className="flex items-center gap-2 text-xs">
              <input
                type="checkbox"
                checked={videoMuted}
                onChange={(e) => setVideoMuted(e.target.checked)}
              />
              Muted
            </label>
            <label className="flex items-center gap-2 text-xs">
              <input
                type="checkbox"
                checked={videoLoop}
                onChange={(e) => setVideoLoop(e.target.checked)}
              />
              Loop
            </label>
            <label className="flex items-center gap-2 text-xs">
              <input
                type="checkbox"
                checked={videoPlaysInline}
                onChange={(e) => setVideoPlaysInline(e.target.checked)}
              />
              Play inline on mobile
            </label>
            <label className="flex items-center gap-2 text-xs">
              <input
                type="checkbox"
                checked={videoCrossOrigin}
                onChange={(e) => setVideoCrossOrigin(e.target.checked)}
              />
              crossOrigin
            </label>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Text Tracks JSON (subtitles/chapters, optional)
            </label>
            <textarea
              value={videoTracksJson}
              onChange={(e) => setVideoTracksJson(e.target.value)}
              placeholder='[{"src":"videos/subs-en.vtt","label":"English","language":"en-US","kind":"subtitles","type":"vtt","default":true}]'
              className="min-h-[110px] w-full rounded-md border border-input bg-background px-3 py-2 text-xs"
            />
            {videoTracksError ? <p className="text-xs text-destructive">{videoTracksError}</p> : null}
          </div>
          <div className="flex items-center justify-end gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => {
                setShowVideoForm(false)
                setVideoUploadError(null)
                setPosterUploadError(null)
                setVideoTracksError(null)
                setVideoFormMode("insert")
                setEditingVideoPos(null)
              }}
            >
              Cancel
            </Button>
            <Button type="button" size="sm" onClick={insertVideo}>
              {videoFormMode === "edit" ? "Update Video" : "Insert Video"}
            </Button>
          </div>
        </div>
      )}
      <EditorContent editor={editor} />
      </>
      ) : mode === "source" ? (
        <div className="p-3 max-w-full overflow-hidden">
          <CodeMirror
            value={sourceEditorValue}
            extensions={[
              htmlLang(),
              SOURCE_EDITOR_THEME,
              ...(sourceWrapEnabled ? [EditorView.lineWrapping] : [SOURCE_EDITOR_NOWRAP_THEME]),
            ]}
            onChange={(value, viewUpdate) => {
              if (ignoreSourceInitChange && !viewUpdate.docChanged) {
                return
              }
              if (ignoreSourceInitChange) {
                setIgnoreSourceInitChange(false)
              }
              setSourceHtml(value)
              if (viewUpdate.docChanged) {
                setSourceDirty(true)
                onChange(value)
              }
            }}
            basicSetup={{
              lineNumbers: true,
              foldGutter: true,
              highlightActiveLine: true,
              highlightSelectionMatches: true,
            }}
            theme="light"
            height="520px"
            className="w-full max-w-full min-w-0 rounded-md border border-input bg-background text-foreground"
          />
          <div className="mt-2 flex items-center justify-end">
            <label className="inline-flex items-center gap-2 text-xs text-muted-foreground">
              <input
                type="checkbox"
                checked={sourceWrapEnabled}
                onChange={(event) => setSourceWrapEnabled(event.target.checked)}
              />
              Wrap lines
            </label>
          </div>
        </div>
      ) : (
        <div className="p-4 bg-background min-h-[300px]">
          <RichContentRenderer content={previewContentValue} className="prose prose-sm max-w-none" />
        </div>
      )}
    </div>
  )
}
