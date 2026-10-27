/**
 * CLAWBOT - Unified Nondeterministic Finite Automaton (NFA) Engine
 * Formal 5-tuple: N = (Q, Σ, δ, Q0, F)
 * Unites Approach A (Multi-Cheat Keystroke Stream Union) and Approach B (Claw Grab Superposition)
 */

export const NFA_STATES = {
  // --- Section 1: Cheat Code Detector (Union NFA: Σ*(COIN | LUCK)) ---
  Q0: { id: 'Q0', name: 'IDLE / Σ*', label: 'Q0', desc: 'Continuous Input Stream (Σ*)', isFinal: false, x: 55, y: 115 },
  
  // Branch A: C-O-I-N (Unlimited Coins)
  Q1: { id: 'Q1', name: '[C]', label: 'Q1', desc: 'Matched "C"', isFinal: false, x: 175, y: 60 },
  Q2: { id: 'Q2', name: '[O]', label: 'Q2', desc: 'Matched "O"', isFinal: false, x: 300, y: 60 },
  Q3: { id: 'Q3', name: '[I]', label: 'Q3', desc: 'Matched "I"', isFinal: false, x: 425, y: 60 },
  Q4: { id: 'Q4', name: 'UNLI ACCEPT', label: 'Q4', desc: 'Unli Coins Accept State (F)', isFinal: true, x: 565, y: 60 },

  // Branch B: L-U-C-K (+15% Win Probability)
  Q5: { id: 'Q5', name: '[L]', label: 'Q5', desc: 'Matched "L"', isFinal: false, x: 175, y: 165 },
  Q6: { id: 'Q6', name: '[U]', label: 'Q6', desc: 'Matched "U"', isFinal: false, x: 300, y: 165 },
  Q7: { id: 'Q7', name: '[C]', label: 'Q7', desc: 'Matched "C"', isFinal: false, x: 425, y: 165 },
  Q8: { id: 'Q8', name: 'BOOST ACCEPT', label: 'Q8', desc: '+15% Boost Accept State (F)', isFinal: true, x: 565, y: 165 },

  // --- Section 2: Claw Machine Grab Superposition ---
  Q9: { id: 'Q9', name: 'AIM / DROP', label: 'Q9', desc: 'Gantry Aiming & Descending', isFinal: false, x: 110, y: 340 },
  Q10: { id: 'Q10', name: 'GRAB EVAL', label: 'Q10', desc: 'Fingers Clamped on Prize Pile', isFinal: false, x: 270, y: 340 },
  Q11: { id: 'Q11', name: 'SLIP / MISS', label: 'Q11', desc: 'Branch 1: Loose Grip (Miss)', isFinal: false, x: 460, y: 285 },
  Q12: { id: 'Q12', name: 'SECURE WIN', label: 'Q12', desc: 'Branch 2: Secure Grip (Accepting)', isFinal: true, x: 460, y: 395 },
};

export const NFA_TRANSITIONS = [
  // 1. Self-loop on Q0: Guessing keystroke is regular play
  { from: 'Q0', to: 'Q0', symbol: 'Σ (Any Key)', isSelfLoop: true },
  
  // 2. Branch A: COIN
  { from: 'Q0', to: 'Q1', symbol: 'Key "C"' },
  { from: 'Q1', to: 'Q2', symbol: 'Key "O"' },
  { from: 'Q2', to: 'Q3', symbol: 'Key "I"' },
  { from: 'Q3', to: 'Q4', symbol: 'Key "N"' },

  // 3. Branch B: LUCK
  { from: 'Q0', to: 'Q5', symbol: 'Key "L"' },
  { from: 'Q5', to: 'Q6', symbol: 'Key "U"' },
  { from: 'Q6', to: 'Q7', symbol: 'Key "C"' },
  { from: 'Q7', to: 'Q8', symbol: 'Key "K"' },

  // Direct toggle shortcut [Shift + C]
  { from: 'Q0', to: 'Q4', symbol: '[Shift+C]' },
  { from: 'Q0', to: 'Q8', symbol: '[Shift+C]' },

  // 4. Gameplay Transitions
  { from: 'Q9', to: 'Q10', symbol: 'BOTTOM_TOUCH' },
  // Nondeterministic Split on GRAB:
  { from: 'Q10', to: 'Q11', symbol: 'GRAB: LOOSE' },
  { from: 'Q10', to: 'Q12', symbol: 'GRAB: FIRM' },

  // 5. ε-Transitions connecting Cheats to Gameplay
  { from: 'Q4', to: 'Q0', symbol: 'ε: Unli Tokens', isEpsilon: true, isDashed: true },
  { from: 'Q8', to: 'Q12', symbol: 'ε: +15% Boost', isEpsilon: true, isDashed: true },
];

