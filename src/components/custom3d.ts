// Registry of models that use a custom interactive 3D view instead of the
// standard 2D canvas. ModelPage renders these in place of <Stage>.
// Lazy-loaded so Three.js is only fetched when a 3D model is opened.
import { lazy, type ComponentType } from 'react';
import type { Variables } from '../types/model';

export type Custom3DView = ComponentType<{ vars: Variables; isDark: boolean }>;

export const custom3D: Record<string, Custom3DView> = {
  'solar-system': lazy(() => import('./SolarSystem3D').then((m) => ({ default: m.SolarSystem3D }))),
  'black-hole': lazy(() => import('./BlackHole3D').then((m) => ({ default: m.BlackHole3D }))),
};
