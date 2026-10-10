# AETHER — Interactive 3D WebGL Experience

An immersive WebGL journey: a living, morphing light entity orbited by thousands of glowing particles. Drag, zoom, click to pulse, and travel between four themed dimensions.

**Stack:** Next.js 16 · TypeScript · Three.js · React Three Fiber · @react-three/drei · postprocessing · zustand · Tailwind CSS 4 · Framer Motion

## Features

- **Morphing light entity** — custom GLSL vertex displacement (simplex fbm), recomputed normals, fresnel rim glow, iridescent shimmer; bends toward your cursor and pulses on click
- **GPU particle system** — thousands of particles with differential rotation, organic drift, twinkle, cursor repulsion, and cinematic click shockwaves
- **4 themed dimensions** with smooth GPU-morphed transitions:

| Mode | Formation | Palette |
|------|-----------|---------|
| Nebula | 4-arm spiral galaxy | violet / magenta / cyan |
| Solar | breathing spherical corona | ember / gold |
| Aurora | toroidal vortex | emerald / lime |
| Void | tilted ring system | monochrome silver |

- **Cinematic post-processing** — animated bloom, chromatic aberration, film grain, vignette, ACES tone mapping
- **Adaptive performance** — dynamic resolution scaling via performance monitoring, reduced particle count on mobile

## Interaction

| Input | Action |
|-------|--------|
| Drag | Orbit the scene |
| Scroll / pinch | Zoom |
| Click / tap | Trigger a shockwave pulse |
| Hover | Bend light toward the cursor |
| Mode pills | Travel between dimensions |
| Eye button | Immersive UI-free mode |

## Run locally

```bash
bun install
bun run dev
```

Open http://localhost:3000.

> A WebGL2-capable GPU is required. The experience auto-tunes resolution to hold frame rate.

## Project structure

```
src/
├── app/                  # Next.js App Router entry
├── components/
│   ├── experience/       # R3F scene: entity, particles, camera rig, ambient, effects
│   │   └── glsl/         # shared GLSL chunks (simplex noise / fbm)
│   └── overlay/          # glassmorphic UI overlay (loader, HUD, mode switcher)
└── lib/                  # zustand store, procedural formation generators
```