export class NFAEngine {
  constructor(onActiveStatesChange) {
    this.activeStates = new Set(['Q0']);
    this.onActiveStatesChange = onActiveStatesChange;
    this.cheatEnabled = false;
    this.unliCoinActive = false;
    this.boostChanceActive = false;

    // 4-key sequences
    this.seqCoin = ['C', 'O', 'I', 'N'];
    this.coinIdx = 0;

    this.seqLuck = ['L', 'U', 'C', 'K'];
    this.luckIdx = 0;

    // Track active gameplay state in NFA
    this.gameplayState = null; // 'Q9', 'Q10', 'Q11', 'Q12'
  }

  reset() {
    this.activeStates = new Set(['Q0']);
    this.cheatEnabled = false;
    this.unliCoinActive = false;
    this.boostChanceActive = false;
    this.coinIdx = 0;
    this.luckIdx = 0;
    this.gameplayState = null;
    this.notify();
  }

  setCheatMode(enabled) {
    this.cheatEnabled = enabled;
    // Initially, no active cheat is on when Shift + C (enable cheat) is turned on
    this.unliCoinActive = false;
    this.boostChanceActive = false;
    this.coinIdx = 0;
    this.luckIdx = 0;
    this.gameplayState = null;
    this.activeStates = new Set(['Q0']);
    this.notify();
  }

  // Called by claw machine as gantry moves, drops, grabs
  notifyGameAction(action) {
    if (!this.cheatEnabled) return;

    if (action === 'AIM_OR_DROP') {
      this.gameplayState = 'Q9';
    } else if (action === 'BOTTOM_TOUCH') {
      this.gameplayState = 'Q10';
    } else if (action === 'EVALUATE_GRAB') {
      // NONDETERMINISTIC SUPERPOSITION: Both outcomes activate!
      this.activeStates.add('Q11');
      this.activeStates.add('Q12');
      this.notify();
      return;
    } else if (action === 'RESET_IDLE') {
      this.activeStates.delete('Q9');
      this.activeStates.delete('Q10');
      this.activeStates.delete('Q11');
      this.activeStates.delete('Q12');
      this.gameplayState = null;
    }

    if (this.gameplayState) {
      this.activeStates.add(this.gameplayState);
    }
    this.notify();
  }

  feedInput(key) {
    const k = (key || '').toUpperCase();
    const nextStates = new Set(['Q0']); // Q0 always active
    let unlockedSomething = false;

    // 1. Process COIN branch
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

    // 2. Process LUCK branch
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

    // Add branch states based on typed progress
    if (this.coinIdx === 1) nextStates.add('Q1');
    else if (this.coinIdx === 2) nextStates.add('Q2');
    else if (this.coinIdx === 3) nextStates.add('Q3');

    if (this.luckIdx === 1) nextStates.add('Q5');
    else if (this.luckIdx === 2) nextStates.add('Q6');
    else if (this.luckIdx === 3) nextStates.add('Q7');

    // Maintain accepted cheat states
    if (this.unliCoinActive) nextStates.add('Q4');
    if (this.boostChanceActive) nextStates.add('Q8');

    // Maintain active gameplay state if any
    if (this.gameplayState) nextStates.add(this.gameplayState);

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
      if (isActive) this.activeStates.add('Q4');
      else this.activeStates.delete('Q4');
    } else if (modifierKey === 'boost') {
      this.boostChanceActive = isActive;
      if (isActive) this.activeStates.add('Q8');
      else this.activeStates.delete('Q8');
    }

    this.cheatEnabled = this.unliCoinActive || this.boostChanceActive;
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
