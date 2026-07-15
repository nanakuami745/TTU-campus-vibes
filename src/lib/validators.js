// Accepts two formats used for TTU student index numbers:
//   1. Slash format:  BC/HPM/202/23   (letters/letters/digits/digits)
//   2. Numeric format: 0723000012    (digits only, 8-12 long)
const SLASH_FORMAT = /^[A-Z]{2,4}\/[A-Z]{2,4}\/\d{2,4}\/\d{2,4}$/
const NUMERIC_FORMAT = /^\d{8,12}$/

export function isValidIndexNumber(value) {
    if (!value) return false
    const trimmed = value.trim().toUpperCase()
    return SLASH_FORMAT.test(trimmed) || NUMERIC_FORMAT.test(trimmed)
}

// Normalizes to uppercase for the slash format; numeric format is left as-is.
export function normalizeIndexNumber(value) {
    return value.trim().toUpperCase()
}
