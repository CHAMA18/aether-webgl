"use client";

import * as THREE from "three";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useExperience } from "@/lib/experience-store";
import { generateFormation } from "@/lib/formations";
import { SNOISE3 } from "./glsl/noise";
import { bridge } from "./bridge";
import { particleUniforms, getThemeTargets, damp } from "./uniforms";
import { getParticleGeometry } from "./particleSystem";

const vertexShader = /* glsl */ `
uniform float uTime;
uniform float uSize;
uniform float uMorph;
uniform vec3 uMouse;
uniform float uMouseStrength;
uniform vec3 uClickPoint;
uniform float uClickTime;

attribute vec3 aPositionFrom;
attribute vec3 aPositionTo;
attribute float aScale;
attribute vec3 aRandom;

varying float vDist;
varying float vWave;
varying float vTwinkle;

${SNOISE3}

void main() {
  vec3 base = mix(aPositionFrom, aPositionTo, uMorph);
  float r = length(base);
  vDist = r;

  // differential rotation — inner regions spin faster, like a galaxy
  float angle = uTime * (0.05 + 0.9 / (r + 1.6));
  float c = cos(angle);
  float s = sin(angle);
  base.xz = mat2(c, -s, s, c) * base.xz;

  // organic drift
  float wob = 0.22 * (0.4 + aScale * 0.6);
  base += wob * vec3(
    snoise(base * 0.22 + vec3(uTime * 0.14, 0.0, 0.0)),
    snoise(base * 0.22 + vec3(0.0, uTime * 0.11, 7.3)),
    snoise(base * 0.22 + vec3(3.1, 0.0, uTime * 0.12))
  );

  // click shockwave — an expanding spherical shell of displaced particles
  float ct = uTime - uClickTime;
  float envelope = step(0.001, ct) * (1.0 - smoothstep(3.5, 6.0, ct));
  float waveDist = ct * 7.5;
  float d = distance(base, uClickPoint);
  float wave = exp(-pow(d - waveDist, 2.0) * 0.55) * exp(-ct * 0.55) * envelope;
  base += normalize(base - uClickPoint + vec3(0.0001)) * wave * 2.4;
  vWave = wave;

  // cursor repulsion field
  vec3 toMouse = base - uMouse;
  float md = length(toMouse);
  float rep = smoothstep(3.2, 0.0, md);
  base += normalize(toMouse + vec3(0.0001)) * rep * uMouseStrength * 1.35;

  vec4 mv = modelViewMatrix * vec4(base, 1.0);
  gl_Position = projectionMatrix * mv;

  float sizeAttenuation = 26.0 / -mv.z;
  gl_PointSize = uSize * aScale * sizeAttenuation;

  vTwinkle = 0.65 + 0.35 * sin(uTime * (1.2 + aRandom.x * 2.4) + aRandom.y * 40.0);
}
`;

const fragmentShader = /* glsl */ `
uniform vec3 uColorInner;
uniform vec3 uColorOuter;
uniform vec3 uColorAccent;
uniform float uOpacity;

varying float vDist;
varying float vWave;
varying float vTwinkle;

void main() {
  vec2 uv = gl_PointCoord - 0.5;
  float d = length(uv);
  float alpha = smoothstep(0.5, 0.02, d);
  alpha *= alpha;

  float mixVal = smoothstep(0.6, 9.5, vDist);
  vec3 col = mix(uColorInner, uColorOuter, mixVal);
  col = mix(col, uColorAccent, clamp(vWave * 2.6, 0.0, 1.0));
  col += uColorAccent * pow(1.0 - smoothstep(0.0, 0.5, d), 3.0) * 0.25;

  gl_FragColor = vec4(col, alpha * uOpacity * vTwinkle);
}
`;

export default function Particles() {
  const { geometry, fromArray, toArray, count } = getParticleGeometry();

  const anim = useRef({
    morphFrom: 1,
    morphActive: false,
    lastEpoch: 0,
    lastClickId: 0,
    clickLocalTime: -100,
  });

  useFrame((_, delta) => {
    const d = Math.min(delta, 0.05);
    const { theme, formation, formationEpoch } = useExperience.getState();
    const targets = getThemeTargets(theme);
    const u = particleUniforms;
    const a = anim.current;

    u.uTime.value += d;

    // theme transitions
    u.uColorInner.value.lerp(targets.particleInner, damp(0.002, d));
    u.uColorOuter.value.lerp(targets.particleOuter, damp(0.002, d));
    u.uColorAccent.value.lerp(targets.particleAccent, damp(0.002, d));
    u.uMouseStrength.value += (theme.mouseStrength - u.uMouseStrength.value) * damp(0.01, d);

    // formation switch — current target becomes source, new formation becomes target
    if (formationEpoch !== 0 && formationEpoch !== a.lastEpoch) {
      a.lastEpoch = formationEpoch;
      const attrFrom = geometry.getAttribute("aPositionFrom") as THREE.BufferAttribute;
      const attrTo = geometry.getAttribute("aPositionTo") as THREE.BufferAttribute;
      fromArray.set(toArray);
      generateFormation(formation, count, toArray, formationEpoch & 0xffff);
      attrFrom.needsUpdate = true;
      attrTo.needsUpdate = true;
      a.morphFrom = 0;
      a.morphActive = true;
    }

    // formation morph easing
    if (a.morphActive) {
      a.morphFrom = Math.min(1, a.morphFrom + d / 2.4);
      const t = a.morphFrom;
      const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      u.uMorph.value = eased;
      if (t >= 1) a.morphActive = false;
    }

    // pointer world → uniform
    u.uMouse.value.lerp(bridge.pointer, damp(0.0001, d));

    // click shockwave trigger
    if (bridge.clickId !== a.lastClickId) {
      a.lastClickId = bridge.clickId;
      a.clickLocalTime = u.uTime.value;
      u.uClickPoint.value.copy(bridge.clickPoint);
    }
    u.uClickTime.value = a.clickLocalTime;
  });

  return (
    <points geometry={geometry} frustumCulled={false}>
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={particleUniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
