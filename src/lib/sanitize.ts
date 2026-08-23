import sanitizeHtml from "sanitize-html";

/**
 * Sanitizes CMS rich-text content before it is persisted.
 *
 * Single source of truth shared by the admin REST route (/api/admin/cms)
 * and the updateCMSContent server action so both mutation paths apply an
 * identical defense-in-depth policy (the UI predominantly uses the action).
 */
export function sanitizeCmsValue(value: string): string {
  return sanitizeHtml(String(value), {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat([
      "img",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "span",
    ]),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      "*": ["style", "class"],
      a: ["href", "target", "rel"],
      img: ["src", "alt", "width", "height"],
    },
  });
}
