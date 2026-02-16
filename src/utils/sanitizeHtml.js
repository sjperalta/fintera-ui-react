import DOMPurify from "dompurify";

/**
 * Sanitize HTML from Quill or other rich text editors to prevent XSS.
 * Use before rendering with dangerouslySetInnerHTML.
 * See CVE-2025-15056 / GHSA-v3m3-f69x-jf25 (Quill XSS in HTML export).
 */
const ALLOWED_TAGS = [
  "p", "br", "span", "div", "strong", "b", "em", "i", "u", "s", "a",
  "ul", "ol", "li", "img", "blockquote", "pre", "code", "h1", "h2", "h3",
];

const ALLOWED_ATTR = ["href", "src", "alt", "title", "class", "target", "rel"];

export function sanitizeHtml(html) {
  if (typeof html !== "string") return "";
  return DOMPurify.sanitize(html, { ALLOWED_TAGS, ALLOWED_ATTR });
}
