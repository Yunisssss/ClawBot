/**
 * CLAWBOT - Main Game Controller & UI Orchestrator
 */

import { DFAEngine, DFA_STATES, DFA_TRANSITIONS } from './dfaEngine.js';
import { NFAEngine, NFA_STATES, NFA_TRANSITIONS } from './nfaEngine.js';
import { AutomataRenderer } from './automataRenderer.js';
import { ClawMachine } from './clawMachine.js';
import { CollectionShelf } from './collectionShelf.js';
import { sound } from './audio.js';

class App {
  constructor() {
    this.mode = 'DFA'; // 'DFA' or 'NFA'
    
    // DOM Elements
    this.modeBadge = document.getElementById('mode-badge');
    this.modeBadgeText = document.getElementById('mode-badge-text');
    this.automataTypeTitle = document.getElementById('automata-type-title');
    this.automataSubtitle = document.getElementById('automata-subtitle');
    this.automataContentArea = document.getElementById('automata-content-area');
    this.cheatsPanel = document.getElementById('cheats-panel');
    this.activeStateDisplay = document.getElementById('active-state-display');
    this.stateRuleDisplay = document.getElementById('state-rule-display');
    this.coinsContainer = document.getElementById('coins-container');
    this.cheatActionText = document.getElementById('cheat-action-text');
    this.toggleUnliCoin = document.getElementById('toggle-unli-coin');
    this.toggleBoostChance = document.getElementById('toggle-boost-chance');
    this.catchRateStat = document.getElementById('catch-rate-stat');

    // Decorative Ledge Joystick Knob
    this.ledgeJoystickKnob = document.getElementById('ledge-joystick-knob');

    // Virtual Buttons
    this.btnUp = document.getElementById('btn-up');
    this.btnDown = document.getElementById('btn-down');
    this.btnLeft = document.getElementById('btn-left');
    this.btnRight = document.getElementById('btn-right');
    this.btnDrop = document.getElementById('btn-drop');
    this.btnInsertCoin = document.getElementById('btn-insert-coin');
    this.btnCheatToggle = document.getElementById('btn-cheat-toggle');

    // Initialize Subsystems
    this.initAutomata();
    this.initGame();
    this.initControls();
    this.updateCoinsDisplay();
  }

  initAutomata() {
    const automataCanvas = document.getElementById('automata-canvas');
    this.renderer = new AutomataRenderer(automataCanvas);

    // 1. DFA Engine
    this.dfa = new DFAEngine((stateInfo, symbol) => {
      if (this.mode === 'DFA') {
        this.renderer.setActiveStates(stateInfo.id);
        this.activeStateDisplay.textContent = stateInfo.label;
        this.stateRuleDisplay.textContent = symbol ? `Trigger: ${symbol}` : stateInfo.desc;
      }
    });

    // 2. NFA Engine
    this.nfa = new NFAEngine((activeStatesList) => {
      if (this.mode === 'NFA') {
        this.renderer.setActiveStates(activeStatesList);
        const statesStr = `{ ${activeStatesList.join(', ')} }`;
        this.activeStateDisplay.textContent = statesStr;
        this.stateRuleDisplay.textContent = this.nfa.cheatEnabled ? 'Cheat Paths Active!' : 'Matching Input Stream...';
      }
    });

    // Set initial graph to DFA
    this.renderer.setGraph('DFA', DFA_STATES, DFA_TRANSITIONS, 'q0');
  }

  initGame() {
    const clawCanvas = document.getElementById('claw-canvas');
    this.shelf = new CollectionShelf();

    this.clawMachine = new ClawMachine(
      clawCanvas,
      this.dfa,
      this.nfa,
      (wonType) => {
        this.shelf.addPrize(wonType);
      }
    );
  }

