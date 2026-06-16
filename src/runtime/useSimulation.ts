// Shared simulation runtime: animation loop, play/pause/reset/step, canvas
// rendering, and throttled computed-state exposure to React
// (FR-005..009, NFR §11.1).
import { useEffect, useRef, useState, useCallback } from 'react';
import type { ModelDefinition, Variables, ComputeResult } from '../types/model';

interface UseSimulationOptions {
  model: ModelDefinition;
  vars: Variables;
  isDark: boolean;
}

interface SimulationApi {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  playing: boolean;
  time: number;
  computed: ComputeResult;
  play: () => void;
  pause: () => void;
  toggle: () => void;
  reset: () => void;
  step: () => void;
}

const STEP_SECONDS = 1 / 30;

export function useSimulation({ model, vars, isDark }: UseSimulationOptions): SimulationApi {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [playing, setPlaying] = useState(model.animated);
  const [time, setTime] = useState(0);
  const [computed, setComputed] = useState<ComputeResult>(() => model.compute(vars, 0));

  // Mutable refs read inside the rAF loop without re-subscribing.
  const timeRef = useRef(0);
  const playingRef = useRef(playing);
  const varsRef = useRef(vars);
  const modelRef = useRef(model);
  const darkRef = useRef(isDark);
  const lastComputeForReact = useRef(0);

  varsRef.current = vars;
  modelRef.current = model;
  darkRef.current = isDark;
  playingRef.current = playing;

  const renderFrame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    const w = Math.max(1, Math.floor(rect.width));
    const h = Math.max(1, Math.floor(rect.height));
    if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
      canvas.width = w * dpr;
      canvas.height = h * dpr;
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const result = modelRef.current.compute(varsRef.current, timeRef.current);
    modelRef.current.render({
      ctx,
      width: w,
      height: h,
      dpr,
      vars: varsRef.current,
      t: timeRef.current,
      computed: result,
      isDark: darkRef.current,
    });
    return result;
  }, []);

  // Main animation loop.
  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (playingRef.current && modelRef.current.animated) {
        const dur = modelRef.current.duration?.(varsRef.current) ?? 0;
        let nt = timeRef.current + dt;
        if (dur > 0 && nt > dur) nt = nt % dur; // loop the cycle
        timeRef.current = nt;
      }
      const result = renderFrame();
      // Push computed values to React ~15fps to keep panels live but cheap.
      if (result && now - lastComputeForReact.current > 66) {
        lastComputeForReact.current = now;
        setComputed(result);
        setTime(timeRef.current);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [renderFrame]);

  // Restart the clock and play state whenever the model changes, so switching
  // models (even if the host component is reused across navigation) behaves like
  // a fresh load and animated models start moving immediately.
  useEffect(() => {
    timeRef.current = 0;
    lastComputeForReact.current = 0;
    setTime(0);
    setPlaying(model.animated);
    setComputed(model.compute(varsRef.current, 0));
    renderFrame();
  }, [model, renderFrame]);

  // Recompute immediately when variables change (responsive feel, FR-006).
  // Compute directly so the data panel stays live even for models that render
  // through a custom view (e.g. 3D) and have no 2D canvas attached.
  useEffect(() => {
    setComputed(modelRef.current.compute(varsRef.current, timeRef.current));
    renderFrame();
  }, [vars, isDark, renderFrame]);

  const play = useCallback(() => setPlaying(true), []);
  const pause = useCallback(() => setPlaying(false), []);
  const toggle = useCallback(() => setPlaying((p) => !p), []);

  const reset = useCallback(() => {
    timeRef.current = 0;
    setTime(0);
    setPlaying(modelRef.current.animated);
    const result = renderFrame();
    if (result) setComputed(result);
  }, [renderFrame]);

  const step = useCallback(() => {
    setPlaying(false);
    const dur = modelRef.current.duration?.(varsRef.current) ?? 0;
    let nt = timeRef.current + STEP_SECONDS;
    if (dur > 0 && nt > dur) nt = nt % dur;
    timeRef.current = nt;
    setTime(nt);
    const result = renderFrame();
    if (result) setComputed(result);
  }, [renderFrame]);

  return { canvasRef, playing, time, computed, play, pause, toggle, reset, step };
}
