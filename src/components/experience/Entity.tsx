"use client";

import { useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { SNOISE3 } from "./glsl/noise";
import { useExperience } from "@/lib/experience-store";
import { bridge } from "./bridge";
import { entityUniforms, getThemeTargets, damp } from "./uniforms";

const vertexShader = /* glsl */ `
uniform float uTime;
uniform float uAmp;
uniform float uMouseInfluence;
uniform vec3 uMouse;
uniform float uPulse;

varying vec3 vNormal;
varying vec3 vViewDir;
varying float vNoise;
varying float vMouseProx;
varying float vPulseGlow;

${SNOISE3}

float fbm3(vec3 p) {
  float value = 0.0;
  float amplitude = 0.5;
  for (int i = 0; i < 3; i++) {
    value += amplitude * snoise(p);
    p *= 2.07;
    amplitude *= 0.5;
  }
  return value;
}

float displacement(vec3 dir) {
  float n = fbm3(dir * 1.65 + vec3(0.0, uTime * 0.16, uTime * 0.09));
  float prox = 1.0 - smoothstep(0.0, 1.25, distance(dir, normalize(uMouse + vec3(0.0001))));
  float pulse = uPulse * (0.5 + 0.5 * snoise(dir * 3.0 + uTime * 0.5));
  return n * uAmp + prox * uMouseInfluence + pulse * 0.35;
}

void main() {
  vec3 dir = normalize(position);
  float radius = length(position);

  // tangent frame for neighbor sampling → recomputed normals
  vec3 up = abs(dir.y) < 0.99 ? vec3(0.0, 1.0, 0.0) : vec3(1.0, 0.0, 0.0);
  vec3 t = normalize(cross(dir, up));
  vec3 b = normalize(cross(dir, t));
  float eps = 0.045;

  vec3 nA = normalize(dir + t * eps);
  vec3 nB = normalize(dir + b * eps);

  float d0 = displacement(dir);
  float dA = displacement(nA);
  float dB = displacement(nB);

  vec3 p0 = dir * (radius + d0);
  vec3 pA = nA * (radius + dA);
  vec3 pB = nB * (radius + dB);

  vec3 newNormal = normalize(cross(pA - p0, pB - p0));
  if (dot(newNormal, dir) < 0.0) newNormal = -newNormal;

  vNoise = d0;
  float prox = 1.0 - smoothstep(0.0, 1.25, distance(dir, normalize(uMouse + vec3(0.0001))));
  vMouseProx = prox;
  vPulseGlow = uPulse;

  vec4 mvPosition = modelViewMatrix * vec4(p0, 1.0);
  vNormal = normalize(normalMatrix * newNormal);
  vViewDir = normalize(-mvPosition.xyz);
  gl_Position = projectionMatrix * mvPosition;
}
`;

const fragmentShader = /* glsl */ `
uniform float uTime;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;

varying vec3 vNormal;
varying vec3 vViewDir;
varying float vNoise;
varying float vMouseProx;
varying float vPulseGlow;

void main() {
  vec3 normal = normalize(vNormal);
  vec3 viewDir = normalize(vViewDir);

  float fresnel = pow(1.0 - clamp(dot(normal, viewDir), 0.0, 1.0), 2.4);

  // flowing gradient driven by the noise field
  float grad = smoothstep(-0.75, 0.9, vNoise);
  vec3 color = mix(uColorA, uColorB, grad);
  color = mix(color, uColorC, fresnel * 0.85);

  // iridescent shimmer band drifting over the surface
  float shimmer = 0.5 + 0.5 * sin(vNoise * 14.0 - uTime * 1.4);
  color += uColorC * shimmer * 0.06;

  // mouse touch glow + click pulse glow
  color += uColorC * vMouseProx * 0.85;
  color += uColorC * vPulseGlow * 0.55;

  float alpha = 0.55 + fresnel * 0.45;
  gl_FragColor = vec4(color, alpha);
}
`;

export default function Entity() {
  const meshRef = useRef<THREE.Mesh>(null);

  const anim = useRef({
    pulse: 0,
    lastPulseCount: 0,
    localMouse: new THREE.Vector3(10, 10, 10),
  });

  useFrame((_, delta) => {
    const d = Math.min(delta, 0.05);
    const { theme, pulseCount } = useExperience.getState();
    const targets = getThemeTargets(theme);
    const u = entityUniforms;
    const a = anim.current;

    u.uTime.value += d;

    // theme transitions
    u.uColorA.value.lerp(targets.entityA, damp(0.001, d));
    u.uColorB.value.lerp(targets.entityB, damp(0.001, d));
    u.uColorC.value.lerp(targets.entityC, damp(0.001, d));
    u.uAmp.value += (theme.entityAmp - u.uAmp.value) * damp(0.02, d);

    // pointer → entity local space
    const mesh = meshRef.current;
    if (mesh) {
      mesh.worldToLocal(a.localMouse.copy(bridge.pointer));
      u.uMouse.value.lerp(a.localMouse, damp(0.0005, d));
    }

    // click pulse spring
    if (pulseCount !== a.lastPulseCount) {
      a.lastPulseCount = pulseCount;
      a.pulse = 1;
    }
    a.pulse = Math.max(0, a.pulse - d * 1.6);
    const eased = a.pulse * a.pulse;
    u.uPulse.value += (eased - u.uPulse.value) * damp(0.001, d);

    if (mesh) {
      mesh.rotation.y += d * 0.08;
      mesh.rotation.z += d * 0.03;
      const breathe = 1 + Math.sin(u.uTime.value * 0.7) * 0.015;
      mesh.scale.setScalar(breathe);
    }
  });

  return (
    <mesh ref={meshRef} scale={1.35}>
      <icosahedronGeometry args={[1, 32]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={entityUniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}
