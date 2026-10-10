import { create } from "zustand";

export type SceneMode = "nebula" | "solar" | "aurora" | "void";
export type Formation = "galaxy" | "sphere" | "vortex" | "rings";

export interface ThemeConfig {
  id: SceneMode;
  label: string;
  formation: Formation;
  /** entity gradient — core to surface */
  entityA: string;
  entityB: string;
  entityC: string;
  /** particle palette — inner, outer, accent (shockwave) */
  particleInner: string;
  particleOuter: string;
  particleAccent: string;
  /** ambient */
  fogColor: string;
  dustColor: string;
  ringColor: string;
  /** css accent for the overlay UI */
  uiAccent: string;
  bloom: number;
  entityAmp: number;
  mouseStrength: number;
}

export const THEMES: Record<SceneMode, ThemeConfig> = {
  nebula: {
    id: "nebula",
    label: "Nebula",
    formation: "galaxy",
    entityA: "#1a0533",
    entityB: "#a531e8",
    entityC: "#ff4fd8",
    particleInner: "#ff9de2",
    particleOuter: "#7b2ff7",
    particleAccent: "#4ff0ff",
    fogColor: "#060213",
    dustColor: "#c084fc",
    ringColor: "#a531e8",
    uiAccent: "#e879f9",
    bloom: 1.15,
    entityAmp: 0.42,
    mouseStrength: 1.6,
  },
  solar: {
    id: "solar",
    label: "Solar",
    formation: "sphere",
    entityA: "#2a0b00",
    entityB: "#ff6b1a",
    entityC: "#ffd23f",
    particleInner: "#fff3b0",
    particleOuter: "#ff5e13",
    particleAccent: "#ff2d00",
    fogColor: "#0d0500",
    dustColor: "#fbbf24",
    ringColor: "#ff8c1a",
    uiAccent: "#fbbf24",
    bloom: 1.35,
    entityAmp: 0.3,
    mouseStrength: 2.2,
  },
  aurora: {
    id: "aurora",
    label: "Aurora",
    formation: "vortex",
    entityA: "#011a12",
    entityB: "#00d29b",
    entityC: "#7dffc3",
    particleInner: "#b9ffe8",
    particleOuter: "#00b37a",
    particleAccent: "#d0ff4f",
    fogColor: "#010a08",
    dustColor: "#6ee7b7",
    ringColor: "#10d9a0",
    uiAccent: "#34d399",
    bloom: 1.1,
    entityAmp: 0.5,
    mouseStrength: 1.4,
  },
  void: {
    id: "void",
    label: "Void",
    formation: "rings",
    entityA: "#0a0a0c",
    entityB: "#8e9bb3",
    entityC: "#ffffff",
    particleInner: "#ffffff",
    particleOuter: "#5c6472",
    particleAccent: "#e2e8f0",
    fogColor: "#030304",
    dustColor: "#cbd5e1",
    ringColor: "#94a3b8",
    uiAccent: "#e2e8f0",
    bloom: 0.85,
    entityAmp: 0.24,
    mouseStrength: 2.6,
  },
};

interface ExperienceState {
  mode: SceneMode;
  theme: ThemeConfig;
  setMode: (m: SceneMode) => void;
  formation: Formation;
  formationEpoch: number;
  /** bump to trigger a particle morph */
  cycleFormation: () => void;
  autoRotate: boolean;
  toggleAutoRotate: () => void;
  uiHidden: boolean;
  toggleUi: () => void;
  fps: number;
  setFps: (n: number) => void;
  loaded: boolean;
  setLoaded: (b: boolean) => void;
  pulseCount: number;
  registerPulse: () => void;
}

export const useExperience = create<ExperienceState>((set) => ({
  mode: "nebula",
  theme: THEMES.nebula,
  setMode: (m) => set({ mode: m, theme: THEMES[m], formation: THEMES[m].formation, formationEpoch: Date.now() }),
  formation: THEMES.nebula.formation,
  formationEpoch: 0,
  cycleFormation: () => set((s) => ({ formationEpoch: Date.now() })),
  autoRotate: true,
  toggleAutoRotate: () => set((s) => ({ autoRotate: !s.autoRotate })),
  uiHidden: false,
  toggleUi: () => set((s) => ({ uiHidden: !s.uiHidden })),
  fps: 60,
  setFps: (n) => set({ fps: n }),
  loaded: false,
  setLoaded: (b) => set({ loaded: b }),
  pulseCount: 0,
  registerPulse: () => set((s) => ({ pulseCount: s.pulseCount + 1 })),
}));