  setMode(mode) {
    this.mode = mode;
    const isCheat = mode === 'NFA';

    // 1. Update Header Badge
    this.modeBadge.className = `mode-badge ${isCheat ? 'cheat' : 'normal'}`;
    this.modeBadgeText.textContent = isCheat ? 'Cheat ON!' : 'Normal';

    // 2. Update Titles
    this.automataTypeTitle.textContent = isCheat ? 'NFA' : 'DFA';
    this.automataSubtitle.textContent = isCheat
      ? 'Nondeterministic Cheat Detector & Modifiers'
      : 'Standard Machine Cycle';

    // 3. Toggle Cheats Side Panel
    if (isCheat) {
      this.cheatsPanel.style.display = 'flex';
      this.automataContentArea.classList.add('has-cheats');
      this.cheatActionText.textContent = 'Disable Cheat Code';
      this.nfa.setCheatMode(true);
      this.renderer.setGraph('NFA', NFA_STATES, NFA_TRANSITIONS, Array.from(this.nfa.activeStates));
      sound.playCheatUnlock();
    } else {
      this.cheatsPanel.style.display = 'none';
      this.automataContentArea.classList.remove('has-cheats');
      this.cheatActionText.textContent = 'Enable Cheat Code';
      this.nfa.setCheatMode(false);
      this.renderer.setGraph('DFA', DFA_STATES, DFA_TRANSITIONS, this.dfa.currentState);
      this.activeStateDisplay.textContent = this.dfa.getCurrentStateInfo().label;
      this.stateRuleDisplay.textContent = this.dfa.getCurrentStateInfo().desc;
    }

    // 4. Update Game Mechanics Flags
    this.clawMachine.unliCoins = isCheat && this.toggleUnliCoin.checked;
    this.clawMachine.boostChance = isCheat && this.toggleBoostChance.checked;
    this.updateCoinsDisplay();
  }

  toggleMode() {
    this.setMode(this.mode === 'DFA' ? 'NFA' : 'DFA');
  }

  updateCoinsDisplay() {
    this.coinsContainer.innerHTML = '';
    const isUnli = this.mode === 'NFA' && this.clawMachine.unliCoins;

    if (isUnli) {
      this.coinsContainer.classList.add('unli-active');
      const infEl = document.createElement('span');
      infEl.className = 'unli-symbol';
      infEl.textContent = '∞ UNLIMITED';
      this.coinsContainer.appendChild(infEl);
      return;
    }

    this.coinsContainer.classList.remove('unli-active');
    for (let i = 0; i < this.clawMachine.coins; i++) {
      const coin = document.createElement('span');
      coin.className = 'coin-icon';
      this.coinsContainer.appendChild(coin);
    }
    if (this.clawMachine.coins === 0) {
      const emptyMsg = document.createElement('span');
      emptyMsg.style.fontSize = '8px';
      emptyMsg.style.color = '#888';
      emptyMsg.textContent = 'OUT OF COINS';
      this.coinsContainer.appendChild(emptyMsg);
    }
  }

