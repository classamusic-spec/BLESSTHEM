/// <reference types="vitest/config" />
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { fileURLToPath } from 'node:url';

interface Node {
  type: string;
  start: number;
  end: number;
  [key: string]: unknown;
}

function walk(node: unknown, visit: (n: Node) => void) {
  if (!node || typeof node !== 'object') return;
  if (Array.isArray(node)) return node.forEach((child) => walk(child, visit));
  if (typeof (node as Node).type === 'string') visit(node as Node);
  for (const value of Object.values(node)) if (value && typeof value === 'object') walk(value, visit);
}

/** Replaces each node's source with `rewrite(node)`. Nodes must not overlap. */
function rewriteNodes(code: string, nodes: Node[], rewrite: (n: Node) => string) {
  let out = code;
  for (const n of [...nodes].sort((a, b) => b.start - a.start)) out = out.slice(0, n.start) + rewrite(n) + out.slice(n.end);
  return out;
}

const keyName = (n: Node) => {
  const key = n.key as Node & { name?: string; value?: unknown };
  return key?.type === 'Identifier' ? key.name : key?.value;
};

/**
 * Production-only trims that keep the download small without touching what people see:
 *  - curated entries keep reviewer `notes` in source, but they are never shipped;
 *  - Phosphor icons ship six weights each; the thin and light weights are never used.
 */
function trimBundle(): Plugin {
  const DROP_WEIGHTS = new Set(['thin', 'light']);
  return {
    name: 'bless-them:trim-bundle',
    apply: 'build',
    enforce: 'post',
    transform(code, id) {
      if (/[\\/]src[\\/]content[\\/]blessings[\\/](?!index\.)[^\\/]+\.ts$/.test(id)) {
        const objects: Node[] = [];
        walk(this.parse(code), (n) => {
          if (n.type === 'ObjectExpression' && (n.properties as Node[]).some((p) => keyName(p) === 'notes')) objects.push(n);
        });
        const kept = (o: Node) => (o.properties as Node[]).filter((p) => keyName(p) !== 'notes');
        return { code: rewriteNodes(code, objects, (o) => `{${kept(o).map((p) => code.slice(p.start, p.end)).join(',')}}`), map: null };
      }
      if (/[\\/]@phosphor-icons[\\/]react[\\/]dist[\\/]defs[\\/]/.test(id)) {
        const arrays: Node[] = [];
        walk(this.parse(code), (n) => {
          if (n.type !== 'NewExpression' || (n.callee as Node & { name?: string }).name !== 'Map') return;
          const list = (n.arguments as Node[])[0];
          if (list?.type === 'ArrayExpression') arrays.push(list);
        });
        const weight = (pair: Node) => ((pair.elements as Node[])?.[0] as Node & { value?: unknown })?.value as string;
        return {
          code: rewriteNodes(code, arrays, (a) => `[${(a.elements as Node[]).filter((p) => !DROP_WEIGHTS.has(weight(p))).map((p) => code.slice(p.start, p.end)).join(',')}]`),
          map: null,
        };
      }
      return null;
    },
  };
}

export default defineConfig({
  plugins: [
    react(),
    trimBundle(),
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.ts',
      injectRegister: false,
      registerType: 'autoUpdate',
      manifest: false,
      injectManifest: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2,webmanifest}'],
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
      },
      devOptions: { enabled: false },
    }),
  ],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  server: { host: true, port: 5173 },
  preview: { host: true, port: 4173 },
  build: {
    target: 'es2022',
    cssMinify: true,
    sourcemap: false,
    // The app shell, libraries and content change at different rates. Separate chunks let a
    // content update reach people without re-downloading React or the icon set.
    chunkSizeWarningLimit: 700,
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            { name: 'react', test: /node_modules[\\/](react|react-dom|react-router|scheduler)[\\/]/, priority: 30 },
            { name: 'motion', test: /node_modules[\\/](motion|motion-dom|motion-utils|framer-motion)[\\/]/, priority: 30 },
            { name: 'icons', test: /node_modules[\\/]@phosphor-icons[\\/]/, priority: 30 },
            { name: 'vendor', test: /node_modules[\\/]/, priority: 20 },
            { name: 'content', test: /src[\\/]content[\\/](blessings|taxonomy|journeys)/, priority: 10 },
          ],
        },
      },
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    css: { modules: { classNameStrategy: 'non-scoped' } },
  },
});
