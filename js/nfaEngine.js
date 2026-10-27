/**
 * CLAWBOT - Nondeterministic Finite Automaton (NFA) Engine
 * Formal 5-tuple: N = (Q, Σ, δ, q0, F)
 * State names: Q0, Q1, Q2, Q3, Q4, Q5, Q6
 */

export const NFA_STATES = {
  Q0: { id: 'Q0', name: 'START', label: 'Q0: IDLE', desc: 'Continuous Input Stream (Σ*)', isFinal: false, x: 65, y: 90 },
  Q1: { id: 'Q1', name: 'KEY_C', label: 'Q1: [C]', desc: 'Branch: Matched "C"', isFinal: false, x: 200, y: 90 },
  Q2: { id: 'Q2', name: 'KEY_L', label: 'Q2: [L]', desc: 'Branch: Matched "L"', isFinal: false, x: 335, y: 90 },
  Q3: { id: 'Q3', name: 'KEY_A', label: 'Q3: [A]', desc: 'Branch: Matched "A"', isFinal: false, x: 470, y: 90 },
  Q4: { id: 'Q4', name: 'UNLOCK', label: 'Q4: [W] ACCEPT', desc: 'Cheat Accept State (F)', isFinal: true, x: 605, y: 90 },
  
  // ε-transition sub-states for cheat modifiers
  Q5: { id: 'Q5', name: 'UNLI_COIN', label: 'Q5: UNLI COIN', desc: 'ε-Transition: C-O-I-N Unlocked', isFinal: true, x: 335, y: 300 },
  Q6: { id: 'Q6', name: 'BOOST_15', label: 'Q6: BOOST +15%', desc: 'ε-Transition: L-U-C-K Unlocked', isFinal: true, x: 550, y: 300 },
};

export const NFA_TRANSITIONS = [
  // Self-loop on Q0: Non-deterministic guess that key is regular play
  { from: 'Q0', to: 'Q0', symbol: 'Σ (Any Key)', isSelfLoop: true },
  
  // Non-deterministic branches for cheat sequence "C-L-A-W"
  { from: 'Q0', to: 'Q1', symbol: 'Key "C"' },
  { from: 'Q1', to: 'Q2', symbol: 'Key "L"' },
  { from: 'Q2', to: 'Q3', symbol: 'Key "A"' },
  { from: 'Q3', to: 'Q4', symbol: 'Key "W"' },

  // Direct toggle transition via [Shift + C]
  { from: 'Q0', to: 'Q4', symbol: '[Shift + C]' },

  // ε-transitions from Accepting State (Q4) to Cheat Buffs (Q5, Q6)
  { from: 'Q4', to: 'Q5', symbol: 'ε (Spontaneous)' },
  { from: 'Q4', to: 'Q6', symbol: 'ε (Spontaneous)' },
];

export class NFAEngine {
  constructor(onActiveStatesChange) {
    this.activeStates = new Set(['Q0']);
    this.onActiveStatesChange = onActiveStatesChange;
    this.cheatEnabled = false;
    this.unliCoinActive = false;
    this.boostChanceActive = false;

    // Separate 4-key sequences for each specific cheat code
    this.seqCoin = ['C', 'O', 'I', 'N'];
    this.coinIdx = 0;

    this.seqLuck = ['L', 'U', 'C', 'K'];
    this.luckIdx = 0;

    this.seqClaw = ['C', 'L', 'A', 'W'];
    this.clawIdx = 0;
  }

  reset() {
    this.activeStates = new Set(['Q0']);
    this.cheatEnabled = false;
    this.unliCoinActive = false;
    this.boostChanceActive = false;
    this.coinIdx = 0;
    this.luckIdx = 0;
    this.clawIdx = 0;
    this.notify();
  }

