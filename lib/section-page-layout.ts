const LEADING_PARAGRAPH_PATTERN = /^\s*<p(?:\s+[^>]*)?>([\s\S]*?)<\/p>/i
const TRAILING_PARAGRAPH_PATTERN = /<p(?:\s+[^>]*)?>([\s\S]*?)<\/p>\s*$/i
const LEADING_SECTION_PATTERN = /^(?:<div\b[^>]*>\s*)*<section\b/i
const TRAILING_SECTION_PATTERN = /<\/section>(?:\s*<\/div>)*\s*$/i

function isVisuallyEmptyParagraph(innerHtml: string) {
  const withoutLineBreaks = innerHtml.replace(/<br\s*\/?>/gi, "")
  const withoutInlineWrappers = withoutLineBreaks.replace(/<\/?(span|strong|em|u|b|i|small|mark|sup|sub)[^>]*>/gi, "")
  const withoutEntities = withoutInlineWrappers
    .replace(/&nbsp;|&#160;|&#xa0;|&#xA0;/gi, "")
    .replace(/&ZeroWidthSpace;|&#8203;|&#x200B;/gi, "")
  const withoutInvisibleChars = withoutEntities.replace(/[\u00A0\u200B\u200C\u200D\uFEFF]/g, "")
  const withoutWhitespace = withoutInvisibleChars.replace(/\s+/g, "")
  return withoutWhitespace.length === 0
}

function stripLeadingEmptyParagraphs(html: string) {
  let output = html
  while (true) {
    const match = output.match(LEADING_PARAGRAPH_PATTERN)
    if (!match) return output
    const full = match[0]
    const inner = match[1] || ""
    if (!isVisuallyEmptyParagraph(inner)) return output
    output = output.slice(full.length)
  }
}

function stripTrailingEmptyParagraphs(html: string) {
  let output = html
  while (true) {
    const match = output.match(TRAILING_PARAGRAPH_PATTERN)
    if (!match) return output
    const full = match[0]
    const inner = match[1] || ""
    if (!isVisuallyEmptyParagraph(inner)) return output
    output = output.slice(0, output.length - full.length)
  }
}

export function contentStartsWithSection(content: string | null | undefined) {
  const normalized = stripLeadingEmptyParagraphs(content || "").trimStart()
  return LEADING_SECTION_PATTERN.test(normalized)
}

export function contentEndsWithSection(content: string | null | undefined) {
  const normalized = stripTrailingEmptyParagraphs(content || "").trimEnd()
  return TRAILING_SECTION_PATTERN.test(normalized)
}
