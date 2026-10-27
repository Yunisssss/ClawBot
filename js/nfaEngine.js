/**
 * CLAWBOT - Nondeterministic Finite Automaton (NFA) Engine
 * Formal 5-tuple: N = (Q, Σ, δ, q0, F)
 * Illustrates multi-state subset tracking and ε-transitions for cheat sequences
 */

export const NFA_STATES = {
  s0: { id: 's0', name: 'START', label: 's0: IDLE', desc: 'Continuous Input Stream (Σ*)', isFinal: false, x: 65, y: 90 },
  s1: { id: 's1', name: 'KEY_C', label: 's1: [C]', desc: 'Branch: Matched "C"', isFinal: false, x: 200, y: 90 },
  s2: { id: 's2', name: 'KEY_L', label: 's2: [L]', desc: 'Branch: Matched "L"', isFinal: false, x: 335, y: 90 },
  s3: { id: 's3', name: 'KEY_A', label: 's3: [A]', desc: 'Branch: Matched "A"', isFinal: false, x: 470, y: 90 },
  s4: { id: 's4', name: 'UNLOCK', label: 's4: [W] ACCEPT', desc: 'Cheat Accept State (F)', isFinal: true, x: 605, y: 90 },
  
  // ε-transition sub-states for cheat modifiers
  s_unli: { id: 's_unli', name: 'UNLI_COIN', label: 'ε: UNLI COIN', desc: 'C-O-I-N Unlocked', isFinal: true, x: 335, y: 300 },
  s_boost: { id: 's_boost', name: 'BOOST_15', label: 'ε: BOOST +15%', desc: 'L-U-C-K Unlocked', isFinal: true, x: 550, y: 300 },
};

export const NFA_TRANSITIONS = [
  // Self-loop on s0: Non-deterministic guess that key is just regular play
  { from: 's0', to: 's0', symbol: 'Σ (Any Key)', isSelfLoop: true },
  
  // Non-deterministic branches guessing that keystroke is the start of cheat "C-L-A-W"
  { from: 's0', to: 's1', symbol: 'Key "C"' },
  { from: 's1', to: 's2', symbol: 'Key "L"' },
  { from: 's2', to: 's3', symbol: 'Key "A"' },
  { from: 's3', to: 's4', symbol: 'Key "W"' },

  // Direct toggle transition via [Shift + C]
  { from: 's0', to: 's4', symbol: '[Shift + C]' },

  // ε-transitions from Accepting State (s4) to Cheat Buffs
  { from: 's4', to: 's_unli', symbol: 'ε (Spontaneous)' },
  { from: 's4', to: 's_boost', symbol: 'ε (Spontaneous)' },
];

export class NFAEngine {
  constructor(onActiveStatesChange) {
    this.activeStates = new Set(['s0']);
    this.onActiveStatesChange = onActiveStatesChange;
    this.cheatEnabled = false;
    this.unliCoinActive = true;
    this.boostChanceActive = true;

    // Separate 4-key sequences for each specific cheat code
    this.seqCoin = ['C', 'O', 'I', 'N'];
    this.coinIdx = 0;

    this.seqLuck = ['L', 'U', 'C', 'K'];
    this.luckIdx = 0;

    this.seqClaw = ['C', 'L', 'A', 'W'];
    this.clawIdx = 0;
  }

  reset() {
    this.activeStates = new Set(['s0']);
    this.coinIdx = 0;
    this.luckIdx = 0;
    this.clawIdx = 0;
    this.notify();
  }

  // Set cheat mode on/off
  setCheatMode(enabled) {
    this.cheatEnabled = enabled;
    if (enabled) {
      // Branch into accepting state and ε-states
      this.activeStates = new Set(['s0', 's4']);
      if (this.unliCoinActive) this.activeStates.add('s_unli');
      if (this.boostChanceActive) this.activeStates.add('s_boost');
    } else {
      this.activeStates = new Set(['s0']);
    }
    this.notify();
  }

  // Process a raw key input non-deterministically
  feedInput(key) {
    const k = (key || '').toUpperCase();
    const nextStates = new Set(['s0']); // s0 always remains active (self-loop on any input)
    let unlockedSomething = false;

    // 1. Check C-L-A-W sequence
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
        this.unliCoinActive = !this.unliCoinActive; // Toggle specific cheat
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
        this.boostChanceActive = !this.boostChanceActive; // Toggle specific cheat
        unlockedSomething = true;
      }
    } else {
      this.luckIdx = (k === this.seqLuck[0]) ? 1 : 0;
    }

    // Branch transitions from all currently active states (NFA simulation)
    this.activeStates.forEach(stateId => {
      if (stateId === 's0' && k === 'C') {
        nextStates.add('s1');
      } else if (stateId === 's1' && k === 'L') {
        nextStates.add('s2');
      } else if (stateId === 's2' && k === 'A') {
        nextStates.add('s3');
      } else if (stateId === 's3' && k === 'W') {
        nextStates.add('s4');
      }
    });

    if (this.cheatEnabled || this.unliCoinActive || this.boostChanceActive) {
      nextStates.add('s4');
      if (this.unliCoinActive) nextStates.add('s_unli');
      if (this.boostChanceActive) nextStates.add('s_boost');
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
      if (this.cheatEnabled) {
        if (isActive) this.activeStates.add('s_unli');
        else this.activeStates.delete('s_unli');
      }
    } else if (modifierKey === 'boost') {
      this.boostChanceActive = isActive;
      if (this.cheatEnabled) {
        if (isActive) this.activeStates.add('s_boost');
        else this.activeStates.delete('s_boost');
      }
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
