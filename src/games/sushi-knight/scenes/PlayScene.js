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
    // Tilemap (JSON)
    // ======================
    const map = this.make.tilemap({ key: "level1" });

    const tileset = map.addTilesetImage("summer_tileset", "summer_tiles", 32, 32, 0, 0);

    const groundLayer = map.createLayer("Ground", tileset, 0, 0);
    const propsLayer = map.createLayer("Props", tileset, 0, 0);
    propsLayer.setDepth(10);

    this.mapW = map.widthInPixels;
    this.mapH = map.heightInPixels;

    this.physics.world.setBounds(0, 0, this.mapW, this.mapH);
    this.cameras.main.setBounds(0, 0, this.mapW, this.mapH);

    // Only props block movement
    propsLayer.setCollisionByProperty({ collides: true });

    // ======================
    // Player stats
    // ======================
    this.playerStats = {
      hp: 100,
      maxHp: 100,
      atk: 20,
      attackCooldown: 0,
    };

    this.isAttacking = false;

    // ======================
    // Player
    // ======================
    this.player = this.physics.add.sprite(220, 240, "knight").setScale(0.85);
    this.player.setCollideWorldBounds(true);
    this.player.setDrag(1400, 1400);
    this.player.setMaxVelocity(280, 280);

    this.physics.add.collider(this.player, propsLayer);

    // ======================
    // Enemies
    // ======================
    this.enemies = this.physics.add.group();

    // ======================
    // Items (FIXED): use staticGroup + refreshBody + smaller hitbox
    // ======================
    this.items = this.physics.add.staticGroup();

    // ======================
    // Enemy projectiles + hazards
    // ======================
    this.enemyProjectiles = this.physics.add.group({
      allowGravity: false,
      immovable: true,
    });

    this.hazards = this.physics.add.staticGroup();

    // Spawn enemies
    this.spawnEnemy("tamago", 1200, 300);
    this.spawnEnemy("tamago", 1100, 900);
    this.spawnEnemy("tamago", 1100, 800);
    this.spawnEnemy("tamago", 1100, 700);
    this.spawnEnemy("tamago", 1100, 600);
    this.spawnEnemy("tamago", 1100, 500);

    this.spawnEnemy("maguro", 1500, 700);
    this.spawnEnemy("maguro", 1500, 600);
    this.spawnEnemy("maguro", 1500, 500);
    this.spawnEnemy("maguro", 1500, 400);
    

    this.physics.add.collider(this.enemies, propsLayer);
    this.physics.add.collider(this.enemies, this.enemies);

    // Items
    this.spawnItem("heart", 520, 520);
    this.spawnItem("sword", 820, 650);
    this.spawnItem("sword", 820, 1000);
    this.spawnItem("heart", 1100, 520);

    // ======================
    // Input (Desktop)
    // ======================
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys("W,A,S,D");
    this.attackKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // ======================
    // Input (Mobile) - drag to move, tap to attack
    // ======================
    this.isMobile =
      this.sys.game.device.input.touch ||
      this.sys.game.device.os.android ||
      this.sys.game.device.os.iOS;

    this.drag = {
      movePointerId: null,
      startX: 0,
      startY: 0,
      vx: 0,
      vy: 0,
      active: false,
      moved: false,
      startTime: 0,
    };

    this.TAP_MAX_MS = 200;
    this.TAP_MAX_MOVE_PX = 12;
    this.DRAG_DEADZONE_PX = 10;
    this.DRAG_MAX_PX = 80;

    if (this.isMobile) {
      this.input.addPointer(2);

      this.input.on("pointerdown", (p) => {
        if (this.drag.movePointerId === null) {
          this.drag.movePointerId = p.id;
          this.drag.startX = p.x;
          this.drag.startY = p.y;
          this.drag.vx = 0;
          this.drag.vy = 0;
          this.drag.active = true;
          this.drag.moved = false;
          this.drag.startTime = this.time.now;
          return;
        }

        this.tryAttack();
      });

      this.input.on("pointermove", (p) => {
        if (this.drag.movePointerId !== p.id) return;

        const dx = p.x - this.drag.startX;
        const dy = p.y - this.drag.startY;

        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > this.DRAG_DEADZONE_PX) this.drag.moved = true;

        const clamped = Math.min(dist, this.DRAG_MAX_PX);
        const len = dist || 1;

        const nx = (dx / len) * (clamped / this.DRAG_MAX_PX);
        const ny = (dy / len) * (clamped / this.DRAG_MAX_PX);

        this.drag.vx = nx;
        this.drag.vy = ny;
      });

      this.input.on("pointerup", (p) => {
        if (this.drag.movePointerId !== p.id) return;

        const elapsed = this.time.now - this.drag.startTime;

        if (!this.drag.moved && elapsed <= this.TAP_MAX_MS) {
          this.tryAttack();
        }

        this.drag.movePointerId = null;
        this.drag.active = false;
        this.drag.vx = 0;
        this.drag.vy = 0;
        this.drag.moved = false;
      });
    }

    // ======================
    // Animations: Maguro attack (3 separate images)
    // Requires asset keys: "maguroAtk1","maguroAtk2","maguroAtk3"
    // ======================
    if (!this.anims.exists("maguro-attack")) {
      this.anims.create({
        key: "maguro-attack",
        frames: [{ key: "maguroAtk1" }, { key: "maguroAtk2" }, { key: "maguroAtk3" }],
        frameRate: 10,
        repeat: 0,
      });
    }

    // spawn protection
    this.playerInvulnUntil = this.time.now + 1000;

    // ======================
    // Contact damage:
    // - Tamago: ranged only (no contact damage)
    // - Maguro: ONLY damages during its attack hit window (enemy.hitActive)
    // ======================
    this.physics.add.overlap(this.player, this.enemies, (_, enemy) => {
      if (!enemy?.active) return;
      if (enemy?.type === "tamago") return;

      if (this.playerInvulnUntil && this.time.now < this.playerInvulnUntil) return;

      if (enemy.type === "maguro") {
        if (!enemy.hitActive) return;
      } else {
        const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, enemy.x, enemy.y);
        if (d > 28) return;
      }

      this.damagePlayer(10);
      this.playerInvulnUntil = this.time.now + 500;

      const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, this.player.x, this.player.y);
      this.player.setVelocity(Math.cos(angle) * 380, Math.sin(angle) * 380);
    });

    // ======================
    // Hazard damage: step into rotten puddle
    // ======================
    this.physics.add.overlap(this.player, this.hazards, (_, hazard) => {
      if (this.playerInvulnUntil && this.time.now < this.playerInvulnUntil) return;

      const dmg = hazard.getData("damage") ?? 8;
      this.damagePlayer(dmg);

      this.playerInvulnUntil = this.time.now + 450;
    });

    // ======================
    // Pickup items (FIXED): also require true proximity
    // ======================
    this.physics.add.overlap(this.player, this.items, (_, item) => {
      const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, item.x, item.y);
      if (d > 26) return; // tweak 20–34
      this.collectItem(item);
    });

    // ======================
    // HUD
    // ======================
    this.hudBg = this.add
      .rectangle(12, 12, 340, 34, 0x000000, 0.45)
      .setOrigin(0)
      .setScrollFactor(0)
      .setDepth(1000);

    this.hud = this.add
      .text(20, 18, "", { fontSize: "16px" })
      .setScrollFactor(0)
      .setDepth(1001);

    this.updateHud();

    // ======================
    // Camera follow + responsive zoom
    // ======================
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);

    const setZoomForWidth = (width) => (width < 600 ? 2.6 : 2.0);
    this.cameras.main.setZoom(setZoomForWidth(this.scale.width));

    this.scale.on("resize", (gameSize) => {
      this.cameras.main.setZoom(setZoomForWidth(gameSize.width));
    });
  }

  // ======================
  // Main update
  // ======================
  update(_, dtMs) {
    const dt = dtMs / 1000;

    const speed = 280;
    let vx = 0;
    let vy = 0;

    // Desktop movement
    const left = this.cursors.left.isDown || this.wasd.A.isDown;
    const right = this.cursors.right.isDown || this.wasd.D.isDown;
    const up = this.cursors.up.isDown || this.wasd.W.isDown;
    const down = this.cursors.down.isDown || this.wasd.S.isDown;

    if (left) vx -= speed;
    if (right) vx += speed;
    if (up) vy -= speed;
    if (down) vy += speed;

    // Mobile overrides with drag
    if (this.isMobile && this.drag.active) {
      vx = this.drag.vx * speed;
      vy = this.drag.vy * speed;
    }

    // diagonal normalize for desktop only
    if (!this.isMobile && vx !== 0 && vy !== 0) {
      const inv = 1 / Math.sqrt(2);
      vx *= inv;
      vy *= inv;
    }

    if (vx < 0) this.player.setFlipX(true);
    else if (vx > 0) this.player.setFlipX(false);

    if (this.isAttacking) {
      this.player.setVelocity(0, 0);
    } else {
      this.player.setVelocity(vx, vy);

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

    // ======================
    // Enemy AI
    // ======================
    this.enemies.getChildren().forEach((e) => {
      if (!e.active) return;

      if (e.type === "maguro") {
        if (e.attackCooldown === undefined) e.attackCooldown = 0;
        if (e.isAttacking === undefined) e.isAttacking = false;
        if (e.hitActive === undefined) e.hitActive = false;

        if (e.baseDisplayW === undefined) e.baseDisplayW = e.displayWidth;
        if (e.baseDisplayH === undefined) e.baseDisplayH = e.displayHeight;

        e.attackCooldown = Math.max(0, e.attackCooldown - dt);

        const dist = Phaser.Math.Distance.Between(e.x, e.y, this.player.x, this.player.y);

        if (e.isAttacking) {
          e.setVelocity(0, 0);
          if (e.baseDisplayW && e.baseDisplayH) e.setDisplaySize(e.baseDisplayW, e.baseDisplayH);
          return;
        }

        // chase until actually in attack range
        const attackStartRange = 52;

        if (dist > attackStartRange) {
          this.physics.moveToObject(e, this.player, 95);
        } else {
          e.setVelocity(0, 0);
          if (e.attackCooldown <= 0) this.maguroAttack(e);
        }
      } else if (e.type === "tamago") {
        // Tamago chases so puddles land more relevant to player position
        this.physics.moveToObject(e, this.player, 75);
      } else {
        this.physics.moveToObject(e, this.player, 95);
      }
    });

    // Player attack cooldown
    this.playerStats.attackCooldown = Math.max(0, this.playerStats.attackCooldown - dt);

    // Desktop attack
    if (Phaser.Input.Keyboard.JustDown(this.attackKey)) this.tryAttack();
  }

  tryAttack() {
    if (this.playerStats.attackCooldown > 0) return;
    this.playerStats.attackCooldown = 0.55;
    this.playAttack();
  }

  playAttack() {
    if (this.isAttacking) return;

    this.isAttacking = true;
    this.player.setVelocity(0, 0);

    this.player.anims.play("knight-attack", true);
    this.time.delayedCall(120, () => this.slashAttack());

    this.player.once(Phaser.Animations.Events.ANIMATION_COMPLETE, (anim) => {
      if (anim?.key !== "knight-attack") return;
      this.isAttacking = false;
      this.player.anims.stop();
      this.player.setFrame(0);
    });
  }

  spawnEnemy(type, x, y) {
    const e = this.enemies.create(x, y, type).setScale(0.25);
    e.setCollideWorldBounds(true);

    e.type = type;
    e.hp = type === "maguro" ? 70 : 50;
    e.atk = type === "maguro" ? 12 : 8;

    if (type === "maguro") {
      e.baseDisplayW = e.displayWidth;
      e.baseDisplayH = e.displayHeight;
    }

    // Tamago spits rotten eggs
    if (type === "tamago") {
      e.spitEvent = this.time.addEvent({
        delay: Phaser.Math.Between(1200, 1900),
        loop: true,
        callback: () => this.tamagoSpit(e),
      });

      e.on("destroy", () => {
        if (e.spitEvent) e.spitEvent.remove(false);
      });
    }

    return e;
  }

  // ======================
  // Items (FIXED): static body refresh + smaller hitbox
  // ======================
  spawnItem(type, x, y) {
    const item = this.items.create(x, y, type).setScale(0.25);
    item.type = type;

    // IMPORTANT: static bodies do NOT auto-resize when you scale
    item.refreshBody();

    // shrink pickup hitbox so you must be close
    if (item.body) {
      const w = item.displayWidth * 0.55;
      const h = item.displayHeight * 0.55;

      item.body.setSize(w, h);
      item.body.setOffset((item.displayWidth - w) / 2, (item.displayHeight - h) / 2);

      item.refreshBody();
    }

    return item;
  }

  slashAttack() {
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

  // ======================
  // Maguro attack (animation + hit window) + size lock
  // ======================
  maguroAttack(enemy) {
    enemy.isAttacking = true;
    enemy.hitActive = false;
    enemy.attackCooldown = 1.2;

    enemy.setFlipX(this.player.x < enemy.x);

    if (enemy.baseDisplayW && enemy.baseDisplayH) {
      enemy.setDisplaySize(enemy.baseDisplayW, enemy.baseDisplayH);
    }

    enemy.anims.play("maguro-attack", true);

    this.time.delayedCall(140, () => {
      if (!enemy.active) return;
      if (enemy.baseDisplayW && enemy.baseDisplayH) {
        enemy.setDisplaySize(enemy.baseDisplayW, enemy.baseDisplayH);
      }
      enemy.hitActive = true;

      this.time.delayedCall(140, () => {
        if (!enemy.active) return;
        if (enemy.baseDisplayW && enemy.baseDisplayH) {
          enemy.setDisplaySize(enemy.baseDisplayW, enemy.baseDisplayH);
        }
        enemy.hitActive = false;
      });
    });

    const finish = () => {
      if (!enemy.active) return;
      enemy.isAttacking = false;
      enemy.hitActive = false;

      enemy.setTexture("maguro");

      if (enemy.baseDisplayW && enemy.baseDisplayH) {
        enemy.setDisplaySize(enemy.baseDisplayW, enemy.baseDisplayH);
      }
    };

    enemy.once(Phaser.Animations.Events.ANIMATION_COMPLETE_KEY + "maguro-attack", finish);

    // shorter lock so maguro resumes chasing sooner
    this.time.delayedCall(320, finish);
  }

  // ======================
  // Tamago spit: aim at player's CURRENT position
  // ======================
  tamagoSpit(tamago) {
    if (!tamago?.active) return;
    if (!this.player?.active) return;

    const dist = Phaser.Math.Distance.Between(tamago.x, tamago.y, this.player.x, this.player.y);
    if (dist > 520) return;

    const targetX = this.player.x;
    const targetY = this.player.y;

    const dir = new Phaser.Math.Vector2(targetX - tamago.x, targetY - tamago.y);
    if (dir.lengthSq() < 1) return;

    const distanceToTarget = dir.length();
    dir.normalize();

    // small spread so it doesn't feel perfect
    dir.rotate(Phaser.Math.FloatBetween(-0.18, 0.18));

    const egg = this.enemyProjectiles.get(tamago.x, tamago.y, "rottenEgg");
    if (!egg) return;

    egg.setActive(true).setVisible(true);
    egg.body.enable = true;

    egg.setDepth(12);
    egg.setScale(0.05);

    const speed = 220;
    egg.setVelocity(dir.x * speed, dir.y * speed);

    const flightMs = Phaser.Math.Clamp((distanceToTarget / speed) * 1000, 180, 650);

    this.time.delayedCall(flightMs, () => {
      if (!egg.active) return;

      const landX = egg.x;
      const landY = egg.y;

      egg.setVelocity(0, 0);
      egg.body.enable = false;
      egg.setActive(false).setVisible(false);

      this.spawnRottenPuddle(landX, landY);
    });
  }

  spawnRottenPuddle(x, y) {
    const puddle = this.hazards.create(x, y, "rottenPuddle");

    puddle.setDepth(5);
    puddle.setScale(0.05);
    puddle.setData("damage", 8);

    // IMPORTANT: static bodies do NOT auto-resize when you scale
    puddle.refreshBody();

    // shrink hitbox
    if (puddle.body) {
      const w = puddle.displayWidth * 0.6;
      const h = puddle.displayHeight * 0.6;

      puddle.body.setSize(w, h);
      puddle.body.setOffset((puddle.displayWidth - w) / 2, (puddle.displayHeight - h) / 2);

      puddle.refreshBody();
    }

    this.time.delayedCall(4500, () => {
      if (puddle.active) puddle.destroy();
    });
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
    this.playerStats.hp = Math.max(0, this.playerStats.hp - amount);

    this.player.setTint(0xffaaaa);
    this.time.delayedCall(120, () => this.player.clearTint());

    this.updateHud();

    if (this.playerStats.hp <= 0) this.gameOver();
  }

  updateHud() {
    const { hp, maxHp, atk } = this.playerStats;
    const enemies = this.enemies.countActive(true);

    if (this.hud) {
      this.hud.setText(`HP: ${hp}/${maxHp}   ATK: ${atk}   Enemies: ${enemies}`);

      if (this.hudBg) {
        const pad = 24;
        this.hudBg.width = this.hud.width + pad;
        this.hudBg.height = Math.max(this.hud.height + 16, 34);
      }
    }

    const cb = this.onStats || this.game?.registry?.get("onStats");
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