"use client";

import { useEffect, useRef } from "react";
import { createSushiKnightGame } from "../../src/games/sushi-knight/game";

export default function SushiKnightClient({ onStats }) {
  const containerRef = useRef(null);     // Phaser mounts inside this
  const gameRef = useRef(null);

  // keep latest callback without recreating the game
  const onStatsRef = useRef(onStats);
  useEffect(() => {
    onStatsRef.current = onStats;
  }, [onStats]);

  useEffect(() => {
    if (!containerRef.current) return;
    if (gameRef.current) return;

    gameRef.current = createSushiKnightGame(containerRef.current, {
      onStats: (data) => onStatsRef.current?.(data),
    });

    return () => {
      if (gameRef.current) gameRef.current.destroy(true);
      gameRef.current = null;
    };
  }, []);

  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        justifyContent: "center",
      }}
    >
      {/* OUTER WRAP: DO NOT CLIP (lets mobile UI circles show) */}
      <div
        style={{
          width: "100%",
          maxWidth: 1100,

          // mobile-friendly full height
          height: "100dvh",
          // desktop fallback so it doesn't eat the whole page
          maxHeight: 720,
          minHeight: 520,

          position: "relative",
          overflow: "visible", // ✅ important: stop cutting off joystick/attack button
        }}
      >
        {/* INNER MOUNT: Phaser injects <canvas> here */}
        <div
          ref={containerRef}
          style={{
            width: "100%",
            height: "100%",
            borderRadius: 16,
            border: "1px solid rgba(255,255,255,0.12)",
            touchAction: "none",
          }}
        />

        {/* Round corners on the CANVAS (not the wrapper) */}
        <style jsx>{`
          div :global(canvas) {
            width: 100% !important;
            height: 100% !important;
            display: block;
            border-radius: 16px;
          }
        `}</style>
      </div>
    </div>
  );
}