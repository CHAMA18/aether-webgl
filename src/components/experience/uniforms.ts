import * as THREE from "three";
import type { ThemeConfig } from "@/lib/experience-store";

/**
 * Module-level uniform singletons.
 *
 * The scene components are singletons (only one instance ever mounted), so
 * keeping mutable uniform objects at module scope sidesteps React Compiler
 * immutability constraints entirely — every frame the components mutate these
 * objects inside useFrame, which is outside React's render phase.
 */

export const entityUniforms = {
  uTime: { value: 0 },
  uAmp: { value: 0.42 },
  uMouseInfluence: { value: 0.22 },
  uMouse: { value: new THREE.Vector3(10, 10, 10) },
  uPulse: { value: 0 },
  uColorA: { value: new THREE.Color("#1a0533") },
  uColorB: { value: new THREE.Color("#a531e8") },
  uColorC: { value: new THREE.Color("#ff4fd8") },
};

export const particleUniforms = {
  uTime: { value: 0 },
  uSize: { value: 1.35 },
  uMorph: { value: 1 },
  uMouse: { value: new THREE.Vector3(999, 999, 999) },
  uMouseStrength: { value: 1.6 },
  uClickPoint: { value: new THREE.Vector3() },
  uClickTime: { value: -100 },
  uColorInner: { value: new THREE.Color("#ff9de2") },
  uColorOuter: { value: new THREE.Color("#7b2ff7") },
  uColorAccent: { value: new THREE.Color("#4ff0ff") },
  uOpacity: { value: 0.85 },
};

export const glowUniforms = {
  uColor: { value: new THREE.Color("#a531e8") },
  uIntensity: { value: 0.55 },
};

interface ThemeTargets {
  id: string;
  entityA: THREE.Color;
  entityB: THREE.Color;
  entityC: THREE.Color;
  particleInner: THREE.Color;
  particleOuter: THREE.Color;
  particleAccent: THREE.Color;
  glow: THREE.Color;
}

let targets: ThemeTargets | null = null;

/** Cached THREE.Color targets for the active theme — rebuilt only on theme change. */
export function getThemeTargets(theme: ThemeConfig): ThemeTargets {
  if (!targets || targets.id !== theme.id) {
    targets = {
      id: theme.id,
      entityA: new THREE.Color(theme.entityA),
      entityB: new THREE.Color(theme.entityB),
      entityC: new THREE.Color(theme.entityC),
      particleInner: new THREE.Color(theme.particleInner),
      particleOuter: new THREE.Color(theme.particleOuter),
      particleAccent: new THREE.Color(theme.particleAccent),
      glow: new THREE.Color(theme.entityB).lerp(new THREE.Color(theme.entityC), 0.4),
    };
  }
  return targets;
}

/** Exponential smoothing factor that is frame-rate independent. */
export function damp(factor: number, delta: number): number {
  return 1 - Math.pow(factor, Math.min(delta, 0.05));
}
