import Phaser from "phaser";

export default class BootScene extends Phaser.Scene {
  constructor() {
    super("boot");
  }

  preload() {
    // Knight run sheet
    this.load.image("knight_sheet", "/games/sushi-knight/sprites/knight_run.png");

    // NEW: Knight attack sheet (put your file here)
    this.load.image("knight_attack_sheet", "/games/sushi-knight/sprites/knight_attack.png");

    // Enemies/items (unchanged)
    this.load.image("tamago", "/games/sushi-knight/sprites/tamago.png");
    this.load.image("maguro", "/games/sushi-knight/sprites/maguro.png");
    this.load.image("heart", "/games/sushi-knight/sprites/heart.png");
    this.load.image("sword", "/games/sushi-knight/sprites/sword.png");
    // Map tiles + map json
    this.load.image("summer_tiles", "/games/sushi-knight/tiles/summer_tileset_plus_props.png");
    this.load.tilemapTiledJSON("level1", "/games/sushi-knight/maps/level1_plus_props_v2.json");
    // Attack animations
    this.load.image("rottenEgg", "/games/sushi-knight/sprites/rottenEgg.png");
    this.load.image("rottenPuddle", "/games/sushi-knight/sprites/rottenPuddle.png");
    // NEW: maguro attack frames (3 separate PNGs)
    this.load.image("maguroAtk1", "/games/sushi-knight/sprites/maguroAtk1.png");
    this.load.image("maguroAtk2", "/games/sushi-knight/sprites/maguroAtk2.png");
    this.load.image("maguroAtk3", "/games/sushi-knight/sprites/maguroAtk3.png");


    const t = this.add.text(16, 16, "Loading...", { fontSize: "16px" });
    this.load.on("complete", () => t.destroy());
  }

  create() {
    // Build RUN sheet + animation (skip blank frames)
    const runFrames = this.buildNonBlankFramesFromSquareSheet(
      "knight",        // spritesheet key
      "knight_sheet"   // loaded image key
    );

    this.anims.create({
      key: "knight-run",
      frames: runFrames,
      frameRate: 7,
      repeat: -1,
    });

    // Build ATTACK sheet + animation (skip blank frames)
    const attackFrames = this.buildNonBlankFramesFromSquareSheet(
      "knight-attack",        // spritesheet key
      "knight_attack_sheet"   // loaded image key
    );

    this.anims.create({
      key: "knight-attack",
      frames: attackFrames,
      frameRate: 14,
      repeat: 0,
    });

    this.scene.start("play");
  }

  /**
   * Turns a horizontally-laid sprite sheet into a Phaser spritesheet texture,
   * assuming square frames (frameWidth = frameHeight = imageHeight),
   * and returns an array of frame objects skipping "blank" frames.
   */
  buildNonBlankFramesFromSquareSheet(sheetKey, imageKey) {
    const tex = this.textures.get(imageKey);
    const img = tex.getSourceImage();

    const frameHeight = img.height;
    const frameWidth = frameHeight;
    const frameCount = Math.floor(img.width / frameWidth);

    // Register as a spritesheet texture under sheetKey
    this.textures.addSpriteSheet(sheetKey, img, { frameWidth, frameHeight });

    const goodFrames = [];

    const canvas = document.createElement("canvas");
    canvas.width = frameWidth;
    canvas.height = frameHeight;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });

    for (let i = 0; i < frameCount; i++) {
      ctx.clearRect(0, 0, frameWidth, frameHeight);

      ctx.drawImage(
        img,
        i * frameWidth, 0, frameWidth, frameHeight,
        0, 0, frameWidth, frameHeight
      );

      const data = ctx.getImageData(0, 0, frameWidth, frameHeight).data;

      // any non-transparent pixel?
      let nonTransparent = false;
      for (let p = 3; p < data.length; p += 4) {
        if (data[p] > 10) {
          nonTransparent = true;
          break;
        }
      }

      if (nonTransparent) {
        goodFrames.push({ key: sheetKey, frame: i });
      }
    }

    // Fallback: at least 2 frames so Phaser doesn't error
    if (goodFrames.length < 2) {
      for (let i = 0; i < Math.min(8, frameCount); i++) {
        goodFrames.push({ key: sheetKey, frame: i });
      }
    }

    return goodFrames;
  }
}