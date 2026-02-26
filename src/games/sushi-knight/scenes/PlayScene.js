// ==============================
// PlayScene.js
// ==============================
import Phaser from "phaser";

export default class PlayScene extends Phaser.Scene {
    constructor(config = {}) {
      super("play");
      this.onStats = config.onStats || null;
    }

  create() {
    // ======================
    // Simple Map (arena)
    // ======================
    this.mapW = 2000;
    this.mapH = 1200;
    this.physics.world.setBounds(0, 0, this.mapW, this.mapH);

    // Background
    this.add.rectangle(0, 0, this.mapW, this.mapH, 0x0b0f1a).setOrigin(0);

    // Walls / obstacles
    this.walls = this.physics.add.staticGroup();
    this.buildSimpleMap();

    // --- Player stats ---
    this.playerStats = {
      hp: 100,
      maxHp: 100,
      atk: 20,
      attackCooldown: 0,
    };

    // Attack state
    this.isAttacking = false;

    // --- Player (Sprite, animated) ---
    this.player = this.physics.add.sprite(180, 260, "knight").setScale(0.85);
    this.player.setCollideWorldBounds(true);
    this.player.setDrag(1400, 1400);
    this.player.setMaxVelocity(280, 280);

    // Player collision with walls
    this.physics.add.collider(this.player, this.walls);

    // --- Enemies group ---
    this.enemies = this.physics.add.group();

    // Spawn enemies further away (avoid instant death)
    this.spawnEnemy("tamago", 1400, 300);
    this.spawnEnemy("maguro", 1600, 700);
    this.spawnEnemy("tamago", 1200, 900);

    // Enemies collide with walls/each other
    this.physics.add.collider(this.enemies, this.walls);
    this.physics.add.collider(this.enemies, this.enemies);

    // --- Items group (collect by walking over them) ---
    this.items = this.physics.add.group({ immovable: true, allowGravity: false });

    this.spawnItem("heart", 500, 500); // +HP
    this.spawnItem("sword", 800, 650); // +ATK
    this.spawnItem("heart", 1100, 500); // +HP

    // --- Input ---
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys("W,A,S,D");
    this.attackKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // --- Spawn protection (prevents instant game over) ---
    this.playerInvulnUntil = this.time.now + 1000;

    // --- Combat: player overlaps enemy => take damage (touch damage) ---
    this.physics.add.overlap(this.player, this.enemies, (_, enemy) => {
      if (this.playerInvulnUntil && this.time.now < this.playerInvulnUntil) return;

      this.damagePlayer(10);
      this.playerInvulnUntil = this.time.now + 500;

      // knockback
      const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, this.player.x, this.player.y);
      this.player.setVelocity(Math.cos(angle) * 380, Math.sin(angle) * 380);
    });

    // --- Items: pickup ---
    this.physics.add.overlap(this.player, this.items, (_, item) => {
      this.collectItem(item);
    });

    // ======================
    // HUD (pinned to screen)
    // ======================
    this.hudBg = this.add
      .rectangle(12, 12, 340, 34, 0x000000, 0.45)
      .setOrigin(0)
      .setScrollFactor(0);

    this.hud = this.add.text(20, 18, "", { fontSize: "16px" }).setScrollFactor(0);
    this.updateHud();

