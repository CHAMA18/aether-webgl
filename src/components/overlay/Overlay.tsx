"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Orbit,
  Sun,
  Leaf,
  Circle,
  RotateCw,
  Pause,
  Eye,
  EyeOff,
  Sparkle,
  MousePointerClick,
  Move3d,
  ZoomIn,
  Activity,
} from "lucide-react";
import { THEMES, useExperience, type SceneMode } from "@/lib/experience-store";

const MODE_ICONS: Record<SceneMode, React.ComponentType<{ className?: string }>> = {
  nebula: Orbit,
  solar: Sun,
  aurora: Leaf,
  void: Circle,
};

const MODE_ORDER: SceneMode[] = ["nebula", "solar", "aurora", "void"];

/** Cinematic intro loader. */
function Loader() {
  const loaded = useExperience((s) => s.loaded);
  const [progress, setProgress] = useState(12);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const iv = setInterval(() => {
      setProgress((p) => (loaded ? Math.min(p + 9, 100) : Math.min(p + Math.random() * 6, 88)));
    }, 90);
    return () => clearInterval(iv);
  }, [loaded]);

  useEffect(() => {
    if (progress >= 100) {
      const t = setTimeout(() => setGone(true), 650);
      return () => clearTimeout(t);
    }
  }, [progress]);

  return (
    <AnimatePresence>
      {!gone && (
        <motion.div
          key="loader"
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#040309]"
          exit={{ opacity: 0, filter: "blur(8px)" }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.h1
            initial={{ opacity: 0, y: 14, letterSpacing: "0.6em" }}
            animate={{ opacity: 1, y: 0, letterSpacing: "0.42em" }}
            transition={{ duration: 1.4, ease: "easeOut" }}
            className="font-mono text-3xl font-light text-white/90 sm:text-5xl"
          >
            AETHER
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.55 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="mt-3 font-mono text-[10px] uppercase tracking-[0.35em] text-white/60 sm:text-xs"
          >
            interactive webgl experience
          </motion.p>
          <div className="mt-10 h-px w-48 overflow-hidden bg-white/10 sm:w-64">
            <motion.div
              className="h-full bg-gradient-to-r from-fuchsia-400 via-purple-300 to-cyan-300"
              animate={{ width: `${progress}%` }}
              transition={{ ease: "easeOut", duration: 0.25 }}
            />
          </div>
          <p className="mt-3 font-mono text-[10px] tabular-nums tracking-widest text-white/35">
            {Math.round(progress)}%
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** Top brand + live stats. */
function TopBar() {
  const theme = useExperience((s) => s.theme);
  const fps = useExperience((s) => s.fps);

  return (
    <motion.header
      initial={{ opacity: 0, y: -18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      className="pointer-events-none fixed inset-x-0 top-0 z-30 flex items-start justify-between p-5 sm:p-8"
    >
      <div>
        <h1 className="font-mono text-lg font-light tracking-[0.42em] text-white/90 sm:text-xl">
          AETHER
        </h1>
        <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.3em] text-white/40 sm:text-[10px]">
          living particle organism
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-3 whitespace-nowrap rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 backdrop-blur-md">
        <Activity className="h-3.5 w-3.5" style={{ color: theme.uiAccent }} aria-hidden="true" />
        <span className="font-mono text-[10px] tabular-nums tracking-widest text-white/70 sm:text-xs">
          {fps} FPS
        </span>
        <span className="h-3 w-px bg-white/15" aria-hidden="true" />
        <span
          className="font-mono text-[10px] uppercase tracking-widest sm:text-xs"
          style={{ color: theme.uiAccent }}
        >
          {theme.label}
        </span>
      </div>
    </motion.header>
  );
}

/** Bottom-left interaction hints. */
function Hints() {
  const items = [
    { icon: Move3d, text: "Drag to orbit" },
    { icon: ZoomIn, text: "Scroll to zoom" },
    { icon: MousePointerClick, text: "Click to pulse" },
    { icon: Sparkle, text: "Hover to bend light" },
  ];
  return (
    <motion.aside
      initial={{ opacity: 0, x: -18 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.9, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      className="pointer-events-none fixed bottom-24 left-5 z-30 hidden flex-col gap-2.5 sm:left-8 md:flex"
      aria-label="Interaction hints"
    >
      {items.map(({ icon: Icon, text }) => (
        <div key={text} className="flex items-center gap-2.5 text-white/45">
          <Icon className="h-3.5 w-3.5" aria-hidden="true" />
          <span className="font-mono text-[10px] uppercase tracking-[0.22em]">{text}</span>
        </div>
      ))}
    </motion.aside>
  );
}

/** Bottom-center scene mode switcher. */
function ModeSwitcher() {
  const mode = useExperience((s) => s.mode);
  const setMode = useExperience((s) => s.setMode);

  return (
    <motion.nav
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.7, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      className="pointer-events-auto fixed inset-x-0 bottom-0 z-30 flex justify-center p-5 pb-8 sm:p-8"
      aria-label="Scene modes"
    >
      <div
        role="tablist"
        className="flex max-w-[calc(100vw-2rem)] items-center gap-1 rounded-full border border-white/10 bg-black/30 p-1.5 shadow-2xl backdrop-blur-xl"
      >
        {MODE_ORDER.map((id) => {
          const theme = THEMES[id];
          const Icon = MODE_ICONS[id];
          const active = mode === id;
          return (
            <button
              key={id}
              role="tab"
              aria-selected={active}
              onClick={() => setMode(id)}
              className="relative flex min-h-[44px] items-center gap-2 rounded-full px-3.5 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-white/60 sm:px-5"
              style={{ color: active ? "#fff" : "rgba(255,255,255,0.5)" }}
            >
              {active && (
                <motion.span
                  layoutId="mode-pill"
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: `linear-gradient(120deg, ${theme.particleOuter}55, ${theme.particleAccent}33)`,
                    boxShadow: `0 0 24px ${theme.uiAccent}44, inset 0 0 0 1px ${theme.uiAccent}66`,
                  }}
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                />
              )}
              <Icon className="relative z-10 h-4 w-4" aria-hidden="true" />
              <span className="relative z-10 hidden font-mono text-[11px] uppercase tracking-[0.18em] sm:inline">
                {theme.label}
              </span>
            </button>
          );
        })}
      </div>
    </motion.nav>
  );
}

/** Bottom-right utility controls — always mounted, dims when UI is hidden. */
function Utilities() {
  const autoRotate = useExperience((s) => s.autoRotate);
  const toggleAutoRotate = useExperience((s) => s.toggleAutoRotate);
  const uiHidden = useExperience((s) => s.uiHidden);
  const toggleUi = useExperience((s) => s.toggleUi);
  const theme = useExperience((s) => s.theme);

  return (
    <motion.div
      initial={{ opacity: 0, x: 18 }}
      animate={{ opacity: uiHidden ? 0.55 : 1, x: 0 }}
      transition={{ delay: uiHidden ? 0 : 0.9, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      className="fixed bottom-24 right-5 z-40 flex flex-col gap-2 sm:right-8"
    >
      <button
        onClick={toggleAutoRotate}
        aria-label={autoRotate ? "Pause auto rotation" : "Resume auto rotation"}
        className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/70 backdrop-blur-md transition-all hover:bg-white/[0.1] hover:text-white focus-visible:ring-2 focus-visible:ring-white/60"
      >
        {autoRotate ? <Pause className="h-4 w-4" /> : <RotateCw className="h-4 w-4" />}
      </button>
      <button
        onClick={toggleUi}
        aria-label={uiHidden ? "Show interface" : "Hide interface"}
        className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/70 backdrop-blur-md transition-all hover:bg-white/[0.1] hover:text-white focus-visible:ring-2 focus-visible:ring-white/60"
        style={uiHidden ? { boxShadow: `0 0 16px ${theme.uiAccent}55` } : undefined}
      >
        {uiHidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </motion.div>
  );
}

export default function Overlay() {
  const uiHidden = useExperience((s) => s.uiHidden);

  return (
    <>
      <Loader />
      <AnimatePresence>
        {!uiHidden && (
          <motion.div
            key="ui"
            exit={{ opacity: 0, transition: { duration: 0.4 } }}
            className="pointer-events-none fixed inset-0 z-30"
          >
            <TopBar />
            <Hints />
            <ModeSwitcher />
          </motion.div>
        )}
      </AnimatePresence>
      <Utilities />
    </>
  );
}
