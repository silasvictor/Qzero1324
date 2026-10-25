/**
 * Generates an 8-character formatted tracking code: e.g., "8XUI-Z123"
 */
export function generateTrackingCode(): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'; // Removed confusing 0, O, 1, I
  let part1 = '';
  let part2 = '';

  for (let i = 0; i < 4; i++) {
    part1 += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  for (let i = 0; i < 4; i++) {
    part2 += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return `${part1}-${part2}`;
}

export function isValidTrackingCode(code: string): boolean {
  return /^[A-Z0-9]{4}-[A-Z0-9]{4}$/i.test(code.trim());
}
