/**
 * CLAWBOT - Claw Machine Physics & Simulation Engine
 */

import { drawClaw, drawPlushie, SPRITE_TYPES, PLUSHIE_CONFIGS } from './sprites.js?v=2';
import { sound } from './audio.js?v=2';

export class ClawMachine {
  constructor(canvas, dfaEngine, nfaEngine, onPrizeWon, onTimerUpdate) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.dfa = dfaEngine;
    this.nfa = nfaEngine;
    this.onPrizeWon = onPrizeWon;
    this.onTimerUpdate = onTimerUpdate;

    // Arena dimensions (synced to canvas element)
    this.width = canvas.width;
    this.height = canvas.height;

    // Gantry & Claw position
    this.homeX = 46;
    this.homeY = 32;
    this.clawX = 260;
    this.clawY = 32;
    this.clawOpen = 0.6; // 0 (closed) to 1 (wide)
    this.targetOpen = 0.6;

    // Motion parameters
    this.moveSpeed = 2.8;
    this.dropSpeed = 3.2;
    this.ascendSpeed = 2.4;
    this.returnSpeed = 2.8;

    // Game state & mechanics
    this.status = 'IDLE'; // IDLE, READY, AIMING, DROPPING, GRABBING, ASCENDING, RETURNING, EVALUATION
    this.coins = 5;
    this.unliCoins = false;
    this.boostChance = false;

    // Countdown Timer (20 seconds)
    this.timerSeconds = 20;
    this.timerInterval = null;

    // Caught prize payload
    this.heldPlushie = null;
    this.isGrabFirm = false;
    this.fallingPrize = null;
    this.particles = [];

    // Plushie pile in bottom right container
    this.plushies = [];
    this.initPlushiePile();

