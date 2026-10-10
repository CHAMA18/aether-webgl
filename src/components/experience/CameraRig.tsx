"use client";

import { useRef } from "react";
import * as THREE from "three";
import { ThreeEvent, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { useExperience } from "@/lib/experience-store";
import { bridge, fireClick } from "./bridge";

/**
 * CameraRig:
 *  - drives OrbitControls (drag orbit, pinch/scroll zoom, damping, auto-rotate)
 *  - projects the pointer onto a camera-facing plane through the origin → bridge.pointer
 *  - converts clicks/taps into shockwave triggers
 */
export default function CameraRig() {
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const autoRotate = useExperience((s) => s.autoRotate);
  const registerPulse = useExperience((s) => s.registerPulse);

  const plane = useRef(new THREE.Plane(new THREE.Vector3(0, 0, 1), 0));
  const raycaster = useRef(new THREE.Raycaster());
  const ndc = useRef(new THREE.Vector2());
  const hit = useRef(new THREE.Vector3());
  const smoothed = useRef(new THREE.Vector3(999, 999, 999));

  useFrame((state) => {
    const { camera, pointer, gl } = state;

    // plane facing the camera, passing through the origin
    const camDir = new THREE.Vector3().subVectors(camera.position, new THREE.Vector3()).normalize();
    plane.current.setFromNormalAndCoplanarPoint(camDir, new THREE.Vector3());

    raycaster.current.setFromCamera(pointer as THREE.Vector2, camera);
    const intersects = raycaster.current.ray.intersectPlane(plane.current, hit.current);
    if (intersects) {
      bridge.pointerActive = true;
      smoothed.current.lerp(hit.current, 0.18);
      bridge.pointer.copy(smoothed.current);
    } else {
      bridge.pointerActive = false;
      bridge.pointer.lerp(new THREE.Vector3(999, 999, 999), 0.02);
    }

    // auto-rotate handled by controls; gently re-enable damping target
    if (controlsRef.current) {
      controlsRef.current.update();
    }

    // silence unused var warning for gl
    void gl;
  });

  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    // capture the world point under the cursor at click time
    const camDir = new THREE.Vector3().subVectors(e.camera.position, new THREE.Vector3()).normalize();
    const p = new THREE.Plane().setFromNormalAndCoplanarPoint(camDir, new THREE.Vector3());
    const hitPoint = new THREE.Vector3();
    if (e.ray.intersectPlane(p, hitPoint)) {
      fireClick(hitPoint);
      registerPulse();
    }
  };

  return (
    <group onPointerDown={handlePointerDown}>
      <OrbitControls
        ref={controlsRef}
        enableDamping
        dampingFactor={0.06}
        rotateSpeed={0.55}
        zoomSpeed={0.7}
        enablePan={false}
        autoRotate={autoRotate}
        autoRotateSpeed={0.45}
        minDistance={4.5}
        maxDistance={22}
        makeDefault
      />
    </group>
  );
}
