"use client";

import dynamic from "next/dynamic";
import Overlay from "@/components/overlay/Overlay";

const Experience = dynamic(() => import("@/components/experience/Experience"), {
  ssr: false,
  loading: () => null,
});

export default function Home() {
  return (
    <main className="fixed inset-0 overflow-hidden bg-[#040309] text-white">
      {/* 3D WebGL scene */}
      <Experience />

      {/* UI overlay */}
      <Overlay />

      {/* screen-reader description */}
      <p className="sr-only">
        AETHER is an interactive 3D WebGL experience: a morphing luminous entity surrounded by
        twenty-two thousand glowing particles. Drag to orbit the scene, scroll to zoom, click
        anywhere to send a shockwave through the particles, and switch between four themed
        scenes — Nebula, Solar, Aurora and Void.
      </p>
    </main>
  );
}
