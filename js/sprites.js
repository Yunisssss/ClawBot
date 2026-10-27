/**
 * CLAWBOT - Pixel Art Sprite Engine
 * Procedurally draws crisp pixel-art plushies, articulated claw, and retro coins
 */

export const SPRITE_TYPES = {
  BEAR: 'bear',
  FOX: 'fox',
  CAT: 'cat',
  PIKACHU: 'pikachu',
};

export const PLUSHIE_CONFIGS = {
  [SPRITE_TYPES.BEAR]: {
    id: SPRITE_TYPES.BEAR,
    name: 'Grizzly Bear',
    width: 44,
    height: 44,
    weight: 1.0,
    mainColor: '#8a5231',
    lightColor: '#b87950',
    darkColor: '#53301a',
  },
  [SPRITE_TYPES.FOX]: {
    id: SPRITE_TYPES.FOX,
    name: 'Red Fox',
    width: 42,
    height: 42,
    weight: 0.85,
    mainColor: '#e36829',
    lightColor: '#fde9dc',
    darkColor: '#93350c',
  },
  [SPRITE_TYPES.CAT]: {
    id: SPRITE_TYPES.CAT,
    name: 'Calico Cat',
    width: 40,
    height: 40,
    weight: 0.8,
    mainColor: '#f7f2ea',
    lightColor: '#eb9b4e',
    darkColor: '#363435',
  },
  [SPRITE_TYPES.PIKACHU]: {
    id: SPRITE_TYPES.PIKACHU,
    name: 'Spark Mouse',
    width: 42,
    height: 42,
    weight: 0.9,
    mainColor: '#fed929',
    lightColor: '#fff59d',
    darkColor: '#cc8e04',
    accentColor: '#e94132',
  },
};

/**
 * Draw a pixel grid onto a 2D canvas context
 */
function drawPixelGrid(ctx, x, y, pixelSize, matrix, colorMap) {
  for (let r = 0; r < matrix.length; r++) {
    for (let c = 0; c < matrix[r].length; c++) {
      const code = matrix[r][c];
      if (code && colorMap[code]) {
        ctx.fillStyle = colorMap[code];
        ctx.fillRect(
          Math.floor(x + c * pixelSize),
          Math.floor(y + r * pixelSize),
          pixelSize,
          pixelSize
        );
      }
    }
  }
}

/**
 * Draw Brown Teddy Bear
 */
export function drawBear(ctx, x, y, size = 44) {
  const p = size / 16;
  ctx.save();
  ctx.translate(x, y);

  const colors = {
    M: '#8a5231', // Main brown
    L: '#b87950', // Light snout/ears
    D: '#4a2b16', // Dark outline/shading
    B: '#1a100b', // Eyes/nose
    W: '#ffffff', // Eye glint
  };
  const M = 'M', L = 'L', D = 'D', B = 'B', W = 'W';

  const grid = [
    [0, D, D, 0, 0, 0, 0, 0, 0, 0, 0, 0, D, D, 0, 0],
    [D, L, L, D, 0, 0, 0, 0, 0, 0, 0, D, L, L, D, 0],
    [D, L, D, 0, D, D, D, D, D, D, 0, 0, D, L, D, 0],
    [0, D, 0, D, M, M, M, M, M, M, D, 0, 0, D, 0, 0],
    [0, 0, D, M, M, M, M, M, M, M, M, D, 0, 0, 0, 0],
    [0, D, M, M, B, M, M, M, M, B, M, M, D, 0, 0, 0],
    [0, D, M, M, W, M, L, L, M, W, M, M, D, 0, 0, 0],
    [0, D, M, M, M, L, B, B, L, M, M, M, D, 0, 0, 0],
    [0, D, M, M, M, L, B, B, L, M, M, M, D, 0, 0, 0],
    [0, 0, D, M, M, M, L, L, M, M, M, D, 0, 0, 0, 0],
    [0, D, M, D, D, M, M, M, M, D, D, M, D, 0, 0, 0],
    [D, M, M, M, M, D, D, D, D, M, M, M, M, D, 0, 0],
    [D, M, M, M, M, M, L, L, M, M, M, M, M, D, 0, 0],
    [0, D, M, M, M, M, L, L, M, M, M, M, D, 0, 0, 0],
    [0, 0, D, D, M, M, M, M, M, M, D, D, 0, 0, 0, 0],
    [0, 0, 0, 0, D, D, D, D, D, D, 0, 0, 0, 0, 0, 0],
  ];

  drawPixelGrid(ctx, -size / 2, -size / 2, p, grid, colors);
  ctx.restore();
}

/**
 * Draw Orange Fox
 */
