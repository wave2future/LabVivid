// Registry of models that use a custom view (interactive 3D or an embedded
// self-contained page) instead of the standard 2D canvas. ModelPage renders
// these in place of <Stage>.
import { lazy, type ComponentType } from 'react';
import type { Variables } from '../types/model';
import { embedView } from './EmbedView';

export type Custom3DView = ComponentType<{ vars: Variables; isDark: boolean }>;

export const custom3D: Record<string, Custom3DView> = {
  // Three.js scene, code-split so three is only fetched when opened.
  'solar-system': lazy(() => import('./SolarSystem3D').then((m) => ({ default: m.SolarSystem3D }))),
  // Embedded self-contained pages.
  'black-hole': embedView('blackhole.html', 'Black Hole'),
  'periodic-table': embedView('periodic-table.html', 'Periodic Table'),
  'mandelbrot-set': embedView('mandelbrot.html', 'Mandelbrot Set', true),
  'lorenz-attractor': embedView('lorenz.html', 'Lorenz Attractor', true),
  'wormhole': embedView('wormhole.html', 'Wormhole', true),
};