    // Start Animation Loop
    this.lastTime = performance.now();
    this.runLoop();
  }

  startTimer() {
    this.stopTimer();
    this.timerSeconds = 20;
    if (this.onTimerUpdate) this.onTimerUpdate(this.timerSeconds);

    this.timerInterval = setInterval(() => {
      this.timerSeconds--;
      if (this.onTimerUpdate) this.onTimerUpdate(this.timerSeconds);

      if (this.timerSeconds <= 0) {
        this.stopTimer();
        // Time ran out! Auto drop claw
        if (this.status === 'READY' || this.status === 'AIMING') {
          this.dropClaw();
        }
      }
    }, 1000);
  }

  stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  resetTimer() {
    this.stopTimer();
    this.timerSeconds = 20;
    if (this.onTimerUpdate) this.onTimerUpdate(this.timerSeconds);
  }

  initPlushiePile() {
    this.plushies = [];
    const types = [
      SPRITE_TYPES.BEAR,
      SPRITE_TYPES.FOX,
      SPRITE_TYPES.CAT,
      SPRITE_TYPES.PIKACHU,
    ];

    // Create a rich cozy heap of plushies across prize floor (x: 105 to 640)
    const count = 22;
    for (let i = 0; i < count; i++) {
      const type = types[i % types.length];
      const x = 115 + (i / count) * 510 + (Math.random() * 20 - 10);
      const y = 390 + (Math.sin(i * 1.5) * 14);
      this.plushies.push({
        id: `plushie_${Date.now()}_${i}`,
        type,
        x,
        y,
        baseY: y,
        rotation: (Math.random() - 0.5) * 0.3,
        size: 46,
      });
    }
  }

  insertCoin() {
    if (this.status !== 'IDLE') return false;

    if (!this.unliCoins && this.coins <= 0) {
      return false;
    }

    if (!this.unliCoins) {
      this.coins--;
    }

    sound.playCoin();
    this.status = 'READY';
    this.startTimer();
    this.dfa.transition('COIN [C]');
    return true;
  }

  move(dirX, dirY) {
    if (this.status !== 'READY' && this.status !== 'AIMING') return;

    if (this.status === 'READY') {
      this.status = 'AIMING';
      this.dfa.transition('MOVE [WASD]');
    }

    // Move gantry within play boundary
    const minX = 96;
    const maxX = 640;
    const minY = 28;
    const maxY = 55;

    this.clawX = Math.max(minX, Math.min(maxX, this.clawX + dirX * this.moveSpeed));
    this.clawY = Math.max(minY, Math.min(maxY, this.clawY + dirY * this.moveSpeed));

    sound.playMove();
  }

  dropClaw() {
    if (this.status !== 'READY' && this.status !== 'AIMING') return false;

    this.stopTimer();
    this.status = 'DROPPING';
    this.targetOpen = 0.95; // open wide on drop
    sound.playDrop();
    this.dfa.transition('DROP [Enter]');
    return true;
  }

  update(dt) {
    // 1. Smooth claw open/close animation
    this.clawOpen += (this.targetOpen - this.clawOpen) * 0.14;

    // 2. Update status state machine
    if (this.status === 'DROPPING') {
      this.clawY += this.dropSpeed;
      // Check collision with prize bed or floor (around y = 385)
      if (this.clawY >= 385) {
        this.clawY = 385;
        this.status = 'GRABBING';
        this.targetOpen = 0.1; // clamp claws shut
        sound.playGrab();
        this.dfa.transition('BOTTOM_TOUCH');
        this.grabTimer = 35; // wait frames before ascending
      }
    } else if (this.status === 'GRABBING') {
      this.grabTimer--;
      if (this.grabTimer <= 0) {
        // Evaluate plushie grab collision
        this.evaluateGrab();
        this.status = 'ASCENDING';
        this.dfa.transition('GRAB_DONE');
      }
    } else if (this.status === 'ASCENDING') {
      this.clawY -= this.ascendSpeed;

      // Keep held plushie synced with claw
      if (this.heldPlushie) {
        this.heldPlushie.x = this.clawX;
        this.heldPlushie.y = this.clawY + 28;

        // Check if firm or slippery grip
        if (!this.isGrabFirm && this.clawY < 200) {
          // Prize slips out!
          this.slipPrize();
        }
      }

      if (this.clawY <= this.homeY) {
        this.clawY = this.homeY;
        this.status = 'RETURNING';
        this.dfa.transition('TOP_LIMIT');
      }
    } else if (this.status === 'RETURNING') {
      // Move gantry horizontally back to Chute (homeX = 46)
      if (this.clawX > this.homeX) {
        this.clawX = Math.max(this.homeX, this.clawX - this.returnSpeed);
        if (this.heldPlushie) {
          this.heldPlushie.x = this.clawX;
        }
      } else {
        this.status = 'EVALUATION';
        this.dfa.transition('CHUTE_REACHED');
        this.evalTimer = 30;
      }
    } else if (this.status === 'EVALUATION') {
      this.evalTimer--;
      if (this.evalTimer === 15) {
        // Open claw to release prize into chute
        this.targetOpen = 0.8;
        if (this.heldPlushie) {
          // Prize drops into chute!
          this.fallingPrize = this.heldPlushie;
          this.heldPlushie = null;
        }
      } else if (this.evalTimer <= 0) {
        this.status = 'IDLE';
        this.resetTimer();
        this.dfa.transition('RESET');
        this.targetOpen = 0.6;
      }
    }

    // 3. Falling prize animation (down into the chute)
    if (this.fallingPrize) {
      this.fallingPrize.y += 4.5;
      if (this.fallingPrize.y > this.height + 20) {
        // Won! Trigger callback
        sound.playWin();
        this.spawnCelebrationParticles(this.homeX, 390);
        if (this.onPrizeWon) {
          this.onPrizeWon(this.fallingPrize.type);
        }
        // Respawn a new plushie on the pile to keep it replenished
        this.respawnPlushie();
        this.fallingPrize = null;
      }
    }

    // 4. Update particles
    this.particles = this.particles.filter(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.15; // gravity
      p.life -= 0.02;
      return p.life > 0;
    });
  }

  evaluateGrab() {
    // Find closest plushie to claw tip (clawX, clawY + 20)
    let closest = null;
    let minDist = 46;

    this.plushies.forEach(p => {
      const dist = Math.hypot(p.x - this.clawX, p.y - (this.clawY + 24));
      if (dist < minDist) {
        minDist = dist;
        closest = p;
      }
    });

    if (closest) {
      this.heldPlushie = closest;
      // Calculate grip probability
      const baseChance = 0.80; // 80% normal chance
      const finalChance = this.boostChance ? Math.min(0.98, baseChance + 0.15) : baseChance;
      this.isGrabFirm = Math.random() < finalChance;
    } else {
      this.heldPlushie = null;
      this.isGrabFirm = false;
    }
  }

  slipPrize() {
    if (!this.heldPlushie) return;
    sound.playMiss();
    const slipped = this.heldPlushie;
    this.heldPlushie = null;
    this.targetOpen = 0.7; // claw jerks open

    // Animate plushie tumbling back down to pile
    const fallInterval = setInterval(() => {
      slipped.y += 5;
      if (slipped.y >= slipped.baseY) {
        slipped.y = slipped.baseY;
        clearInterval(fallInterval);
      }
    }, 20);
  }

  respawnPlushie() {
    const types = [SPRITE_TYPES.BEAR, SPRITE_TYPES.FOX, SPRITE_TYPES.CAT, SPRITE_TYPES.PIKACHU];
    const type = types[Math.floor(Math.random() * types.length)];
    const x = 120 + Math.random() * 480;
    const y = 390 + (Math.random() * 12 - 6);
    this.plushies.push({
      id: `plushie_${Date.now()}`,
      type,
      x,
      y,
      baseY: y,
      rotation: (Math.random() - 0.5) * 0.3,
      size: 46,
    });
  }

  spawnCelebrationParticles(x, y) {
    const colors = ['#ffe600', '#ff5a5f', '#5bc4ff', '#ffffff', '#ff99dd'];
    for (let i = 0; i < 30; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 4.5;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 3.5 + Math.random() * 3,
        life: 1.0,
      });
    }
  }

  render() {
    const { ctx, width, height } = this;
    ctx.clearRect(0, 0, width, height);

    // 1. Arcade cabinet interior background
    ctx.fillStyle = '#6e7075';
    ctx.fillRect(0, 0, width, height);

    // Subtle backdrop depth lines
    ctx.strokeStyle = '#57595e';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(40, 40);
    ctx.moveTo(width, 0);
    ctx.lineTo(width - 40, 40);
    ctx.moveTo(40, 40);
    ctx.lineTo(width - 40, 40);
    ctx.stroke();

    // 2. Chute Box (Bottom Left: completely flush with bottom edge)
    const chuteH = 90;
    const chuteY = height - chuteH;
    ctx.fillStyle = '#261b23';
    ctx.fillRect(4, chuteY, 84, chuteH);
    ctx.fillStyle = '#150d12';
    ctx.fillRect(10, chuteY + 8, 72, chuteH - 8);

    // 3. Draw Plushies on the floor
    this.plushies.forEach(p => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      drawPlushie(ctx, p.type, 0, 0, p.size);
      ctx.restore();
    });

    // 4. Draw Falling Prize (into chute)
    if (this.fallingPrize) {
      drawPlushie(ctx, this.fallingPrize.type, this.fallingPrize.x, this.fallingPrize.y, 46);
    }

    // 5. Draw Claw Mechanism (Gantry, Cable, Claws)
    drawClaw(ctx, this.clawX, this.clawY, this.clawOpen);

    // 6. Draw Celebration Particles
    this.particles.forEach(p => {
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.life;
      ctx.fillRect(p.x, p.y, p.size, p.size);
    });
    ctx.globalAlpha = 1.0;
  }

  runLoop() {
    const now = performance.now();
    const dt = (now - this.lastTime) / 1000;
    this.lastTime = now;

    this.update(dt);
    this.render();

    requestAnimationFrame(() => this.runLoop());
  }
}
