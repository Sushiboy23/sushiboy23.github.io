import Phaser from "phaser";
import BootScene from "./scenes/BootScene";
import PlayScene from "./scenes/PlayScene";

export function createSushiKnightGame(container, { onStats } = {}) {
  if (container.__PHASER_GAME__) {
    try { container.__PHASER_GAME__.destroy(true); } catch {}
    container.__PHASER_GAME__ = null;
  }

  const game = new Phaser.Game({
    type: Phaser.CANVAS,
    parent: container,
    backgroundColor: "#0b0f1a",
    audio: { noAudio: true },
    physics: { default: "arcade", arcade: { debug: false } },
    width: 960,
    height: 540,
    scale: {
      mode: Phaser.Scale.RESIZE,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    scene: [BootScene, PlayScene],
  });

  // ✅ make callback accessible to scenes
  game.registry.set("onStats", onStats);

  container.__PHASER_GAME__ = game;
  return game;
}