    // ======================
    // Camera follow + responsive zoom
    // ======================
    this.cameras.main.setBounds(0, 0, this.mapW, this.mapH);
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);

    const w = this.scale.width;
    const zoom = w < 600 ? 2.6 : 2.0;
    this.cameras.main.setZoom(zoom);

    this.scale.on("resize", (gameSize) => {
      const newZoom = gameSize.width < 600 ? 2.6 : 2.0;
      this.cameras.main.setZoom(newZoom);
    });
  }

  // ======================
  // Map helpers
  // ======================
  buildSimpleMap() {
    const wallColor = 0x1b2436;

    // Border walls
    this.addWallRect(0, 0, this.mapW, 40, wallColor);
    this.addWallRect(0, this.mapH - 40, this.mapW, 40, wallColor);
    this.addWallRect(0, 0, 40, this.mapH, wallColor);
    this.addWallRect(this.mapW - 40, 0, 40, this.mapH, wallColor);

    // Obstacles
    this.addWallRect(450, 250, 300, 40, wallColor);
    this.addWallRect(900, 420, 40, 280, wallColor);
    this.addWallRect(1200, 700, 420, 40, wallColor);
    this.addWallRect(650, 820, 280, 40, wallColor);
  }

  addWallRect(x, y, w, h, color) {
    this.add.rectangle(x, y, w, h, color).setOrigin(0);

    const wall = this.walls.create(x + w / 2, y + h / 2, null);
    wall.body.setSize(w, h);
    wall.body.updateFromGameObject();
  }

  update(_, dtMs) {
    const dt = dtMs / 1000;

    // Movement input
    const left = this.cursors.left.isDown || this.wasd.A.isDown;
    const right = this.cursors.right.isDown || this.wasd.D.isDown;
    const up = this.cursors.up.isDown || this.wasd.W.isDown;
    const down = this.cursors.down.isDown || this.wasd.S.isDown;

    const speed = 280;
    let vx = 0,
      vy = 0;

    if (left) vx -= speed;
    if (right) vx += speed;
    if (up) vy -= speed;
    if (down) vy += speed;

    if (vx !== 0 && vy !== 0) {
      const inv = 1 / Math.sqrt(2);
      vx *= inv;
      vy *= inv;
    }

    // Face left/right (even when attacking so the swing faces the right direction)
    if (vx < 0) this.player.setFlipX(true);
    else if (vx > 0) this.player.setFlipX(false);

    // If attacking, lock movement + don't override animation
    if (this.isAttacking) {
      this.player.setVelocity(0, 0);
    } else {
      this.player.setVelocity(vx, vy);

      // Run/idle animation (do NOT restart every frame)
      const moving = vx !== 0 || vy !== 0;
      if (moving) {
        if (!this.player.anims.isPlaying || this.player.anims.currentAnim?.key !== "knight-run") {
          this.player.anims.play("knight-run");
        }
      } else {
        this.player.anims.stop();
        this.player.setFrame(0);
      }
    }

    // Enemies chase player a bit
    this.enemies.getChildren().forEach((e) => {
      this.physics.moveToObject(e, this.player, 95);
    });

    // Attack cooldown
    this.playerStats.attackCooldown = Math.max(0, this.playerStats.attackCooldown - dt);

    // Attack: Space = play attack animation + deal damage during swing
    if (Phaser.Input.Keyboard.JustDown(this.attackKey) && this.playerStats.attackCooldown <= 0) {
      this.playerStats.attackCooldown = 0.55;
      this.playAttack();
    }
  }

  playAttack() {
    if (this.isAttacking) return;

    this.isAttacking = true;
    this.player.setVelocity(0, 0);

    // Play attack animation (must exist from BootScene)
    this.player.anims.play("knight-attack", true);

    // Deal damage near the start of the swing
    this.time.delayedCall(120, () => {
      this.slashAttack();
    });

    // Return to run/idle after animation finishes
    this.player.once(Phaser.Animations.Events.ANIMATION_COMPLETE, (anim) => {
      if (anim?.key !== "knight-attack") return;

      this.isAttacking = false;

      // Snap back to an idle frame so it doesn't look stuck mid-swing
      this.player.anims.stop();
      this.player.setFrame(0);
    });
  }

  spawnEnemy(type, x, y) {
    const e = this.enemies.create(x, y, type).setScale(0.25);
    e.setCollideWorldBounds(true);

    e.hp = type === "maguro" ? 70 : 50;
    e.atk = type === "maguro" ? 12 : 8;
    return e;
  }

  spawnItem(type, x, y) {
    const item = this.items.create(x, y, type).setScale(0.25);
    item.type = type;
    item.setImmovable(true);
    return item;
  }

  slashAttack() {
    // small flash to show attack happened
    this.player.setTint(0xffffff);
    this.time.delayedCall(60, () => this.player.clearTint());

    const radius = 90;
    const atk = this.playerStats.atk;

    this.enemies.getChildren().forEach((enemy) => {
      const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, enemy.x, enemy.y);
      if (d <= radius) {
        enemy.hp -= atk;

        const ang = Phaser.Math.Angle.Between(this.player.x, this.player.y, enemy.x, enemy.y);
        enemy.setVelocity(Math.cos(ang) * 420, Math.sin(ang) * 420);

        if (enemy.hp <= 0) enemy.destroy();
      }
    });

    this.updateHud();
  }

  collectItem(item) {
    if (item.type === "heart") {
      this.playerStats.hp = Math.min(this.playerStats.maxHp, this.playerStats.hp + 25);
    } else if (item.type === "sword") {
      this.playerStats.atk += 5;
    }
    item.destroy();
    this.updateHud();
  }

  damagePlayer(amount) {
    this.playerStats.hp -= amount;
    this.playerStats.hp = Math.max(0, this.playerStats.hp);

    this.player.setTint(0xffaaaa);
    this.time.delayedCall(120, () => this.player.clearTint());

    this.updateHud();

    if (this.playerStats.hp <= 0) this.gameOver();
  }

  updateHud() {
    const { hp, maxHp, atk } = this.playerStats;
    const enemies = this.enemies.countActive(true);
  
    // in-game HUD
    if (this.hud) {
      this.hud.setText(`HP: ${hp}/${maxHp}   ATK: ${atk}   Enemies: ${enemies}`);
  
      if (this.hudBg) {
        // padding around text
        const pad = 24;
        this.hudBg.width = this.hud.width + pad;
        this.hudBg.height = Math.max(this.hud.height + 16, 34);
      }
    }
  
    // send to React page
    const cb = this.game?.registry?.get("onStats");
    if (typeof cb === "function") cb({ hp, maxHp, atk, enemies });
  }

  gameOver() {
    this.physics.pause();
    this.add
      .text(this.player.x, this.player.y - 60, "GAME OVER\nRefresh to try again", {
        fontSize: "28px",
        align: "center",
      })
      .setOrigin(0.5);
  }
}