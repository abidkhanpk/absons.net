"use client"

import { useEffect, useState } from "react"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import { Node, mergeAttributes } from "@tiptap/core"
import Link from "@tiptap/extension-link"
import Image from "@tiptap/extension-image"
import fontAwesomeIcons from "@/lib/font-awesome-free-icons.json"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
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
      AccordionSummary,
      AccordionDetails,
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
    setSourceHtml(incoming)
    if (incoming !== editor.getHTML()) {
      editor.commands.setContent(incoming, { emitUpdate: false })
    }
  }, [content, editor])

  useEffect(() => {
    if (faIcons.length === 0) setFaIcons(fontAwesomeIcons)
  }, [faIcons.length])

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

  const switchMode = (next: "visual" | "source") => {
    if (next === mode) return
    if (next === "source") {
      setSourceHtml(prettyFormatHtml(editor.getHTML()))
    } else if (next === "visual") {
      editor.commands.setContent(sourceHtml || "", { emitUpdate: false })
      onChange(sourceHtml || "")
    }
    setMode(next)
  }

  const switchModeAny = (next: "visual" | "source" | "preview") => {
    if (next === mode) return
    if (next === "source") {
      setSourceHtml(prettyFormatHtml(editor.getHTML()))
    } else if (next === "visual") {
      editor.commands.setContent(sourceHtml || "", { emitUpdate: false })
      onChange(sourceHtml || "")
    }
    setMode(next)
  }

  const startInsertButtonFlow = (variant: "primary" | "outline") => {
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
    editor
      .chain()
      .focus()
      .insertContent(
        `<details data-cms-accordion="true" name="${groupId}" class="rounded-md border border-border p-3"><summary data-cms-accordion-summary="true" class="cursor-pointer font-semibold">Accordion title 1</summary><p class="mt-2 text-muted-foreground">Accordion content goes here.</p></details><details data-cms-accordion="true" name="${groupId}" class="rounded-md border border-border p-3"><summary data-cms-accordion-summary="true" class="cursor-pointer font-semibold">Accordion title 2</summary><p class="mt-2 text-muted-foreground">Accordion content goes here.</p></details><details data-cms-accordion="true" name="${groupId}" class="rounded-md border border-border p-3"><summary data-cms-accordion-summary="true" class="cursor-pointer font-semibold">Accordion title 3</summary><p class="mt-2 text-muted-foreground">Accordion content goes here.</p></details><p></p>`,
      )
      .run()
  }

  const insertCard = () => {
    editor
      .chain()
      .focus()
      .insertContent(
        `<div class="rounded-xl border border-border bg-card p-5"><h3>Card title</h3><p>Card description text.</p></div><p></p>`,
      )
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

  const prettyFormatHtml = (raw: string) => {
    const source = (raw || "").trim()
    if (!source) return ""
    try {
      const parser = new DOMParser()
      const doc = parser.parseFromString(source, "text/html")
      const root = doc.body
      const isInlineOnly = (el: Element) =>
        ["a", "span", "strong", "em", "code", "small", "mark"].includes(el.tagName.toLowerCase())

      const formatNode = (node: ChildNode, depth: number): string => {
        const indent = "  ".repeat(depth)
        if (node.nodeType === Node.TEXT_NODE) {
          const text = (node.textContent || "").replace(/\s+/g, " ").trim()
          return text ? `${indent}${text}\n` : ""
        }
        if (node.nodeType !== Node.ELEMENT_NODE) return ""
        const el = node as Element
        const tag = el.tagName.toLowerCase()
        const attrs = Array.from(el.attributes)
          .map((a) => `${a.name}="${a.value}"`)
          .join(" ")
        const open = attrs ? `<${tag} ${attrs}>` : `<${tag}>`
        const children = Array.from(el.childNodes)
        if (!children.length) {
          return `${indent}${open}</${tag}>\n`
        }
        if (isInlineOnly(el) && children.every((c) => c.nodeType === Node.TEXT_NODE)) {
          const inlineText = children.map((c) => (c.textContent || "").replace(/\s+/g, " ").trim()).join(" ")
          return `${indent}${open}${inlineText}</${tag}>\n`
        }
        return `${indent}${open}\n${children.map((c) => formatNode(c, depth + 1)).join("")}${indent}</${tag}>\n`
      }

      return Array.from(root.childNodes)
        .map((node) => formatNode(node, 0))
        .join("")
        .trim()
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
      </div>
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
      <EditorContent editor={editor} />
      </>
      ) : mode === "source" ? (
        <div className="p-3">
          <Textarea
            value={sourceHtml}
            onChange={(e) => {
              const value = e.target.value
              setSourceHtml(value)
              onChange(value)
            }}
            rows={18}
            className="font-mono text-sm"
            placeholder="<section><h2>Heading</h2><p>Write HTML here...</p></section>"
          />
        </div>
      ) : (
        <div className="p-4 bg-background min-h-[300px]">
          <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: sourceHtml || editor.getHTML() }} />
        </div>
      )}
    </div>
  )
}
