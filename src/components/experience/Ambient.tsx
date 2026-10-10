"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Sparkles, Stars } from "@react-three/drei";
import { useExperience } from "@/lib/experience-store";
import { glowUniforms, getThemeTargets, damp } from "./uniforms";

/** Soft radial core glow behind the entity. */
function CoreGlow() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(({ camera }, delta) => {
    const d = Math.min(delta, 0.05);
    const { theme } = useExperience.getState();
    const targets = getThemeTargets(theme);
    glowUniforms.uColor.value.lerp(targets.glow, damp(0.002, d));
    if (meshRef.current) {
      meshRef.current.lookAt(camera.position);
    }
  });

  return (
    <mesh ref={meshRef} scale={7.5}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        uniforms={glowUniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        vertexShader={/* glsl */ `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={/* glsl */ `
          uniform vec3 uColor;
          uniform float uIntensity;
          varying vec2 vUv;
          void main() {
            float d = length(vUv - 0.5) * 2.0;
            float glow = pow(max(0.0, 1.0 - d), 2.6);
            float halo = pow(max(0.0, 1.0 - d), 8.0) * 1.6;
            gl_FragColor = vec4(uColor, (glow * 0.5 + halo) * uIntensity);
          }
        `}
      />
    </mesh>
  );
}

/** Thin orbital rings circling the entity at different tilts. */
function OrbitRings() {
  const groupRef = useRef<THREE.Group>(null);
  const theme = useExperience((s) => s.theme);
  const ringColor = useMemo(() => new THREE.Color(theme.ringColor), [theme]);

  const rings = useMemo(
    () => [
      { radius: 2.6, tube: 0.008, tilt: [Math.PI / 2.15, 0.2, 0], speed: 0.24 },
      { radius: 3.4, tube: 0.006, tilt: [Math.PI / 1.85, -0.4, 0.3], speed: -0.16 },
      { radius: 4.5, tube: 0.005, tilt: [Math.PI / 2.6, 0.7, -0.2], speed: 0.1 },
    ],
    []
  );

  useFrame((_, delta) => {
    const d = Math.min(delta, 0.05);
    if (groupRef.current) {
      groupRef.current.children.forEach((child, i) => {
        child.rotation.z += d * rings[i].speed;
      });
    }
  });

  return (
    <group ref={groupRef}>
      {rings.map((ring, i) => (
        <mesh key={i} rotation={ring.tilt as [number, number, number]}>
          <torusGeometry args={[ring.radius, ring.tube, 8, 220]} />
          <meshBasicMaterial
            color={ringColor}
            transparent
            opacity={0.28 - i * 0.06}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
}

/** Slow-breathing far dust + starfield backdrop. */
function Backdrop() {
  const theme = useExperience((s) => s.theme);
  const dustColor = useMemo(() => new THREE.Color(theme.dustColor), [theme]);
  const fogColor = useMemo(() => new THREE.Color(theme.fogColor), [theme]);

  useFrame(({ scene }, delta) => {
    const d = Math.min(delta, 0.05);
    if (scene.fog) {
      (scene.fog as THREE.FogExp2).color.lerp(fogColor, 1 - Math.pow(0.002, d));
    }
  });

  return (
    <>
      <Sparkles
        count={140}
        scale={[26, 18, 26]}
        size={2.2}
        speed={0.16}
        opacity={0.5}
        color={dustColor}
      />
      <Stars radius={70} depth={40} count={3200} factor={3.4} saturation={0} fade speed={0.4} />
    </>
  );
}

export default function Ambient() {
  const theme = useExperience((s) => s.theme);

  return (
    <>
      <fogExp2 attach="fog" args={[theme.fogColor, 0.028]} />
      <CoreGlow />
      <OrbitRings />
      <Backdrop />
    </>
  );
}