export function drawFox(ctx, x, y, size = 42) {
  const p = size / 16;
  ctx.save();
  ctx.translate(x, y);

  const colors = {
    O: '#e36829', // Orange body
    W: '#ffffff', // White cheeks & chest
    B: '#1e140d', // Ear tips / eyes / nose
    D: '#93350c', // Dark outline
    L: '#f8a06e', // Light orange
  };
  const O = 'O', W = 'W', B = 'B', D = 'D', L = 'L';

  const grid = [
    [B, B, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, B, B, 0],
    [B, O, B, 0, 0, 0, 0, 0, 0, 0, 0, 0, B, O, B, 0],
    [D, O, O, D, 0, 0, 0, 0, 0, 0, 0, D, O, O, D, 0],
    [D, O, O, O, D, D, D, D, D, D, D, O, O, O, D, 0],
    [0, D, O, O, O, O, O, O, O, O, O, O, O, D, 0, 0],
    [0, D, O, O, B, O, O, O, O, B, O, O, O, D, 0, 0],
    [D, O, O, O, O, O, O, O, O, O, O, O, O, O, D, 0],
    [D, W, W, O, O, O, B, B, O, O, O, W, W, W, D, 0],
    [D, W, W, W, O, B, B, B, B, O, W, W, W, W, D, 0],
    [0, D, W, W, W, W, B, B, W, W, W, W, W, D, 0, 0],
    [0, 0, D, W, W, W, W, W, W, W, W, W, D, 0, 0, 0],
    [0, D, O, O, D, W, W, W, W, D, O, O, D, 0, 0, 0],
    [D, O, O, O, O, D, D, D, D, O, O, O, O, D, 0, 0],
    [D, O, O, O, O, O, W, W, O, O, O, O, O, D, 0, 0],
    [0, D, D, O, O, O, O, O, O, O, O, D, D, 0, 0, 0],
    [0, 0, 0, D, D, D, D, D, D, D, D, 0, 0, 0, 0, 0],
  ];

  drawPixelGrid(ctx, -size / 2, -size / 2, p, grid, colors);
  ctx.restore();
}

/**
 * Draw Calico Cat
 */
export function drawCat(ctx, x, y, size = 40) {
  const p = size / 16;
  ctx.save();
  ctx.translate(x, y);

  const colors = {
    W: '#f8f4ee', // White
    C: '#eb9b4e', // Calico ginger
    B: '#3a3438', // Charcoal patch
    N: '#f08080', // Pink nose
    E: '#262425', // Eyes
    D: '#70646c', // Outline
  };
  const W = 'W', C = 'C', B = 'B', N = 'N', E = 'E', D = 'D';

  const grid = [
    [0, D, D, 0, 0, 0, 0, 0, 0, 0, 0, 0, D, D, 0, 0],
    [D, C, C, D, 0, 0, 0, 0, 0, 0, 0, D, B, B, D, 0],
    [D, N, C, D, 0, 0, 0, 0, 0, 0, 0, D, B, N, D, 0],
    [D, C, C, D, D, D, D, D, D, D, D, D, B, B, D, 0],
    [0, D, C, C, C, W, W, W, W, B, B, B, B, D, 0, 0],
    [0, D, C, C, E, W, W, W, W, E, B, B, B, D, 0, 0],
    [D, W, W, W, W, W, N, N, W, W, W, W, W, W, D, 0],
    [D, W, W, W, W, N, N, N, N, W, W, W, W, W, D, 0],
    [0, D, W, W, W, W, N, N, W, W, W, W, W, D, 0, 0],
    [0, 0, D, D, W, W, W, W, W, W, W, D, D, 0, 0, 0],
    [0, D, W, W, D, D, D, D, D, D, D, W, W, D, 0, 0],
    [D, W, C, C, W, W, W, W, W, W, W, B, B, W, D, 0],
    [D, W, C, C, W, W, W, W, W, W, W, B, B, W, D, 0],
    [0, D, W, W, W, W, W, W, W, W, W, W, W, D, 0, 0],
    [0, 0, D, D, W, W, W, W, W, W, W, D, D, 0, 0, 0],
    [0, 0, 0, 0, D, D, D, D, D, D, D, 0, 0, 0, 0, 0],
  ];

  drawPixelGrid(ctx, -size / 2, -size / 2, p, grid, colors);
  ctx.restore();
}

/**
 * Draw Electric Yellow Mouse (Pikachu-inspired)
 */
