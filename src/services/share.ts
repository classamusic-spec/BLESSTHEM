/**
 * Share cards: a blessing becomes a quiet, beautiful image.
 * Only what the parent chooses is shared — never journal entries or notes.
 */

export type CardStyle = 'linen' | 'sage' | 'night';

export interface ShareCardInput {
  line: string; // “Today I’m praying courage over Noah.”
  verse: string;
  reference: string; // “Joshua 1:9 · BSB”
  style: CardStyle;
}

const W = 1080;
const H = 1350;

const PALETTES: Record<CardStyle, { bg: string; glowA: string; glowB: string; text: string; muted: string; accent: string; leafA: string; leafB: string; light: string }> = {
  linen: { bg: '#FAF7F1', glowA: 'rgba(240,205,140,0.55)', glowB: 'rgba(196,216,196,0.45)', text: '#23201C', muted: '#5C544A', accent: '#B8913F', leafA: '#3E5B47', leafB: '#6E8F76', light: '#C99A46' },
  sage: { bg: '#3B5845', glowA: 'rgba(240,208,150,0.30)', glowB: 'rgba(120,160,130,0.40)', text: '#F8F3EA', muted: '#D6E0D2', accent: '#E9C783', leafA: '#F6F0E4', leafB: '#CCDAC7', light: '#E9C783' },
  night: { bg: '#1B1815', glowA: 'rgba(214,170,96,0.22)', glowB: 'rgba(110,140,160,0.18)', text: '#F2ECE3', muted: '#BDB3A6', accent: '#D9B26E', leafA: '#AFC8AE', leafB: '#7F9F86', light: '#D4AE6A' },
};

const SERIF = '"Newsreader Variable", Newsreader, Georgia, serif';
const SANS = '"Figtree Variable", Figtree, system-ui, sans-serif';

function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = '';
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = w;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function drawMark(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, p: (typeof PALETTES)['linen']) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(size / 64, size / 64);
  ctx.fillStyle = p.light;
  ctx.beginPath();
  ctx.arc(32, 33, 6.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = p.leafA;
  ctx.fill(new Path2D('M30.8 56.6C16.2 55 7 43.4 9.4 26.6c.6-4.2 1.9-8.4 3.8-12.4 10 7.4 16.6 21 17.6 42.4Z'));
  ctx.fillStyle = p.leafB;
  ctx.fill(new Path2D('M33.2 56.6C47.8 55 57 43.4 54.6 26.6c-.6-4.2-1.9-8.4-3.8-12.4-10 7.4-16.6 21-17.6 42.4Z'));
  ctx.restore();
}

export async function renderShareCard(input: ShareCardInput): Promise<Blob> {
  if ('fonts' in document) {
    await Promise.all([
      document.fonts.load(`400 56px ${SERIF}`),
      document.fonts.load(`italic 400 40px ${SERIF}`),
      document.fonts.load(`600 28px ${SANS}`),
    ]).catch(() => undefined);
  }
  const p = PALETTES[input.style];
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;

  // Ground + window light
  ctx.fillStyle = p.bg;
  ctx.fillRect(0, 0, W, H);
  const g1 = ctx.createRadialGradient(W * 0.86, H * 0.04, 0, W * 0.86, H * 0.04, W * 0.95);
  g1.addColorStop(0, p.glowA);
  g1.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g1;
  ctx.fillRect(0, 0, W, H);
  const g2 = ctx.createRadialGradient(W * 0.06, H * 0.98, 0, W * 0.06, H * 0.98, W * 0.85);
  g2.addColorStop(0, p.glowB);
  g2.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g2;
  ctx.fillRect(0, 0, W, H);

  const left = 112;
  const maxWidth = W - left * 2;

  // The line about whom they are praying for
  ctx.fillStyle = p.muted;
  ctx.font = `italic 400 40px ${SERIF}`;
  ctx.textBaseline = 'alphabetic';
  const lineRows = wrap(ctx, input.line, maxWidth);
  let y = 210;
  for (const row of lineRows) {
    ctx.fillText(row, left, y);
    y += 54;
  }

  // Ornament
  y += 34;
  ctx.strokeStyle = p.accent;
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(left, y);
  ctx.lineTo(left + 64, y);
  ctx.stroke();
  y += 92;

  // Verse — sized to fit the space available
  const areaTop = y;
  const bottomLimit = H - 300;
  let size = 84;
  let rows: string[] = [];
  let lh = 0;
  for (; size >= 34; size -= 2) {
    ctx.font = `400 ${size}px ${SERIF}`;
    lh = size * 1.38;
    rows = wrap(ctx, `“${input.verse}”`, maxWidth);
    if (areaTop + rows.length * lh + 80 <= bottomLimit) break;
  }
  // Centre the verse and its reference in the space between the line and the signature.
  const blockHeight = rows.length * lh + 80;
  const top = areaTop + Math.max(0, (bottomLimit - areaTop - blockHeight) / 2);
  ctx.fillStyle = p.text;
  ctx.font = `400 ${size}px ${SERIF}`;
  rows.forEach((row, i) => ctx.fillText(row, left, top + i * lh));
  y = top + rows.length * lh + 26;

  // Reference
  ctx.fillStyle = p.accent;
  ctx.font = `600 28px ${SANS}`;
  ctx.letterSpacing = '4px';
  ctx.fillText(input.reference.toUpperCase(), left, y + 12);
  ctx.letterSpacing = '0px';

  // Signature: mark + wordmark, quiet
  const markSize = 56;
  drawMark(ctx, left - 6, H - 156, markSize, p);
  ctx.fillStyle = p.text;
  ctx.globalAlpha = 0.9;
  ctx.font = `450 38px ${SERIF}`;
  ctx.fillText('Bless Them', left + markSize + 8, H - 116);
  ctx.globalAlpha = 1;
  ctx.fillStyle = p.muted;
  ctx.font = `500 24px ${SANS}`;
  const tagline = 'Speak Scripture over the people you love';
  ctx.fillText(tagline, W - left - ctx.measureText(tagline).width, H - 116);

  return new Promise((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Could not create image'))), 'image/png'));
}

export type ShareOutcome = 'shared' | 'cancelled' | 'unsupported';

export async function shareImage(blob: Blob, text: string): Promise<ShareOutcome> {
  const file = new File([blob], 'bless-them-blessing.png', { type: 'image/png' });
  const nav = navigator as Navigator & { canShare?: (data: ShareData) => boolean };
  try {
    if (nav.canShare?.({ files: [file] })) {
      await navigator.share({ files: [file], text, title: 'A blessing' });
      return 'shared';
    }
    if (navigator.share) {
      await navigator.share({ text, title: 'A blessing' });
      return 'shared';
    }
  } catch (err) {
    if ((err as DOMException)?.name === 'AbortError') return 'cancelled';
  }
  return 'unsupported';
}

export function downloadBlob(blob: Blob, filename = 'bless-them-blessing.png') {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

export function channelLinks(text: string) {
  const body = encodeURIComponent(text);
  return {
    messages: `sms:?&body=${body}`,
    whatsapp: `https://wa.me/?text=${body}`,
    email: `mailto:?subject=${encodeURIComponent('A blessing for you')}&body=${body}`,
  };
}
