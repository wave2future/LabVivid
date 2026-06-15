// Interactive 3D Black Hole (Three.js): event horizon, photon sphere,
// and a differentially-rotating accretion disk. Drag to rotate, scroll to zoom.
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import type { Variables } from '../types/model';
import { attachOrbitControls } from '../three/orbitControls';
import { useI18n } from '../i18n';

const N = 2600;
const INNER = 1.6, OUTER = 7; // in units of Rs

export function BlackHole3D({ vars }: { vars: Variables; isDark: boolean }) {
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
    scene.background = new THREE.Color(0x03040a);

    const camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 2000);

    // stars
    const starGeo = new THREE.BufferGeometry();
    const sp = new Float32Array(900 * 3);
    for (let i = 0; i < 900; i++) {
      const rr = 200 + Math.random() * 500, th = Math.random() * Math.PI * 2, ph = Math.acos(2 * Math.random() - 1);
      sp[i * 3] = rr * Math.sin(ph) * Math.cos(th); sp[i * 3 + 1] = rr * Math.cos(ph); sp[i * 3 + 2] = rr * Math.sin(ph) * Math.sin(th);
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(sp, 3));
    scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0x8090a8, size: 1 })));

    // group scaled by Rs each frame
    const group = new THREE.Group();
    scene.add(group);

    // event horizon
    const horizon = new THREE.Mesh(new THREE.SphereGeometry(1, 48, 48), new THREE.MeshBasicMaterial({ color: 0x000000 }));
    group.add(horizon);
    // thin glowing rim
    const rim = new THREE.Mesh(new THREE.SphereGeometry(1.02, 48, 48), new THREE.MeshBasicMaterial({ color: 0xffb86b, transparent: true, opacity: 0.18, side: THREE.BackSide }));
    group.add(rim);
    // photon sphere (wireframe)
    const photon = new THREE.Mesh(new THREE.SphereGeometry(1.5, 24, 16), new THREE.MeshBasicMaterial({ color: 0x7dd3fc, wireframe: true, transparent: true, opacity: 0.25 }));
    group.add(photon);

    // accretion disk as colored points with differential rotation
    const pos = new Float32Array(N * 3);
    const col = new Float32Array(N * 3);
    const baseR = new Float32Array(N);
    const baseA = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      const fr = Math.pow(Math.random(), 0.7);
      const r = INNER + fr * (OUTER - INNER);
      baseR[i] = r; baseA[i] = Math.random() * Math.PI * 2;
      const heat = 1 - (r - INNER) / (OUTER - INNER);
      col[i * 3] = 1; col[i * 3 + 1] = 0.45 + heat * 0.5; col[i * 3 + 2] = 0.15 + heat * 0.6;
    }
    const diskGeo = new THREE.BufferGeometry();
    diskGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    diskGeo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    const disk = new THREE.Points(diskGeo, new THREE.PointsMaterial({ size: 0.06, vertexColors: true, transparent: true, opacity: 0.95, blending: THREE.AdditiveBlending, depthWrite: false }));
    group.add(disk);

    const controls = attachOrbitControls(renderer.domElement, { radius: 26, minRadius: 6, maxRadius: 120 });

    const ro = new ResizeObserver(() => {
      const ww = mount.clientWidth, hh = mount.clientHeight;
      if (ww && hh) { renderer.setSize(ww, hh); camera.aspect = ww / hh; camera.updateProjectionMatrix(); }
    });
    ro.observe(mount);

    let raf = 0; let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      if (resetRef.current) { elapsedRef.current = 0; resetRef.current = false; }
      if (playingRef.current) elapsedRef.current += dt;
      const e = elapsedRef.current;
      const mass = (varsRef.current.mass as number) ?? 10;
      const rsUnit = 3 + Math.log(mass + 1) * 2.0;
      group.scale.setScalar(rsUnit);

      const p = diskGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < N; i++) {
        const r = baseR[i];
        const omega = 1.6 * Math.pow(1 / r, 1.5);
        const a = baseA[i] + omega * e * 3;
        p[i * 3] = r * Math.cos(a);
        p[i * 3 + 1] = (Math.sin(a * 2 + i) * 0.04) * r; // slight thickness
        p[i * 3 + 2] = r * Math.sin(a);
      }
      diskGeo.attributes.position.needsUpdate = true;
      photon.rotation.y += 0.003;

      controls.update(camera);
      renderer.render(scene, camera);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf); ro.disconnect(); controls.dispose();
      renderer.dispose(); mount.removeChild(renderer.domElement);
    };
  }, []);

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
