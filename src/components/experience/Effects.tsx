"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import {
  EffectComposer,
  Bloom,
  ChromaticAberration,
  Vignette,
  Noise,
} from "@react-three/postprocessing";
import { BlendFunction, type BloomEffect } from "postprocessing";
import { useExperience } from "@/lib/experience-store";

export default function Effects() {
  const theme = useExperience((s) => s.theme);
  const bloomRef = useRef<BloomEffect>(null);
  const offset = useMemo(() => new THREE.Vector2(0.0006, 0.0009), []);

  // smoothly animate bloom intensity toward the active theme's target
  useFrame((_, delta) => {
    const d = Math.min(delta, 0.05);
    if (bloomRef.current) {
      const cur = bloomRef.current.intensity;
      bloomRef.current.intensity = cur + (theme.bloom - cur) * (1 - Math.pow(0.01, d));
    }
  });

  return (
    <EffectComposer multisampling={0}>
      <Bloom
        ref={bloomRef}
        intensity={theme.bloom}
        luminanceThreshold={0.08}
        luminanceSmoothing={0.32}
        mipmapBlur
        radius={0.72}
      />
      <ChromaticAberration
        offset={offset}
        blendFunction={BlendFunction.NORMAL}
        radialModulation={false}
        modulationOffset={0}
      />
      <Noise opacity={0.05} blendFunction={BlendFunction.OVERLAY} />
      <Vignette eskil={false} offset={0.18} darkness={0.82} />
    </EffectComposer>
  );
}
