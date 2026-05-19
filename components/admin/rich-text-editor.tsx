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

export function RichTextEditor({ content, onChange }: RichTextEditorProps) {
  const [mode, setMode] = useState<"visual" | "source" | "preview">("visual")
  const [sourceHtml, setSourceHtml] = useState(content || "")
  const [showIconPicker, setShowIconPicker] = useState(false)
  const [iconSearch, setIconSearch] = useState("")
  const [selectedIconClass, setSelectedIconClass] = useState("")
  const [pendingButtonVariant, setPendingButtonVariant] = useState<"primary" | "outline" | null>(null)
  const [pendingButtonLabel, setPendingButtonLabel] = useState("")
  const [pendingButtonHref, setPendingButtonHref] = useState("")
  const [faIcons, setFaIcons] = useState<Array<{ name: string; className: string }>>(fontAwesomeIcons)
  const [sourceSeed, setSourceSeed] = useState("")
  const [ignoreSourceInitChange, setIgnoreSourceInitChange] = useState(false)
  const [isCursorInTable, setIsCursorInTable] = useState(false)
  const [showVideoForm, setShowVideoForm] = useState(false)
  const [videoUrl, setVideoUrl] = useState("")
  const [videoPoster, setVideoPoster] = useState("")
  const [videoTitle, setVideoTitle] = useState("")
  const [videoCaption, setVideoCaption] = useState("")
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
  const [videoTracksError, setVideoTracksError] = useState<string | null>(null)
  const [videoFormMode, setVideoFormMode] = useState<"insert" | "edit">("insert")
  const [selectedVideoPos, setSelectedVideoPos] = useState<number | null>(null)
  const [editingVideoPos, setEditingVideoPos] = useState<number | null>(null)
  const videoFileInputRef = useRef<HTMLInputElement | null>(null)
  const posterFileInputRef = useRef<HTMLInputElement | null>(null)
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
      Image.configure({
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
          "prose prose-sm max-w-none min-h-[300px] p-4 border border-input rounded-b-md focus:outline-none focus:ring-2 focus:ring-ring",
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

  const setLink = () => {
    const url = window.prompt("Enter URL")
    if (url) {
      editor.chain().focus().setLink({ href: url }).run()
    }
  }

  const addImage = () => {
    const url = window.prompt("Enter image URL")
    if (url) {
      editor.chain().focus().setImage({ src: url }).run()
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

  const insertButtonWithIcon = () => {
    if (!pendingButtonVariant || !pendingButtonLabel) return
    const buttonLabel = pendingButtonLabel.trim() || "Button"
    const classes =
      pendingButtonVariant === "primary"
        ? "inline-flex items-center gap-2 justify-center rounded-md bg-primary px-4 py-2 text-white no-underline hover:opacity-90"
        : "inline-flex items-center gap-2 justify-center rounded-md border border-border bg-background px-4 py-2 no-underline"
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
    const groupId = `cms-accordion-${Date.now()}`
    const countRaw = window.prompt("How many accordion items?", "1")?.trim() || "1"
    const count = Math.min(Math.max(Number.parseInt(countRaw || "1", 10) || 1, 1), 10)
    let html = ""

    for (let i = 0; i < count; i += 1) {
      const idx = i + 1
      const title = window.prompt(`Accordion title ${idx}`, `Accordion title ${idx}`)?.trim() || `Accordion title ${idx}`
      const body = window.prompt(`Accordion content ${idx}`, "Accordion content goes here.")?.trim() || "Accordion content goes here."
      html += `<details data-cms-accordion="true" name="${groupId}" class="rounded-md border border-border p-3"><summary data-cms-accordion-summary="true" class="cursor-pointer font-semibold">${title}</summary><p class="mt-2 text-muted-foreground">${body}</p></details>`
    }

    editor
      .chain()
      .focus()
      .insertContent(`${html}<p></p>`)
      .run()
  }

  const insertCard = () => {
    const title = window.prompt("Card title", "Card title")?.trim() || "Card title"
    const body = window.prompt("Card description", "Card description text.")?.trim() || "Card description text."
    editor
      .chain()
      .focus()
      .insertContent(`<article data-cms-card="true"><h3>${title}</h3><p>${body}</p></article><p></p>`)
      .run()
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
        <Button
          type="button"
          size="sm"
          variant={editor.isActive({ textAlign: "left" }) ? "default" : "ghost"}
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
        >
          <AlignLeft className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size="sm"
          variant={editor.isActive({ textAlign: "center" }) ? "default" : "ghost"}
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
        >
          <AlignCenter className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size="sm"
          variant={editor.isActive({ textAlign: "right" }) ? "default" : "ghost"}
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
        >
          <AlignRight className="h-4 w-4" />
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={addImage}>
          <ImageIcon className="h-4 w-4" />
        </Button>
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
        <Button type="button" size="sm" variant="outline" onClick={insertAccordion}>
          <Columns2 className="h-4 w-4 mr-1" />
          Accordion
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={insertCard}>
          <SquareStack className="h-4 w-4 mr-1" />
          Card
        </Button>
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
        <div className="p-3">
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
            minHeight="420px"
            className="w-full max-w-full rounded-md overflow-hidden border border-input bg-background text-foreground"
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
