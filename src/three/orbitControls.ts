// Minimal mouse/touch orbit controls (no three.js addon needed).
// Drag to rotate around the target, scroll/pinch to zoom.
import * as THREE from 'three';

export interface OrbitControls {
  update: (camera: THREE.PerspectiveCamera) => void;
  dispose: () => void;
}

export function attachOrbitControls(
  el: HTMLElement,
  opts: { radius?: number; minRadius?: number; maxRadius?: number; target?: THREE.Vector3 } = {}
): OrbitControls {
  let radius = opts.radius ?? 30;
  const minR = opts.minRadius ?? 5;
  const maxR = opts.maxRadius ?? 200;
  const target = opts.target ?? new THREE.Vector3(0, 0, 0);
  let theta = Math.PI * 0.25; // azimuth
  let phi = Math.PI * 0.32;   // polar from +Y
  let dragging = false;
  let lastX = 0, lastY = 0;
  let pinchDist = 0;

  const clampPhi = () => { phi = Math.max(0.12, Math.min(Math.PI - 0.12, phi)); };

  const onDown = (x: number, y: number) => { dragging = true; lastX = x; lastY = y; };
  const onMove = (x: number, y: number) => {
    if (!dragging) return;
    theta -= (x - lastX) * 0.01;
    phi -= (y - lastY) * 0.01;
    clampPhi();
    lastX = x; lastY = y;
  };
  const onUp = () => { dragging = false; };

  const md = (e: MouseEvent) => { e.preventDefault(); onDown(e.clientX, e.clientY); };
  const mm = (e: MouseEvent) => onMove(e.clientX, e.clientY);
  const mu = () => onUp();
  const wheel = (e: WheelEvent) => {
    e.preventDefault();
    radius = Math.max(minR, Math.min(maxR, radius * (1 + Math.sign(e.deltaY) * 0.1)));
  };
  const ts = (e: TouchEvent) => {
    if (e.touches.length === 1) onDown(e.touches[0].clientX, e.touches[0].clientY);
    else if (e.touches.length === 2) {
      pinchDist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
    }
  };
  const tm = (e: TouchEvent) => {
    if (e.touches.length === 1) { onMove(e.touches[0].clientX, e.touches[0].clientY); }
    else if (e.touches.length === 2) {
      const d = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
      if (pinchDist) radius = Math.max(minR, Math.min(maxR, radius * (pinchDist / d)));
      pinchDist = d;
    }
    e.preventDefault();
  };
  const te = () => { onUp(); pinchDist = 0; };

  el.addEventListener('mousedown', md);
  window.addEventListener('mousemove', mm);
  window.addEventListener('mouseup', mu);
  el.addEventListener('wheel', wheel, { passive: false });
  el.addEventListener('touchstart', ts, { passive: false });
  el.addEventListener('touchmove', tm, { passive: false });
  window.addEventListener('touchend', te);

  return {
    update(camera) {
      const sinPhi = Math.sin(phi);
      camera.position.set(
        target.x + radius * sinPhi * Math.sin(theta),
        target.y + radius * Math.cos(phi),
        target.z + radius * sinPhi * Math.cos(theta)
      );
      camera.lookAt(target);
    },
    dispose() {
      el.removeEventListener('mousedown', md);
      window.removeEventListener('mousemove', mm);
      window.removeEventListener('mouseup', mu);
      el.removeEventListener('wheel', wheel);
      el.removeEventListener('touchstart', ts);
      el.removeEventListener('touchmove', tm);
      window.removeEventListener('touchend', te);
    },
  };
}
