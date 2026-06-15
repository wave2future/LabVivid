// Local experiment notes persistence (FR-018, PRD §8.1 Basic Experiment Notes).
import type { Variables } from '../types/model';

export interface ExperimentNote {
  id: string;
  modelId: string;
  modelTitle: string;
  variables: Variables;
  timestamp: string;
  notes?: string;
}

const KEY = 'labvivid.notes.v1';

export function loadNotes(): ExperimentNote[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as ExperimentNote[]) : [];
  } catch {
    return [];
  }
}

function saveAll(notes: ExperimentNote[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(notes));
  } catch {
    /* storage may be unavailable (private mode); fail silently */
  }
}

export function addNote(note: Omit<ExperimentNote, 'id' | 'timestamp'>): ExperimentNote[] {
  const all = loadNotes();
  const full: ExperimentNote = {
    ...note,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    timestamp: new Date().toISOString(),
  };
  const next = [full, ...all].slice(0, 100);
  saveAll(next);
  return next;
}

export function deleteNote(id: string): ExperimentNote[] {
  const next = loadNotes().filter((n) => n.id !== id);
  saveAll(next);
  return next;
}

const LAST_KEY = 'labvivid.lastModel.v1';
export function setLastModel(modelId: string, vars: Variables): void {
  try {
    localStorage.setItem(LAST_KEY, JSON.stringify({ modelId, vars, at: Date.now() }));
  } catch {
    /* ignore */
  }
}
export function getLastModel(): { modelId: string; vars: Variables } | null {
  try {
    const raw = localStorage.getItem(LAST_KEY);
    if (!raw) return null;
    const o = JSON.parse(raw);
    if (o && o.modelId) return { modelId: o.modelId, vars: o.vars };
    return null;
  } catch {
    return null;
  }
}