  // Set cheat mode on/off
  setCheatMode(enabled) {
    this.cheatEnabled = enabled;
    if (enabled) {
      this.unliCoinActive = true;
      this.boostChanceActive = true;
      this.activeStates = new Set(['Q0', 'Q4', 'Q5', 'Q6']);
    } else {
      // Disabling cheat code disables all cheats completely
      this.unliCoinActive = false;
      this.boostChanceActive = false;
      this.coinIdx = 0;
      this.luckIdx = 0;
      this.clawIdx = 0;
      this.activeStates = new Set(['Q0']);
    }
    this.notify();
  }

  // Process a raw key input non-deterministically
  feedInput(key) {
    const k = (key || '').toUpperCase();
    const nextStates = new Set(['Q0']); // Q0 always remains active
    let unlockedSomething = false;

    // 1. Check C-L-A-W sequence (master cheat)
    if (k === this.seqClaw[this.clawIdx]) {
      this.clawIdx++;
      if (this.clawIdx === this.seqClaw.length) {
        this.clawIdx = 0;
        this.cheatEnabled = true;
        this.unliCoinActive = true;
        this.boostChanceActive = true;
        unlockedSomething = true;
      }
    } else {
      this.clawIdx = (k === this.seqClaw[0]) ? 1 : 0;
    }

    // 2. Check C-O-I-N sequence (Unli Coin)
    if (k === this.seqCoin[this.coinIdx]) {
      this.coinIdx++;
      if (this.coinIdx === this.seqCoin.length) {
        this.coinIdx = 0;
        this.unliCoinActive = !this.unliCoinActive;
        this.cheatEnabled = this.unliCoinActive || this.boostChanceActive;
        unlockedSomething = true;
      }
    } else {
      this.coinIdx = (k === this.seqCoin[0]) ? 1 : 0;
    }

    // 3. Check L-U-C-K sequence (Increase Chance by 15%)
    if (k === this.seqLuck[this.luckIdx]) {
      this.luckIdx++;
      if (this.luckIdx === this.seqLuck.length) {
        this.luckIdx = 0;
        this.boostChanceActive = !this.boostChanceActive;
        this.cheatEnabled = this.unliCoinActive || this.boostChanceActive;
        unlockedSomething = true;
      }
    } else {
      this.luckIdx = (k === this.seqLuck[0]) ? 1 : 0;
    }

    // Non-deterministic branch matching
    this.activeStates.forEach(stateId => {
      if (stateId === 'Q0' && k === 'C') {
        nextStates.add('Q1');
      } else if (stateId === 'Q1' && k === 'L') {
        nextStates.add('Q2');
      } else if (stateId === 'Q2' && k === 'A') {
        nextStates.add('Q3');
      } else if (stateId === 'Q3' && k === 'W') {
        nextStates.add('Q4');
      }
    });

    if (this.cheatEnabled || this.unliCoinActive || this.boostChanceActive) {
      nextStates.add('Q4');
      if (this.unliCoinActive) nextStates.add('Q5');
      if (this.boostChanceActive) nextStates.add('Q6');
      this.cheatEnabled = true;
    }

    this.activeStates = nextStates;
    this.notify();

    return {
      unlocked: unlockedSomething,
      cheatEnabled: this.cheatEnabled,
      unliActive: this.unliCoinActive,
      boostActive: this.boostChanceActive,
      coinIdx: this.coinIdx,
      luckIdx: this.luckIdx,
    };
  }

  setModifier(modifierKey, isActive) {
    if (modifierKey === 'unli') {
      this.unliCoinActive = isActive;
      if (isActive) this.activeStates.add('Q5');
      else this.activeStates.delete('Q5');
    } else if (modifierKey === 'boost') {
      this.boostChanceActive = isActive;
      if (isActive) this.activeStates.add('Q6');
      else this.activeStates.delete('Q6');
    }

    this.cheatEnabled = this.unliCoinActive || this.boostChanceActive;
    if (!this.cheatEnabled) {
      this.activeStates.delete('Q4');
    } else {
      this.activeStates.add('Q4');
    }
    this.notify();
  }

  notify() {
    if (this.onActiveStatesChange) {
      this.onActiveStatesChange(Array.from(this.activeStates));
    }
  }

  isStateActive(stateId) {
    return this.activeStates.has(stateId);
  }
}
