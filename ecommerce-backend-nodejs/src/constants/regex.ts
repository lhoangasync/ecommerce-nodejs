export const REGEX_USERNAME = /^(?![0-9]+$)[A-Za-z0-9_]{4,15}$/

export const REGEX_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

function escapeRegex(text: string) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')
}
