import {
  isHexPubkey,
  isNpub,
  isValidNostrPubkey,
  normalizeNostrPubkey,
  npubToHex,
} from '#/lib/nostr'

/*
 * Reference vector from NIP-19. The npub and its decoded hex public key are
 * fixed by the spec, so they make a stable round-trip test.
 */
const NPUB = 'npub180cvv07tjdrrgpa0j7j7tmnyl2yr6yr7l8j4s3evf6u64th6gkwsyjh6w6'
const HEX = '3bf0c63fcb93463407af97a5e5ee64fa883d107ef9e558472c4eb9aaaefa459d'

describe('nostr', () => {
  describe('isHexPubkey', () => {
    it('accepts a 64-char hex key', () => {
      expect(isHexPubkey(HEX)).toBe(true)
    })
    it('is case-insensitive and trims', () => {
      expect(isHexPubkey(`  ${HEX.toUpperCase()}  `)).toBe(true)
    })
    it('rejects wrong length', () => {
      expect(isHexPubkey(HEX.slice(0, 63))).toBe(false)
      expect(isHexPubkey(HEX + 'ab')).toBe(false)
    })
    it('rejects non-hex characters', () => {
      expect(isHexPubkey('g'.repeat(64))).toBe(false)
    })
  })

  describe('npubToHex', () => {
    it('decodes a valid npub to its hex key', () => {
      expect(npubToHex(NPUB)).toBe(HEX)
    })
    it('trims surrounding whitespace', () => {
      expect(npubToHex(`  ${NPUB}  `)).toBe(HEX)
    })
    it('rejects a npub with a corrupted checksum', () => {
      const broken = NPUB.slice(0, -1) + (NPUB.endsWith('6') ? '7' : '6')
      expect(npubToHex(broken)).toBeNull()
    })
    it('rejects the wrong prefix (nsec, note, etc.)', () => {
      expect(npubToHex('nsec1' + NPUB.slice(5))).toBeNull()
    })
    it('rejects plain hex', () => {
      expect(npubToHex(HEX)).toBeNull()
    })
  })

  describe('isNpub', () => {
    it('is true for a valid npub and false otherwise', () => {
      expect(isNpub(NPUB)).toBe(true)
      expect(isNpub(HEX)).toBe(false)
      expect(isNpub('not-a-key')).toBe(false)
    })
  })

  describe('normalizeNostrPubkey', () => {
    it('returns canonical hex for an npub', () => {
      expect(normalizeNostrPubkey(NPUB)).toBe(HEX)
    })
    it('returns lowercased hex for a hex key', () => {
      expect(normalizeNostrPubkey(HEX.toUpperCase())).toBe(HEX)
    })
    it('returns null for empty or invalid input', () => {
      expect(normalizeNostrPubkey('')).toBeNull()
      expect(normalizeNostrPubkey('   ')).toBeNull()
      expect(normalizeNostrPubkey('garbage')).toBeNull()
    })
  })

  describe('isValidNostrPubkey', () => {
    it('accepts both supported forms', () => {
      expect(isValidNostrPubkey(NPUB)).toBe(true)
      expect(isValidNostrPubkey(HEX)).toBe(true)
    })
    it('rejects invalid input', () => {
      expect(isValidNostrPubkey('nope')).toBe(false)
    })
  })
})
