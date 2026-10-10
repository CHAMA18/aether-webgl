"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { AdaptiveDpr, PerformanceMonitor, Preload } from "@react-three/drei";
import { useExperience } from "@/lib/experience-store";
import CameraRig from "./CameraRig";
import Entity from "./Entity";
import Particles from "./Particles";
import Ambient from "./Ambient";
import Effects from "./Effects";

/** Tracks FPS and pushes it to the store (throttled). */
function FpsTracker() {
  const acc = useRef({ frames: 0, elapsed: 0 });
  const setFps = useExperience((s) => s.setFps);
  const setLoaded = useExperience((s) => s.setLoaded);

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 400);
    return () => clearTimeout(t);
  }, [setLoaded]);

  useFrame((_, delta) => {
    acc.current.frames++;
    acc.current.elapsed += delta;
    if (acc.current.elapsed >= 0.5) {
      setFps(Math.round(acc.current.frames / acc.current.elapsed));
      acc.current.frames = 0;
      acc.current.elapsed = 0;
    }
  });
  return null;
}

function Scene() {
  return (
    <>
      <CameraRig />
      <Suspense fallback={null}>
        <Ambient />
        <Entity />
        <Particles />
        <Effects />
        <FpsTracker />
        <Preload all />
      </Suspense>
      <AdaptiveDpr pixelated />
    </>
  );
}

export default function Experience() {
  const [dpr, setDpr] = useState(1.25);

  return (
    <div className="absolute inset-0" aria-hidden="true">
      <Canvas
        dpr={dpr}
        camera={{ position: [0, 3.2, 11], fov: 55, near: 0.1, far: 200 }}
        gl={{
          antialias: false,
          alpha: false,
          powerPreference: "high-performance",
          toneMapping: THREE.ACESFilmicToneMapping,
        }}
        onCreated={({ gl }) => {
          gl.setClearColor(new THREE.Color("#040309"), 1);
        }}
        style={{ touchAction: "none" }}
      >
        <PerformanceMonitor
          factor={1}
          stepms={250}
          onIncline={() => setDpr(Math.min(1.5, dpr + 0.25))}
          onDecline={() => setDpr(Math.max(0.65, dpr - 0.25))}
        >
          <Scene />
        </PerformanceMonitor>
      </Canvas>
    </div>
  );
}
