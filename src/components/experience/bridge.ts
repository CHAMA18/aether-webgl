import * as THREE from "three";

/**
 * Module-level singleton that decouples pointer/click capture (CameraRig)
 * from consumers (Entity, Particles) without prop drilling.
 */
export const bridge = {
  /** Pointer projected onto the view-aligned plane through the origin. */
  pointer: new THREE.Vector3(999, 999, 999),
  /** True while the pointer is over the canvas. */
  pointerActive: false,
  /** Monotonic click id — consumers watch for changes. */
  clickId: 0,
  /** World-space point of the last click. */
  clickPoint: new THREE.Vector3(),
  /** Frame time at which the click happened (set by consumer). */
  clickTime: -100,
};

export function fireClick(point: THREE.Vector3) {
  bridge.clickPoint.copy(point);
  bridge.clickId++;
}
