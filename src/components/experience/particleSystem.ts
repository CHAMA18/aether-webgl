import * as THREE from "three";
import { generateFormation } from "@/lib/formations";

/**
 * Module-level particle geometry singleton.
 * Built lazily on first client render; re-used for the lifetime of the page.
 */
interface ParticleGeometry {
  geometry: THREE.BufferGeometry;
  fromArray: Float32Array;
  toArray: Float32Array;
  count: number;
}

let cache: ParticleGeometry | null = null;

function isMobile() {
  if (typeof window === "undefined") return false;
  return window.innerWidth < 768 || /Android|iPhone|iPad/i.test(navigator.userAgent);
}

export function getParticleGeometry(): ParticleGeometry {
  if (cache) return cache;

  const count = isMobile() ? 7000 : 15000;
  const from = new Float32Array(count * 3);
  const to = new Float32Array(count * 3);
  const scales = new Float32Array(count);
  const randoms = new Float32Array(count * 3);

  generateFormation("galaxy", count, to, 1337);
  from.set(to);

  for (let i = 0; i < count; i++) {
    scales[i] = 0.35 + Math.pow(Math.random(), 2) * 1.5;
    randoms[i * 3] = Math.random();
    randoms[i * 3 + 1] = Math.random();
    randoms[i * 3 + 2] = Math.random();
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(to.slice(), 3));
  geo.setAttribute("aPositionFrom", new THREE.BufferAttribute(from, 3));
  geo.setAttribute("aPositionTo", new THREE.BufferAttribute(to, 3));
  geo.setAttribute("aScale", new THREE.BufferAttribute(scales, 1));
  geo.setAttribute("aRandom", new THREE.BufferAttribute(randoms, 3));
  geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 40);

  cache = { geometry: geo, fromArray: from, toArray: to, count };
  return cache;
}
