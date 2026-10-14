const CIF_REGEX = /^([ABCDEFGHJNPQRSUVW])(\d{7})([0-9A-J])$/
const CONTROL_LETTERS = 'JABCDEFGHI'

/** Organisation types whose control character must be a letter / a digit. */
const LETTER_CONTROL = 'NPQRSW'
const DIGIT_CONTROL = 'ABEH'

export function computeCifControl(digits: string) {
  let sum = 0
  for (let i = 0; i < 7; i++) {
    const n = Number(digits[i])
    if (i % 2 === 0) {
      const doubled = n * 2
      sum += Math.floor(doubled / 10) + (doubled % 10)
    } else {
      sum += n
    }
  }
  const digit = (10 - (sum % 10)) % 10
  return { digit: String(digit), letter: CONTROL_LETTERS[digit] }
}

export function normalizeCif(value: string) {
  return value.replace(/[\s-]/g, '').toUpperCase()
}

export function isValidCif(value: string) {
  const match = CIF_REGEX.exec(normalizeCif(value))
  if (!match) return false
  const [, type, digits, control] = match
  const expected = computeCifControl(digits)
  if (LETTER_CONTROL.includes(type)) return control === expected.letter
  if (DIGIT_CONTROL.includes(type)) return control === expected.digit
  return control === expected.digit || control === expected.letter
}
