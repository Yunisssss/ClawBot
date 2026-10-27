/**
 * CLAWBOT - Automata Canvas Renderer
 * Renders state machines (DFA & NFA) with interactive nodes, arrows, and glowing active states
 */

export class AutomataRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.mode = 'DFA'; // 'DFA' or 'NFA'
    this.states = {};
    this.transitions = [];
    this.activeStateIds = new Set();
    this.pulsePhase = 0;

    // Start render loop for smooth glowing pulse
    this.startAnimationLoop();
  }

  setGraph(mode, states, transitions, activeStateIds) {
    this.mode = mode;
    this.states = states;
    this.transitions = transitions;
    this.activeStateIds = new Set(Array.isArray(activeStateIds) ? activeStateIds : [activeStateIds]);
    this.render();
  }

  setActiveStates(activeStateIds) {
    this.activeStateIds = new Set(Array.isArray(activeStateIds) ? activeStateIds : [activeStateIds]);
    this.render();
  }

  startAnimationLoop() {
    const loop = () => {
      this.pulsePhase = (this.pulsePhase + 0.05) % (Math.PI * 2);
      this.render();
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  render() {
    const { ctx, canvas } = this;
    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    // 1. Screen Backdrop
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#91687f');
    grad.addColorStop(1, '#6b455b');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Subtle pixel grid background
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 16) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += 16) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // 2. Draw Directed Transitions (Edges & Arrows)
    this.transitions.forEach(trans => {
      const fromNode = this.states[trans.from];
      const toNode = this.states[trans.to];
      if (!fromNode || !toNode) return;

      const isEdgeActive = this.activeStateIds.has(trans.from) && this.activeStateIds.has(trans.to);
      this.drawArrow(fromNode, toNode, trans, isEdgeActive);
    });

    // 3. Draw State Nodes
    Object.values(this.states).forEach(state => {
      const isActive = this.activeStateIds.has(state.id);
      this.drawNode(state, isActive);
    });
  }

  drawNode(state, isActive) {
    const { ctx } = this;
    const radius = 24;
    const x = state.x;
    const y = state.y;

    ctx.save();

    // Pulse effect if active
    if (isActive) {
      const glowAlpha = 0.35 + Math.sin(this.pulsePhase) * 0.25;
      ctx.beginPath();
      ctx.arc(x, y, radius + 7, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 222, 60, ${glowAlpha})`;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(x, y, radius + 3, 0, Math.PI * 2);
      ctx.strokeStyle = '#ffe600';
      ctx.lineWidth = 2.5;
      ctx.stroke();
    }

    // Main Circle Body
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = isActive ? '#ffe600' : '#452637';
    ctx.fill();
    ctx.strokeStyle = isActive ? '#24121b' : '#ffc0dd';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Accepting/Final State Double Circle
    if (state.isFinal) {
      ctx.beginPath();
      ctx.arc(x, y, radius - 4, 0, Math.PI * 2);
      ctx.strokeStyle = isActive ? '#785b00' : '#ffc0dd';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    // State Label (e.g. q0, s1)
    ctx.font = 'bold 8.5px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = isActive ? '#1e1117' : '#fff';
    ctx.fillText(state.id.toUpperCase(), x, y - 1);

    // State Name Below Node
    ctx.font = '6px "Press Start 2P", monospace';
    ctx.fillStyle = isActive ? '#ffe600' : '#ebd4e2';
    ctx.fillText(state.name, x, y + radius + 11);

    ctx.restore();
  }

  drawArrow(from, to, trans, isHighlighted) {
    const { ctx } = this;
    const radius = 25;

    ctx.save();
    ctx.strokeStyle = isHighlighted ? '#ffe600' : 'rgba(255, 220, 240, 0.45)';
    ctx.fillStyle = ctx.strokeStyle;
    ctx.lineWidth = isHighlighted ? 2.5 : 1.5;

    // Self Loop
    if (from.id === to.id || trans.isSelfLoop) {
      const loopRadius = 14;
      const loopY = from.y - radius - loopRadius + 2;

      ctx.beginPath();
      ctx.arc(from.x, loopY, loopRadius, 0.3 * Math.PI, 1.7 * Math.PI);
      ctx.stroke();

      // Arrowhead
      this.drawArrowhead(from.x + 8, from.y - radius, Math.PI * 0.7);

      // Label
      ctx.font = '6px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(trans.symbol, from.x, loopY - loopRadius - 3);
      ctx.restore();
      return;
    }

    // Directed Line Between Distinct Nodes
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx);

    // Start point outside source node, end point outside target node
    const startX = from.x + Math.cos(angle) * radius;
    const startY = from.y + Math.sin(angle) * radius;
    const endX = to.x - Math.cos(angle) * (radius + 2);
    const endY = to.y - Math.sin(angle) * (radius + 2);

    // If reverse edge exists or nodes are horizontal neighbors in a cycle, add curve
    const isCurved = (from.y === to.y && Math.abs(dx) > 130) || (from.y !== to.y && dx !== 0);

    ctx.beginPath();
    if (!isCurved) {
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.stroke();

      this.drawArrowhead(endX, endY, angle);

      // Symbol Label
      const midX = (startX + endX) / 2;
      const midY = (startY + endY) / 2 - 7;
      ctx.font = '6px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(trans.symbol, midX, midY);
    } else {
      // Quadratic Curve
      const midX = (startX + endX) / 2 + (dy > 0 ? 20 : -20);
      const midY = (startY + endY) / 2 + (dx > 0 ? 20 : -20);

      ctx.moveTo(startX, startY);
      ctx.quadraticCurveTo(midX, midY, endX, endY);
      ctx.stroke();

      const curveAngle = Math.atan2(endY - midY, endX - midX);
      this.drawArrowhead(endX, endY, curveAngle);

      ctx.font = '5.5px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(trans.symbol, midX, midY - 6);
    }

    ctx.restore();
  }

  drawArrowhead(x, y, angle) {
    const { ctx } = this;
    const headLen = 7;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(
      x - headLen * Math.cos(angle - Math.PI / 6),
      y - headLen * Math.sin(angle - Math.PI / 6)
    );
    ctx.lineTo(
      x - headLen * Math.cos(angle + Math.PI / 6),
      y - headLen * Math.sin(angle + Math.PI / 6)
    );
    ctx.closePath();
    ctx.fill();
  }
}
