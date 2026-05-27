export type HeadingTextStyle = "default" | "normal" | "bold" | "italic" | "bold-italic" | "underline"

export type HeadingLevelKey = "h1" | "h2" | "h3"

export type HeadingLevelStyle = {
  fontSize: string
  textStyle: HeadingTextStyle
  spaceBefore: string
  spaceAfter: string
}

export type HeadingTypographySettings = Record<HeadingLevelKey, HeadingLevelStyle>

export const HEADING_TEXT_STYLE_OPTIONS: Array<{ value: HeadingTextStyle; label: string }> = [
  { value: "default", label: "Default" },
  { value: "normal", label: "Normal" },
  { value: "bold", label: "Bold" },
  { value: "italic", label: "Italic" },
  { value: "bold-italic", label: "Bold + Italic" },
  { value: "underline", label: "Underline" },
]

export const DEFAULT_HEADING_TYPOGRAPHY: HeadingTypographySettings = {
  h1: {
    fontSize: "2rem",
    textStyle: "bold",
    spaceBefore: "1.5rem",
    spaceAfter: "0.5rem",
  },
  h2: {
    fontSize: "1.5rem",
    textStyle: "bold",
    spaceBefore: "1.5rem",
    spaceAfter: "0.5rem",
  },
  h3: {
    fontSize: "1.25rem",
    textStyle: "bold",
    spaceBefore: "1.5rem",
    spaceAfter: "0.5rem",
  },
}

const HEADING_SPACING_PRESETS: Record<string, string> = {
  none: "0px",
  minimum: "0.5rem",
  minimal: "0.5rem",
  moderate: "1.5rem",
  maximum: "3rem",
}

export function normalizeHeadingTextStyle(value: unknown): HeadingTextStyle {
  const normalized = typeof value === "string" ? value.trim().toLowerCase() : ""
  if (normalized === "normal") return "normal"
  if (normalized === "bold") return "bold"
  if (normalized === "italic") return "italic"
  if (normalized === "bold-italic") return "bold-italic"
  if (normalized === "underline") return "underline"
  return "default"
}

export function normalizeCssLength(value: unknown) {
  if (typeof value !== "string") return ""
  const raw = value.trim()
  if (!raw) return ""
  const preset = HEADING_SPACING_PRESETS[raw.toLowerCase()]
  if (preset) return preset
  if (/^\d+(\.\d+)?$/i.test(raw)) return `${raw}px`
  if (/^\d+(\.\d+)?em$/i.test(raw)) return raw.replace(/em$/i, "rem")
  if (/^\d+(\.\d+)?(px|rem|%)$/i.test(raw)) return raw
  return ""
}

function normalizeHeadingLevelStyle(value: unknown, fallback: HeadingLevelStyle): HeadingLevelStyle {
  const record = value && typeof value === "object" ? (value as Record<string, unknown>) : {}
  return {
    fontSize: normalizeCssLength(record.fontSize) || fallback.fontSize,
    textStyle: normalizeHeadingTextStyle(record.textStyle) || fallback.textStyle,
    spaceBefore: normalizeCssLength(record.spaceBefore) || fallback.spaceBefore,
    spaceAfter: normalizeCssLength(record.spaceAfter) || fallback.spaceAfter,
  }
}

export function normalizeHeadingTypography(value: unknown): HeadingTypographySettings {
  const record = value && typeof value === "object" ? (value as Record<string, unknown>) : {}
  return {
    h1: normalizeHeadingLevelStyle(record.h1, DEFAULT_HEADING_TYPOGRAPHY.h1),
    h2: normalizeHeadingLevelStyle(record.h2, DEFAULT_HEADING_TYPOGRAPHY.h2),
    h3: normalizeHeadingLevelStyle(record.h3, DEFAULT_HEADING_TYPOGRAPHY.h3),
  }
}

export function resolveHeadingTextStyleCss(textStyle: HeadingTextStyle) {
  if (textStyle === "normal") {
    return { fontStyle: "normal", fontWeight: "400", textDecoration: "none" }
  }
  if (textStyle === "bold") {
    return { fontStyle: "normal", fontWeight: "700", textDecoration: "none" }
  }
  if (textStyle === "italic") {
    return { fontStyle: "italic", fontWeight: "400", textDecoration: "none" }
  }
  if (textStyle === "bold-italic") {
    return { fontStyle: "italic", fontWeight: "700", textDecoration: "none" }
  }
  if (textStyle === "underline") {
    return { fontStyle: "normal", fontWeight: "700", textDecoration: "underline" }
  }
  return { fontStyle: "normal", fontWeight: "700", textDecoration: "none" }
}

export function headingTypographyToCssVariables(settings: HeadingTypographySettings) {
  const levels: HeadingLevelKey[] = ["h1", "h2", "h3"]
  const vars: Record<string, string> = {}
  for (const level of levels) {
    const levelSettings = settings[level]
    const style = resolveHeadingTextStyleCss(levelSettings.textStyle)
    vars[`--cms-${level}-font-size`] = levelSettings.fontSize
    vars[`--cms-${level}-font-style`] = style.fontStyle
    vars[`--cms-${level}-font-weight`] = style.fontWeight
    vars[`--cms-${level}-text-decoration`] = style.textDecoration
    vars[`--cms-${level}-space-before`] = levelSettings.spaceBefore
    vars[`--cms-${level}-space-after`] = levelSettings.spaceAfter
  }
  return vars
}
