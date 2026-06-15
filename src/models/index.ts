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
import { equilibrium } from './equilibrium';
import { beerLambert } from './beerLambert';
import { radioactiveDecay } from './radioactiveDecay';
import { periodicTable } from './periodicTable';
import { predatorPrey } from './predatorPrey';
import { genetics } from './genetics';
import { enzymeKinetics } from './enzymeKinetics';
import { circularMotion } from './circularMotion';
import { standingWave } from './standingWave';
import { coulomb } from './coulomb';
import { freeFall } from './freeFall';
import { buoyancy } from './buoyancy';
import { doppler } from './doppler';
import { lever } from './lever';
import { energyConservation } from './energyConservation';
import { resistors } from './resistors';
import { magneticForce } from './magneticForce';
import { hydraulicPress } from './hydraulicPress';
import { orbit } from './orbit';
import { rcCircuit } from './rcCircuit';
import { friction } from './friction';
import { heatingCurve } from './heatingCurve';
import { solarSystem } from './solarSystem';
import { blackHole } from './blackHole';
import { unitCircle } from './unitCircle';
import { quadratic } from './quadratic';
import { vectorAddition } from './vectorAddition';
import { exponential } from './exponential';
import { linearFunction } from './linearFunction';
import { normalDistribution } from './normalDistribution';

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
  circularMotion,
  standingWave,
  coulomb,
  freeFall,
  buoyancy,
  doppler,
  lever,
  energyConservation,
  resistors,
  magneticForce,
  hydraulicPress,
  orbit,
  rcCircuit,
  friction,
  heatingCurve,
  solarSystem,
  blackHole,
  idealGas,
  population,
  predatorPrey,
  genetics,
  enzymeKinetics,
  derivative,
  fractions,
  unitCircle,
  quadratic,
  vectorAddition,
  exponential,
  linearFunction,
  normalDistribution,
  phScale,
  reactionRate,
  equilibrium,
  beerLambert,
  radioactiveDecay,
  periodicTable,
];

export function getModel(id: string): ModelDefinition | undefined {
  return models.find((m) => m.meta.id === id);
}