export function drawPikachu(ctx, x, y, size = 42) {
  const p = size / 16;
  ctx.save();
  ctx.translate(x, y);

  const colors = {
    Y: '#fed929', // Bright Yellow
    B: '#1a100a', // Black ear tips/eyes
    R: '#ea3827', // Red cheeks
    D: '#8b6703', // Dark yellow/brown outline
    W: '#ffffff', // Eye glint
    L: '#fff39e', // Light shine
  };
  const Y = 'Y', B = 'B', R = 'R', D = 'D', W = 'W', L = 'L';

  const grid = [
    [B, B, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, B, B, 0],
    [B, B, Y, 0, 0, 0, 0, 0, 0, 0, 0, 0, Y, B, B, 0],
    [0, Y, Y, Y, 0, 0, 0, 0, 0, 0, 0, Y, Y, Y, 0, 0],
    [0, D, Y, Y, D, D, D, D, D, D, D, Y, Y, D, 0, 0],
    [0, 0, D, Y, Y, Y, Y, Y, Y, Y, Y, Y, D, 0, 0, 0],
    [0, D, Y, Y, B, Y, Y, Y, Y, B, Y, Y, Y, D, 0, 0],
    [0, D, Y, Y, W, Y, B, B, Y, W, Y, Y, Y, D, 0, 0],
    [D, R, R, Y, Y, Y, B, B, Y, Y, Y, R, R, Y, D, 0],
    [D, R, R, Y, Y, Y, Y, Y, Y, Y, Y, R, R, Y, D, 0],
    [0, D, Y, Y, Y, Y, B, B, Y, Y, Y, Y, Y, D, 0, 0],
    [0, 0, D, Y, Y, Y, Y, Y, Y, Y, Y, Y, D, 0, 0, 0],
    [0, D, Y, Y, D, D, D, D, D, D, D, Y, Y, D, 0, 0],
    [D, Y, Y, Y, Y, Y, Y, Y, Y, Y, Y, Y, Y, Y, D, 0],
    [D, Y, Y, Y, Y, Y, Y, Y, Y, Y, Y, Y, Y, Y, D, 0],
    [0, D, D, Y, Y, Y, Y, Y, Y, Y, Y, D, D, 0, 0, 0],
    [0, 0, 0, D, D, D, D, D, D, D, D, 0, 0, 0, 0, 0],
  ];

  drawPixelGrid(ctx, -size / 2, -size / 2, p, grid, colors);
  ctx.restore();
}

/**
 * Draw Any Plushie by Type
 */
export function drawPlushie(ctx, type, x, y, size = 42) {
  switch (type) {
    case SPRITE_TYPES.BEAR:
      drawBear(ctx, x, y, size);
      break;
    case SPRITE_TYPES.FOX:
      drawFox(ctx, x, y, size);
      break;
    case SPRITE_TYPES.CAT:
      drawCat(ctx, x, y, size);
      break;
    case SPRITE_TYPES.PIKACHU:
      drawPikachu(ctx, x, y, size);
      break;
    default:
      drawBear(ctx, x, y, size);
  }
}

/**
 * Draw the Articulated Claw Machine Mechanism
 * @param {CanvasRenderingContext2D} ctx 
 * @param {number} x - Gantry X coordinate
 * @param {number} y - Claw vertical position
 * @param {number} openAmount - 0.0 (closed) to 1.0 (wide open)
 */
export function drawClaw(ctx, x, y, openAmount = 0.5) {
  ctx.save();
  ctx.translate(x, y);

  // 1. Hanging Cable from Ceiling (y = 0) down to Claw
  ctx.fillStyle = '#222';
  ctx.fillRect(-2, -y + 10, 4, y - 10);
  ctx.fillStyle = '#888';
  ctx.fillRect(-1, -y + 10, 2, y - 10);

  // 2. Gantry Trolley Mount (at top ceiling y = 14)
  ctx.fillStyle = '#4a2c3d';
  ctx.fillRect(-22, -y + 4, 44, 12);
  ctx.fillStyle = '#fed929';
  ctx.fillRect(-18, -y + 6, 36, 4);

  // 3. Central Claw Hub / Housing (Purple + Gold highlight as in mockup)
  ctx.fillStyle = '#3a2030';
  ctx.fillRect(-16, -16, 32, 28);
  
  ctx.fillStyle = '#b67a9c'; // Purple outer frame
  ctx.fillRect(-14, -14, 28, 24);

  ctx.fillStyle = '#eed165'; // Gold accent border
  ctx.fillRect(-10, -10, 20, 16);

  ctx.fillStyle = '#fff4a3'; // Core screen/gem
  ctx.fillRect(-6, -6, 12, 8);

  // 4. Joint Pivots
  const spreadAngle = 0.15 + openAmount * 0.45; // Radians of claw spread

  // Helper to draw curved prong
  function drawProng(side) {
    ctx.save();
    ctx.translate(side * 10, 10);
    ctx.rotate(side * spreadAngle);

    // Upper prong segment
    ctx.fillStyle = '#3a2030';
    ctx.fillRect(-side * 2, 0, 7 * side, 22);
    ctx.fillStyle = '#c78dae';
    ctx.fillRect(-side * 1, 2, 5 * side, 18);

    // Mid joint
    ctx.translate(side * 4, 20);
    ctx.rotate(-side * (spreadAngle * 1.5));

    // Lower prong curved tip
    ctx.fillStyle = '#3a2030';
    ctx.fillRect(-side * 2, 0, 7 * side, 20);
    ctx.fillStyle = '#eed165'; // Gold curved claw tip
    ctx.fillRect(-side * 1, 2, 5 * side, 16);

    // Hook tip inwards
    ctx.translate(-side * 2, 18);
    ctx.fillStyle = '#fff';
    ctx.fillRect(-side * 4, 0, 6 * side, 5);

    ctx.restore();
  }

  // Draw Left and Right Prongs
  drawProng(-1); // Left prong
  drawProng(1);  // Right prong

  ctx.restore();
}
