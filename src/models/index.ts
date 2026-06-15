// Model registry — the single source of truth for available models (PRD §10.1).
import type { ModelDefinition } from '../types/model';
import { projectileMotion } from './projectileMotion';
import { ohmsLaw } from './ohmsLaw';
import { titration } from './titration';
import { functionTransform } from './functionTransform';
import { pendulum } from './pendulum';
import { springSHM } from './springSHM';
import { idealGas } from './idealGas';
import { population } from './population';
import { derivative } from './derivative';
import { fractions } from './fractions';
import { inclinedPlane } from './inclinedPlane';
import { wave } from './wave';
import { lens } from './lens';
import { collisions } from './collisions';
import { refraction } from './refraction';
import { phScale } from './phScale';
import { reactionRate } from './reactionRate';

export const models: ModelDefinition[] = [
  projectileMotion,
  functionTransform,
  ohmsLaw,
  titration,
  pendulum,
  springSHM,
  inclinedPlane,
  wave,
  lens,
  collisions,
  refraction,
  idealGas,
  population,
  derivative,
  fractions,
  phScale,
  reactionRate,
];

export function getModel(id: string): ModelDefinition | undefined {
  return models.find((m) => m.meta.id === id);
}