  initControls() {
    // Top Badge & Cheat Book Button click toggles
    this.modeBadge.addEventListener('click', () => this.toggleMode());
    this.btnCheatToggle.addEventListener('click', () => this.toggleMode());

    // Cheat Panel Checkboxes
    this.toggleUnliCoin.addEventListener('change', (e) => {
      this.nfa.setModifier('unli', e.target.checked);
      this.clawMachine.unliCoins = e.target.checked;
      this.updateCoinsDisplay();
    });

    this.toggleBoostChance.addEventListener('change', (e) => {
      this.nfa.setModifier('boost', e.target.checked);
      this.clawMachine.boostChance = e.target.checked;
      this.catchRateStat.textContent = e.target.checked ? '95%' : '80%';
      this.catchRateStat.className = e.target.checked ? 'boosted' : '';
    });

    // Coin Insert
    this.btnInsertCoin.addEventListener('click', () => {
      if (this.clawMachine.insertCoin()) {
        this.updateCoinsDisplay();
      }
    });

    // Drop Button
    this.btnDrop.addEventListener('click', () => {
      this.clawMachine.dropClaw();
    });

    // Virtual D-Pad
    const setupDpad = (btn, dx, dy) => {
      let interval = null;
      const start = () => {
        btn.classList.add('active');
        this.tiltJoystick(dx, dy);
        this.clawMachine.move(dx, dy);
        interval = setInterval(() => {
          this.clawMachine.move(dx, dy);
        }, 30);
      };
      const stop = () => {
        btn.classList.remove('active');
        this.resetJoystick();
        if (interval) clearInterval(interval);
      };
      btn.addEventListener('mousedown', start);
      btn.addEventListener('mouseup', stop);
      btn.addEventListener('mouseleave', stop);
      btn.addEventListener('touchstart', (e) => { e.preventDefault(); start(); });
      btn.addEventListener('touchend', stop);
    };

    setupDpad(this.btnUp, 0, -1);
    setupDpad(this.btnDown, 0, 1);
    setupDpad(this.btnLeft, -1, 0);
    setupDpad(this.btnRight, 1, 0);

    // Continuous Keyboard Listeners
    const pressedKeys = new Set();

    window.addEventListener('keydown', (e) => {
      // 1. Shift + C Mode Toggle
      if (e.shiftKey && e.code === 'KeyC') {
        e.preventDefault();
        this.toggleMode();
        return;
      }

      // 2. Feed key into NFA pattern matcher (e.g. typing C-L-A-W)
      const unlocked = this.nfa.feedInput(e.key);
      if (unlocked && this.mode !== 'NFA') {
        this.setMode('NFA');
      }

      // 3. Gameplay Controls
      const k = e.key.toLowerCase();
      if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(k)) {
        pressedKeys.add(k);
      }

      if (k === 'c' && !e.shiftKey) {
        if (this.clawMachine.insertCoin()) {
          this.updateCoinsDisplay();
        }
      }

      if (e.key === 'Enter' || e.code === 'Space') {
        this.btnDrop.classList.add('active');
        this.clawMachine.dropClaw();
      }
    });

    window.addEventListener('keyup', (e) => {
      const k = e.key.toLowerCase();
      pressedKeys.delete(k);

      if (e.key === 'Enter' || e.code === 'Space') {
        this.btnDrop.classList.remove('active');
      }
    });

    // Gamepad / Keyboard Loop
    setInterval(() => {
      let dx = 0;
      let dy = 0;
      if (pressedKeys.has('w') || pressedKeys.has('arrowup')) { dy -= 1; this.btnUp.classList.add('active'); } else { this.btnUp.classList.remove('active'); }
      if (pressedKeys.has('s') || pressedKeys.has('arrowdown')) { dy += 1; this.btnDown.classList.add('active'); } else { this.btnDown.classList.remove('active'); }
      if (pressedKeys.has('a') || pressedKeys.has('arrowleft')) { dx -= 1; this.btnLeft.classList.add('active'); } else { this.btnLeft.classList.remove('active'); }
      if (pressedKeys.has('d') || pressedKeys.has('arrowright')) { dx += 1; this.btnRight.classList.add('active'); } else { this.btnRight.classList.remove('active'); }

      if (dx !== 0 || dy !== 0) {
        this.tiltJoystick(dx, dy);
        this.clawMachine.move(dx, dy);
      } else if (!this.btnUp.classList.contains('active') && !this.btnDown.classList.contains('active') && !this.btnLeft.classList.contains('active') && !this.btnRight.classList.contains('active')) {
        this.resetJoystick();
      }
    }, 25);
  }

  tiltJoystick(dx, dy) {
    if (this.ledgeJoystickKnob) {
      this.ledgeJoystickKnob.style.transform = `translate(${dx * 5}px, ${dy * 3}px)`;
    }
  }

  resetJoystick() {
    if (this.ledgeJoystickKnob) {
      this.ledgeJoystickKnob.style.transform = 'translate(0px, 0px)';
    }
  }
}

// Start application when DOM is ready
window.addEventListener('DOMContentLoaded', () => {
  new App();
});
