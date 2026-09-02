/**
 * Maps an image fit mode value to the corresponding CSS object-fit class.
 * Defaults to "object-cover" for backwards compatibility.
 */
export function getImageFitClass(mode?: string | null): string {
  switch (mode) {
    case "contain":
      return "object-contain"
    case "fill":
      return "object-fill"
    default:
      return "object-cover"
  }
}

/**
 * Maps an image fit mode value to the corresponding CSS background-size value.
 * Defaults to "cover" for backwards compatibility.
 */
export function getBackgroundSize(mode?: string | null): string {
  switch (mode) {
    case "contain":
      return "contain"
    case "fill":
      return "100% 100%"
    default:
      return "cover"
  }
}
