// Interactive 3D Solar System (Three.js). Drag to rotate, scroll to zoom.
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import type { Variables } from '../types/model';
import { attachOrbitControls } from '../three/orbitControls';
import { useI18n } from '../i18n';

interface PlanetDef { a: number; color: number; size: number; }
const PLANETS: PlanetDef[] = [
  { a: 0.39, color: 0xa8a29e, size: 0.5 },
  { a: 0.72, color: 0xfbbf24, size: 0.8 },
  { a: 1.0, color: 0x60a5fa, size: 0.85 },
  { a: 1.52, color: 0xf87171, size: 0.6 },
  { a: 5.2, color: 0xfb923c, size: 1.7 },
  { a: 9.58, color: 0xfde68a, size: 1.5 },
  { a: 19.2, color: 0x5eead4, size: 1.2 },
  { a: 30.05, color: 0x818cf8, size: 1.2 },
];
const RK = 8; // radial scale (units per √AU)
const orbitR = (a: number) => Math.sqrt(a) * RK;

export function SolarSystem3D({ vars, isDark }: { vars: Variables; isDark: boolean }) {
  const mountRef = useRef<HTMLDivElement>(null);
  const varsRef = useRef(vars); varsRef.current = vars;
  const playingRef = useRef(true);
  const [playing, setPlaying] = useState(true);
  const elapsedRef = useRef(0);
  const resetRef = useRef(false);
  const { t } = useI18n();

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true });
    } catch {
      mount.innerHTML = '<div style="padding:24px;color:var(--text-2)">WebGL is not available.</div>';
      return;
    }
    const w = mount.clientWidth || 600, h = mount.clientHeight || 360;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(w, h);
    mount.appendChild(renderer.domElement);
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.touchAction = 'none';

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(isDark ? 0x05070f : 0x0b1020);
    const camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 2000);

    // starfield
    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(1200 * 3);
    for (let i = 0; i < 1200; i++) {
      const rr = 300 + Math.random() * 600;
      const th = Math.random() * Math.PI * 2, ph = Math.acos(2 * Math.random() - 1);
      starPos[i * 3] = rr * Math.sin(ph) * Math.cos(th);
      starPos[i * 3 + 1] = rr * Math.cos(ph);
      starPos[i * 3 + 2] = rr * Math.sin(ph) * Math.sin(th);
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0x9fb0c8, size: 1.2 })));

    // sun
    const sun = new THREE.Mesh(
      new THREE.SphereGeometry(2.6, 32, 32),
      new THREE.MeshBasicMaterial({ color: 0xffd27a })
    );
    scene.add(sun);
    const glow = new THREE.PointLight(0xffe9b0, 3, 0, 0.2);
    scene.add(glow);
    scene.add(new THREE.AmbientLight(0x9fb0c8, 0.5));

    // planets + orbit rings
    const planetMeshes: THREE.Mesh[] = [];
    const orbitRings: THREE.Line[] = [];
    PLANETS.forEach((pl) => {
      const m = new THREE.Mesh(
        new THREE.SphereGeometry(pl.size, 24, 24),
        new THREE.MeshStandardMaterial({ color: pl.color, roughness: 0.8, metalness: 0.1, emissive: pl.color, emissiveIntensity: 0.15 })
      );
      scene.add(m); planetMeshes.push(m);
      const R = orbitR(pl.a);
      const pts: THREE.Vector3[] = [];
      for (let i = 0; i <= 96; i++) { const a = (i / 96) * Math.PI * 2; pts.push(new THREE.Vector3(R * Math.cos(a), 0, R * Math.sin(a))); }
      const ring = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: 0x44506a }));
      scene.add(ring); orbitRings.push(ring);
    });
    // Saturn ring
    const saturnRing = new THREE.Mesh(
      new THREE.RingGeometry(2.0, 3.2, 40),
      new THREE.MeshBasicMaterial({ color: 0xd8c9a0, side: THREE.DoubleSide, transparent: true, opacity: 0.6 })
    );
    saturnRing.rotation.x = Math.PI / 2.3;
    planetMeshes[5].add(saturnRing);

    const controls = attachOrbitControls(renderer.domElement, { radius: 64, minRadius: 8, maxRadius: 200 });

    const ro = new ResizeObserver(() => {
      const ww = mount.clientWidth, hh = mount.clientHeight;
      if (ww && hh) { renderer.setSize(ww, hh); camera.aspect = ww / hh; camera.updateProjectionMatrix(); }
    });
    ro.observe(mount);

    let raf = 0; let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      if (resetRef.current) { elapsedRef.current = 0; resetRef.current = false; }
      const v = varsRef.current;
      const timeScale = (v.timeScale as number) ?? 1;
      const count = Math.round((v.planetCount as number) ?? 6);
      const showOrbits = (v.showLabels as boolean) ?? true;
      if (playingRef.current) elapsedRef.current += dt * timeScale;
      const years = elapsedRef.current;
      planetMeshes.forEach((m, i) => {
        const visible = i < count;
        m.visible = visible; orbitRings[i].visible = visible && showOrbits;
        if (!visible) return;
        const R = orbitR(PLANETS[i].a);
        const ang = (2 * Math.PI * years) / Math.pow(PLANETS[i].a, 1.5);
        m.position.set(R * Math.cos(ang), 0, R * Math.sin(ang));
        m.rotation.y += 0.01;
      });
      controls.update(camera);
      renderer.render(scene, camera);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf); ro.disconnect(); controls.dispose();
      renderer.dispose(); mount.removeChild(renderer.domElement);
    };
  }, [isDark]);

  return (
    <div className="three-stage">
      <div ref={mountRef} className="three-mount" />
      <div className="three-overlay">
        <button className="btn primary" onClick={() => { playingRef.current = !playingRef.current; setPlaying(playingRef.current); }}>
          {playing ? `⏸ ${t('ctrl.pause')}` : `▶ ${t('ctrl.play')}`}
        </button>
        <button className="btn" onClick={() => { resetRef.current = true; }}>↺ {t('ctrl.reset')}</button>
        <span className="three-hint">{t('three.hint')}</span>
      </div>
    </div>
  );
}
