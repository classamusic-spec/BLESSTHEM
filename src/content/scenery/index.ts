import { SCENES, type Scene, type SceneCredit, type SceneId } from './scenes';

/**
 * Scenery: real nature photography, hand-picked and credited (public domain, CC0 or
 * CC BY). Images live in /public/scenery as AVIF with WebP fallbacks; each scene also
 * carries a tiny blurred placeholder so something beautiful shows instantly, even offline.
 */

export { SCENES };
export type { Scene, SceneCredit, SceneId };

export type ImageFormat = 'avif' | 'webp';

/** The scene behind each part of the day — the app’s sky follows the clock. */
export const DAYPART_SCENE: Record<'morning' | 'day' | 'evening' | 'night', SceneId> = {
  morning: 'meadow-dawn',
  day: 'wildflower-meadow',
  evening: 'golden-grass',
  night: 'crescent-moon',
};

/** Calm, wide places for people’s pages (they crop to a short band). Each person keeps theirs. */
const PERSON_SCENES: SceneId[] = [
  'lake-sunrise',
  'spring-blossoms',
  'wildflower-hillside',
  'golden-trees',
  'meadow-dawn',
  'misty-hayfield',
  'forest-river',
  'lake-dock',
];

export function sceneForPerson(personId: string): SceneId {
  let hash = 0;
  for (const ch of personId) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return PERSON_SCENES[hash % PERSON_SCENES.length];
}

export function sceneUrl(id: SceneId, width: number, format: ImageFormat = 'webp'): string {
  return `/scenery/${id}-${width}.${format}`;
}

export function sceneSrcSet(id: SceneId, format: ImageFormat): string {
  return SCENES[id].widths.map((w) => `${sceneUrl(id, w, format)} ${w}w`).join(', ');
}

/** The smallest available width that still covers `cssWidth` at this screen density. */
export function sceneWidthFor(id: SceneId, cssWidth: number, dpr = 2): number {
  const widths = SCENES[id].widths;
  return widths.find((w) => w >= cssWidth * dpr) ?? widths[widths.length - 1];
}

/** Every photograph in the app, for the credits page. */
export const PHOTO_CREDITS = Object.values(SCENES).map((s) => ({ id: s.id, description: s.description, ...s.credit }));
