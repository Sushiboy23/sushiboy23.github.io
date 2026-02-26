"use client";

import { useEffect, useRef } from "react";
import { createSushiKnightGame } from "../../src/games/sushi-knight/game";

export default function SushiKnightClient({ onStats }) {
  const containerRef = useRef(null);
  const gameRef = useRef(null);

  // ✅ keep latest callback without recreating the game
  const onStatsRef = useRef(onStats);
  useEffect(() => {
    onStatsRef.current = onStats;
  }, [onStats]);

  useEffect(() => {
    if (!containerRef.current) return;
    if (gameRef.current) return;

    // pass a stable function into Phaser
    gameRef.current = createSushiKnightGame(containerRef.current, {
      onStats: (data) => onStatsRef.current?.(data),
    });

    return () => {
      if (gameRef.current) gameRef.current.destroy(true);
      gameRef.current = null;
    };
  }, []);
   /*
  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: "calc(100vh - 180px)", // fills screen minus header area
        minHeight: 500,
        borderRadius: 16,
        overflow: "hidden",
        border: "1px solid rgba(255,255,255,0.12)",
      }}
    />
  );
  */

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        maxWidth: 1100,
        height: "70vh",      // ✅ important: gives Phaser space
        minHeight: 520,      // desktop fallback
        borderRadius: 16,
        overflow: "hidden",
        border: "1px solid rgba(255,255,255,0.12)",
        touchAction: "none",
      }}
    />
  );


}