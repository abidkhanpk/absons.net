"use client"

import { useEffect, useRef, useState } from "react"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import { Node, mergeAttributes } from "@tiptap/core"
import Link from "@tiptap/extension-link"
import Image from "@tiptap/extension-image"
import { Table } from "@tiptap/extension-table"
import TableRow from "@tiptap/extension-table-row"
import TableCell from "@tiptap/extension-table-cell"
import TableHeader from "@tiptap/extension-table-header"
import TextAlign from "@tiptap/extension-text-align"
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
} from "lucide-react"

interface RichTextEditorProps {
  content: string
  onChange: (content: string) => void
}

const PRIMARY_BUTTON_CLASS =
  "inline-flex items-center gap-2 justify-center rounded-md bg-primary px-4 py-2 text-white no-underline hover:opacity-90"
const OUTLINE_BUTTON_CLASS = "inline-flex items-center gap-2 justify-center rounded-md border border-border bg-background px-4 py-2 no-underline"

const getButtonClass = (variant: "primary" | "outline") => (variant === "primary" ? PRIMARY_BUTTON_CLASS : OUTLINE_BUTTON_CLASS)

const CmsLink = Link.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      class: {
        default: "text-primary underline",
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

const CmsImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
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

export function RichTextEditor({ content, onChange }: RichTextEditorProps) {
  const [mode, setMode] = useState<"visual" | "source" | "preview">("visual")
  const [sourceHtml, setSourceHtml] = useState(content || "")
  const [showIconPicker, setShowIconPicker] = useState(false)
  const [iconSearch, setIconSearch] = useState("")
  const [selectedIconClass, setSelectedIconClass] = useState("")
  const [selectedKeywordToken, setSelectedKeywordToken] = useState(CONTENT_KEYWORD_OPTIONS[0]?.token ?? "{sitetitle}")
  const [pendingButtonVariant, setPendingButtonVariant] = useState<"primary" | "outline" | null>(null)
  const [pendingButtonLabel, setPendingButtonLabel] = useState("")
  const [pendingButtonHref, setPendingButtonHref] = useState("")
  const [faIcons, setFaIcons] = useState<Array<{ name: string; className: string }>>(fontAwesomeIcons)
  const [sourceSeed, setSourceSeed] = useState("")
  const [ignoreSourceInitChange, setIgnoreSourceInitChange] = useState(false)
  const [isCursorInTable, setIsCursorInTable] = useState(false)
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
    setPendingButtonVariant(null)
    setPendingButtonLabel("")
    setPendingButtonHref("")
    setShowVideoForm(false)
    setShowCardForm(false)
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
    setPendingButtonVariant(null)
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
          }
        },
      }),
      TableRow,
      TableHeader,
      TableCell,
      TextAlign.configure({
        types: ["heading", "paragraph", "tableHeader", "tableCell"],
      }),
      AccordionSummary,
      AccordionDetails,
      CmsCard,
      CmsVideo,
      CmsFaIcon,
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
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
    if (!editor) return
    const incoming = content || ""
    if (mode !== "source") {
      setSourceHtml(incoming)
    }
    if (incoming !== editor.getHTML()) {
      editor.commands.setContent(incoming, { emitUpdate: false })
    }
  }, [content, editor, mode])

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
  const filteredIcons = iconPool.filter((icon) => icon.name.includes(iconSearch.trim().toLowerCase()))
  const isLinkActive = editor.isActive("link")
  const activeLinkAttrs = (isLinkActive ? (editor.getAttributes("link") as Record<string, unknown>) : {}) as Record<string, unknown>
  const activeLinkIsButton =
    activeLinkAttrs["data-cms-button"] === true ||
    (typeof activeLinkAttrs["data-cms-button"] === "string" && activeLinkAttrs["data-cms-button"].toLowerCase() === "true")

  const getSelectedVideoAlign = (): "left" | "center" | "right" => {
    if (selectedVideoPos === null) return "left"
    const node = editor.state.doc.nodeAt(selectedVideoPos)
    if (!node || node.type.name !== "cmsVideo") return "left"
    const value = typeof node.attrs.align === "string" ? node.attrs.align.toLowerCase() : "left"
    if (value === "center" || value === "right") return value
    return "left"
  }

  const isAlignmentActive = (alignment: "left" | "center" | "right") => {
    if (selectedVideoPos !== null) {
      return getSelectedVideoAlign() === alignment
    }
    return editor.isActive({ textAlign: alignment })
  }

  const applyAlignment = (alignment: "left" | "center" | "right") => {
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

  const startInsertImageFlow = () => {
    setShowIconPicker(false)
    setPendingButtonVariant(null)
    setPendingButtonLabel("")
    setPendingButtonHref("")
    setShowVideoForm(false)
    setShowCardForm(false)
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

    const imageAttrs: { src: string; alt?: string; title?: string; width?: string; height?: string; linkHref?: string } = { src }
    const alt = imageAltText.trim()
    const title = imageTitleText.trim()
    const linkHref = imageLinkUrl.trim()
    if (alt) imageAttrs.alt = alt
    if (title) imageAttrs.title = title
    if (widthRaw) imageAttrs.width = widthRaw
    if (heightRaw) imageAttrs.height = heightRaw
    if (linkHref) imageAttrs.linkHref = linkHref

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
    setPendingButtonVariant(null)
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
      const raw = editor.getHTML() || content || ""
      const formatted = prettyFormatHtml(raw) || raw
      setSourceSeed(formatted)
      setSourceHtml(formatted)
      setIgnoreSourceInitChange(true)
    } else if (mode === "source") {
      const preserved = sourceHtml.trim().length > 0 ? sourceHtml : sourceSeed
      const resolvedHtml = preserved.trim().length > 0 ? preserved : editor.getHTML()
      editor.commands.setContent(resolvedHtml || "", { emitUpdate: false })
      onChange(resolvedHtml || "")
      setIgnoreSourceInitChange(false)
    }
    setMode(next)
  }

  const startInsertButtonFlow = (variant: "primary" | "outline") => {
    setShowVideoForm(false)
    setShowImageForm(false)
    setShowCardForm(false)
    const label = window.prompt("Button label", "Get Started")?.trim()
    if (!label) return
    const href = window.prompt("Button URL", "/contact")?.trim() || "/"
    setPendingButtonVariant(variant)
    setPendingButtonLabel(label)
    setPendingButtonHref(href)
    setIconSearch("")
    setSelectedIconClass("")
    setShowIconPicker(true)
  }

  const editSelectedButton = (variant: "primary" | "outline") => {
    if (!editor.isActive("link")) return
    const currentAttrs = editor.getAttributes("link") as Record<string, unknown>
    const isButton =
      currentAttrs["data-cms-button"] === true ||
      (typeof currentAttrs["data-cms-button"] === "string" && currentAttrs["data-cms-button"].toLowerCase() === "true")
    if (!isButton) return
    const currentHref = typeof currentAttrs.href === "string" ? currentAttrs.href : ""
    const entered = window.prompt("Button URL", currentHref)
    if (entered === null) return
    const nextHref = entered.trim()
    if (!nextHref) return
    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({
        ...currentAttrs,
        href: nextHref,
        class: getButtonClass(variant),
        "data-cms-button": "true",
      })
      .run()
  }

  const insertButtonWithIcon = () => {
    if (!pendingButtonVariant || !pendingButtonLabel) return
    const buttonLabel = pendingButtonLabel.trim() || "Button"
    const classes = getButtonClass(pendingButtonVariant)
    const iconMeta = iconPool.find((icon) => icon.className === selectedIconClass)
    const iconHtml = iconMeta
      ? `<span data-cms-fa="${iconMeta.className}" class="${iconMeta.className}" aria-hidden="true"></span>`
      : ""
    editor
      .chain()
      .focus()
      .insertContent(
        `<p><a href="${pendingButtonHref || "/"}" class="${classes}" data-cms-button="true">${iconHtml}<span>${buttonLabel}</span></a></p>`,
      )
      .run()
    setShowIconPicker(false)
    setPendingButtonVariant(null)
    setPendingButtonLabel("")
    setPendingButtonHref("")
  }

  const insertAccordion = () => {
    setShowIconPicker(false)
    setShowImageForm(false)
    setShowVideoForm(false)
    setShowCardForm(false)
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
    editor
      .chain()
      .focus()
      .insertContent(
        `<section class="py-8"><h2>Section heading</h2><p>Section content goes here.</p></section><p></p>`,
      )
      .run()
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
    editor.chain().focus().updateAttributes("table", { class: "cms-table cms-table-border-solid", borderStyle: "solid" }).run()
    editor.chain().focus().setTextAlign("center").run()
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
          const attrs = {
            ...node.attrs,
            class: `cms-table cms-table-border-${preset}`,
            borderStyle: preset,
            style: null,
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
          const attrs = {
            ...node.attrs,
            class: "cms-table cms-table-border-custom",
            borderStyle: "custom",
            style: `--cms-table-border-style:${safeStyle};--cms-table-border-width:${safeWidth}px;--cms-table-border-color:${color};`,
          }
          tr.setNodeMarkup(pos, undefined, attrs)
          if (dispatch) dispatch(tr)
          return true
        }
        return false
      })
      .run()
  }

  const prettyFormatHtml = (raw: string) => {
    const source = (raw || "").trim()
    if (!source) return ""
    try {
      const text = source
        .replace(/>\s*</g, ">\n<")
        .replace(/\n{2,}/g, "\n")
        .trim()
      const lines = text.split("\n")
      let indentLevel = 0
      const formatted: string[] = []
      const selfClosing = /<(area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr)\b/i

      for (const rawLine of lines) {
        const line = rawLine.trim()
        if (!line) continue

        if (/^<\//.test(line)) {
          indentLevel = Math.max(0, indentLevel - 1)
        }

        formatted.push(`${"  ".repeat(indentLevel)}${line}`)

        const opens = (line.match(/<[^/!][^>]*?>/g) || []).filter((tag) => !/\/>$/.test(tag) && !selfClosing.test(tag)).length
        const closes = (line.match(/<\/[^>]+>/g) || []).length
        if (!/^<\//.test(line)) {
          indentLevel = Math.max(0, indentLevel + opens - closes)
        } else {
          indentLevel = Math.max(0, indentLevel + opens - closes + 1)
        }
      }

      return formatted.join("\n").trim()
    } catch {
      return source
    }
  }

  return (
    <div className="border border-input rounded-md">
      <div className="flex items-center justify-between gap-2 p-2 border-b border-input bg-muted/30">
        <div className="flex items-center gap-1">
          <Button type="button" size="sm" variant={mode === "visual" ? "default" : "ghost"} onClick={() => switchModeAny("visual")}>
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
        <Button type="button" size="sm" variant="outline" onClick={() => startInsertButtonFlow("primary")}>
          <RectangleHorizontal className="h-4 w-4 mr-1" />
          Primary Button
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={() => startInsertButtonFlow("outline")}>
          <RectangleHorizontal className="h-4 w-4 mr-1" />
          Outline Button
        </Button>
        {activeLinkIsButton ? (
          <Button type="button" size="sm" variant="outline" onClick={() => editSelectedButton("primary")}>
            Edit Primary Button
          </Button>
        ) : null}
        {activeLinkIsButton ? (
          <Button type="button" size="sm" variant="outline" onClick={() => editSelectedButton("outline")}>
            Edit Outline Button
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
          <p className="text-sm font-medium">Step 3: Select Icon (optional)</p>
          <Input
            value={iconSearch}
            onChange={(e) => setIconSearch(e.target.value)}
            placeholder="Search Font Awesome icons (e.g. arrow-right, phone)"
          />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-h-56 overflow-auto">
            {filteredIcons.map((icon) => {
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
            <div className="flex items-center gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => {
                  setShowIconPicker(false)
                  setPendingButtonVariant(null)
                  setPendingButtonLabel("")
                  setPendingButtonHref("")
                }}
              >
                Cancel
              </Button>
              <Button type="button" size="sm" onClick={insertButtonWithIcon}>
                Insert Button
              </Button>
            </div>
          </div>
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
        <div className="p-3 max-w-full overflow-x-auto">
          <CodeMirror
            value={sourceHtml || sourceSeed || prettyFormatHtml(editor.getHTML())}
            extensions={[htmlLang()]}
            onChange={(value, viewUpdate) => {
              if (ignoreSourceInitChange && !viewUpdate.docChanged) {
                return
              }
              if (ignoreSourceInitChange && value.trim().length === 0 && sourceSeed.trim().length > 0) {
                return
              }
              if (ignoreSourceInitChange) {
                setIgnoreSourceInitChange(false)
              }
              setSourceHtml(value)
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
        </div>
      ) : (
        <div className="p-4 bg-background min-h-[300px]">
          <RichContentRenderer content={sourceHtml || editor.getHTML()} className="prose prose-sm max-w-none" />
        </div>
      )}
    </div>
  )
}
