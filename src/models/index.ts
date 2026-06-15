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

export const models: ModelDefinition[] = [
  projectileMotion,
  functionTransform,
  ohmsLaw,
  titration,
  pendulum,
  springSHM,
  idealGas,
  population,
  derivative,
  fractions,
];

export function getModel(id: string): ModelDefinition | undefined {
  return models.find((m) => m.meta.id === id);
}
