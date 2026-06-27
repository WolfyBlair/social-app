/**
 * Minimal helpers for working with Nostr public keys.
 *
 * Nostr identities are 32-byte secp256k1 public keys. They are shared in two
 * forms: a raw 64-character lowercase hex string, or the human-friendly
 * bech32-encoded `npub1...` form defined by NIP-19. We support both so a user
 * can paste whichever they have on hand.
 *
 * This intentionally implements just enough of bech32 to decode an `npub`. We
 * avoid pulling in a dependency for what is a small, well-specified algorithm.
 */

const BECH32_CHARSET = 'qpzry9x8gf2tvdw0s3jn54khce6mua7l'

/** The human-readable prefix for a Nostr public key in NIP-19 bech32 form. */
const NPUB_HRP = 'npub'

function bech32Polymod(values: number[]): number {
  const generators = [
    0x3b6a57b2, 0x26508e6d, 0x1ea119fa, 0x3d4233dd, 0x2a1462b3,
  ]
  let chk = 1
  for (const value of values) {
    const top = chk >> 25
    chk = ((chk & 0x1ffffff) << 5) ^ value
    for (let i = 0; i < 5; i++) {
      chk ^= (top >> i) & 1 ? generators[i] : 0
    }
  }
  return chk
}

function bech32HrpExpand(hrp: string): number[] {
  const high: number[] = []
  const low: number[] = []
  for (let i = 0; i < hrp.length; i++) {
    const c = hrp.charCodeAt(i)
    high.push(c >> 5)
    low.push(c & 31)
  }
  return [...high, 0, ...low]
}

function bech32VerifyChecksum(hrp: string, data: number[]): boolean {
  return bech32Polymod([...bech32HrpExpand(hrp), ...data]) === 1
}

/**
 * Decode a bech32 string into its human-readable prefix and 5-bit data words.
 * Returns null if the string is not valid bech32 (bad characters, mixed case,
 * missing separator, or a failed checksum).
 */
function bech32Decode(input: string): {hrp: string; words: number[]} | null {
  if (input.length < 8 || input.length > 90) return null
  // bech32 must be all lowercase or all uppercase, never mixed.
  if (input !== input.toLowerCase() && input !== input.toUpperCase()) {
    return null
  }
  const normalized = input.toLowerCase()
  const separator = normalized.lastIndexOf('1')
  if (separator < 1 || separator + 7 > normalized.length) return null

  const hrp = normalized.slice(0, separator)
  const words: number[] = []
  for (let i = separator + 1; i < normalized.length; i++) {
    const idx = BECH32_CHARSET.indexOf(normalized[i])
    if (idx === -1) return null
    words.push(idx)
  }
  if (!bech32VerifyChecksum(hrp, words)) return null
  // Drop the 6-word checksum, leaving just the payload.
  return {hrp, words: words.slice(0, -6)}
}

/**
 * Convert a list of `from`-bit groups into `to`-bit groups, as used to turn
 * bech32 5-bit words back into 8-bit bytes. Returns null on invalid padding.
 */
function convertBits(
  data: number[],
  from: number,
  to: number,
  pad: boolean,
): number[] | null {
  let acc = 0
  let bits = 0
  const result: number[] = []
  const maxv = (1 << to) - 1
  for (const value of data) {
    if (value < 0 || value >> from !== 0) return null
    acc = (acc << from) | value
    bits += from
    while (bits >= to) {
      bits -= to
      result.push((acc >> bits) & maxv)
    }
  }
  if (pad) {
    if (bits > 0) result.push((acc << (to - bits)) & maxv)
  } else if (bits >= from || ((acc << (to - bits)) & maxv) !== 0) {
    return null
  }
  return result
}

function bytesToHex(bytes: number[]): string {
  return bytes.map(b => b.toString(16).padStart(2, '0')).join('')
}

/** True if the value is a raw 32-byte (64 hex char) Nostr public key. */
export function isHexPubkey(value: string): boolean {
  return /^[0-9a-f]{64}$/.test(value.trim().toLowerCase())
}

/** True if the value is a bech32 `npub1...` Nostr public key. */
export function isNpub(value: string): boolean {
  return npubToHex(value) !== null
}

/**
 * Decode an `npub1...` bech32 string into its 64-character hex public key.
 * Returns null if the input is not a valid npub.
 */
export function npubToHex(value: string): string | null {
  const decoded = bech32Decode(value.trim())
  if (!decoded || decoded.hrp !== NPUB_HRP) return null
  const bytes = convertBits(decoded.words, 5, 8, false)
  if (!bytes || bytes.length !== 32) return null
  return bytesToHex(bytes)
}

/**
 * Validate either form of a Nostr public key and return its canonical hex
 * representation, or null if the input is not a valid key. Use this to
 * normalize user input before storing it.
 */
export function normalizeNostrPubkey(value: string): string | null {
  const trimmed = value.trim()
  if (!trimmed) return null
  if (isHexPubkey(trimmed)) return trimmed.toLowerCase()
  return npubToHex(trimmed)
}

/** True if the value is a usable Nostr public key in either supported form. */
export function isValidNostrPubkey(value: string): boolean {
  return normalizeNostrPubkey(value) !== null
}
