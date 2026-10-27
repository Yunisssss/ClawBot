/**
 * CLAWBOT - Nondeterministic Finite Automaton (NFA) Engine
 * Formal 5-tuple: N = (Q, Σ, δ, q0, F)
 * Illustrates multi-state subset tracking and ε-transitions for the cheat sequence
 */

export const NFA_STATES = {
  s0: { id: 's0', name: 'START', label: 's0: IDLE', desc: 'Continuous Input Stream (Σ*)', isFinal: false, x: 45, y: 70 },
  s1: { id: 's1', name: 'KEY_C', label: 's1: [C]', desc: 'Branch: Matched "C"', isFinal: false, x: 140, y: 70 },
  s2: { id: 's2', name: 'KEY_L', label: 's2: [L]', desc: 'Branch: Matched "L"', isFinal: false, x: 235, y: 70 },
  s3: { id: 's3', name: 'KEY_A', label: 's3: [A]', desc: 'Branch: Matched "A"', isFinal: false, x: 330, y: 70 },
  s4: { id: 's4', name: 'UNLOCK', label: 's4: [W] ACCEPT', desc: 'Cheat Accept State (F)', isFinal: true, x: 415, y: 70 },
  
  // ε-transition sub-states for cheat modifiers
  s_unli: { id: 's_unli', name: 'UNLI_COIN', label: 'ε: UNLI COIN', desc: 'Infinite Tokens Active', isFinal: true, x: 235, y: 220 },
  s_boost: { id: 's_boost', name: 'BOOST_15', label: 'ε: BOOST +15%', desc: 'Claw Grip +15% Stability', isFinal: true, x: 390, y: 220 },
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
  }

  reset() {
    this.activeStates = new Set(['s0']);
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

    // Check branch transitions from all currently active states
    this.activeStates.forEach(stateId => {
      if (stateId === 's0' && k === 'C') {
        nextStates.add('s1');
      } else if (stateId === 's1' && k === 'L') {
        nextStates.add('s2');
      } else if (stateId === 's2' && k === 'A') {
        nextStates.add('s3');
      } else if (stateId === 's3' && k === 'W') {
        nextStates.add('s4');
        // ε-transitions
        if (this.unliCoinActive) nextStates.add('s_unli');
        if (this.boostChanceActive) nextStates.add('s_boost');
        this.cheatEnabled = true;
      }
    });

    // If cheat was already active, preserve cheat states
    if (this.cheatEnabled) {
      nextStates.add('s4');
      if (this.unliCoinActive) nextStates.add('s_unli');
      if (this.boostChanceActive) nextStates.add('s_boost');
    }

    this.activeStates = nextStates;
    this.notify();

    return this.cheatEnabled;
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
