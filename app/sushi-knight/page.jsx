"use client";

import dynamic from "next/dynamic";
import { useCallback, useState } from "react";

const SushiKnightGame = dynamic(() => import("./SushiKnightClient"), { ssr: false });

export default function Page() {
  const [stats, setStats] = useState({ hp: 100, maxHp: 100, atk: 20, enemies: 0 });

  // ✅ stable function (doesn't change identity every render)
  const handleStats = useCallback((next) => {
    setStats(next);
  }, []);

  return (
    <main style={{ padding: 24 }}>
      <h1 style={{ fontSize: 28, fontWeight: 800 }}>Sushi Knight Fantasy</h1>
      <p style={{ opacity: 0.8, marginTop: 8 }}>
        Desktop: Move: WASD / Arrow Keys · Attack: Space · Collect items to boost HP/AT 
      </p>
      <p style={{ opacity: 0.8, marginTop: 8 }}>
         Mobile: Drag to move, Tap to attack
      </p>

      <div style={{ marginTop: 12, display: "flex", gap: 12, flexWrap: "wrap" }}>
        <div style={{ padding: "8px 12px", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 10 }}>
          HP: <b>{stats.hp}</b> / {stats.maxHp}
        </div>
        <div style={{ padding: "8px 12px", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 10 }}>
          ATK: <b>{stats.atk}</b>
        </div>
        <div style={{ padding: "8px 12px", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 10 }}>
          Enemies: <b>{stats.enemies}</b>
        </div>
      </div>

      <div style={{ marginTop: 16 }}>
        <SushiKnightGame onStats={handleStats} />
      </div>
    </main>
  );
}