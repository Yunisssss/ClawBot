/**
 * CLAWBOT - Unified Nondeterministic Finite Automaton (NFA) Engine
 * Formal 5-tuple: N = (Q, Σ, δ, Q0, F)
 * Unites Approach A (Multi-Cheat Keystroke Stream Union) and Approach B (Claw Grab Superposition)
 */

export const NFA_STATES = {
  // --- Section 1: Gameplay States (DFA States Q0 - Q7) ---
  Q0: { id: 'Q0', name: 'IDLE', label: 'Q0', desc: 'Waiting for COIN [P]', isFinal: false, x: 75, y: 285 },
  Q1: { id: 'Q1', name: 'READY', label: 'Q1', desc: 'Credit Loaded. Use WASD', isFinal: false, x: 240, y: 285 },
  Q2: { id: 'Q2', name: 'AIMING', label: 'Q2', desc: 'Positioning Claw. Press Enter', isFinal: false, x: 420, y: 285 },
  Q3: { id: 'Q3', name: 'DROP', label: 'Q3', desc: 'Claw Descending...', isFinal: false, x: 600, y: 285 },
  Q4: { id: 'Q4', name: 'GRAB', label: 'Q4', desc: 'Closing Claw Fingers', isFinal: false, x: 600, y: 385 },
  Q5: { id: 'Q5', name: 'ASCEND', label: 'Q5', desc: 'Pulling Up...', isFinal: false, x: 420, y: 385 },
  Q6: { id: 'Q6', name: 'RETURN', label: 'Q6', desc: 'Returning to Chute', isFinal: false, x: 240, y: 385 },
  Q7: { id: 'Q7', name: 'RESULT', label: 'Q7', desc: 'Prize Evaluation (Accepting)', isFinal: true, x: 75, y: 385 },

  // --- Section 2: Cheat Keystroke Stream NFA ---
  Q8: { id: 'Q8', name: 'Σ* STREAM', label: 'Q8', desc: 'Continuous Input Stream (Σ*)', isFinal: false, x: 55, y: 110 },

  // Branch A: C-O-I-N (Unlimited Coins)
  Q9: { id: 'Q9', name: '[C]', label: 'Q9', desc: 'Matched "C"', isFinal: false, x: 180, y: 60 },
  Q10: { id: 'Q10', name: '[O]', label: 'Q10', desc: 'Matched "O"', isFinal: false, x: 310, y: 60 },
  Q11: { id: 'Q11', name: '[I]', label: 'Q11', desc: 'Matched "I"', isFinal: false, x: 440, y: 60 },
  Q12: { id: 'Q12', name: 'UNLI ACCEPT', label: 'Q12', desc: 'Unli Coins Accept State (F)', isFinal: true, x: 575, y: 60 },

  // Branch B: L-U-C-K (+15% Win Probability)
  Q13: { id: 'Q13', name: '[L]', label: 'Q13', desc: 'Matched "L"', isFinal: false, x: 180, y: 160 },
  Q14: { id: 'Q14', name: '[U]', label: 'Q14', desc: 'Matched "U"', isFinal: false, x: 310, y: 160 },
  Q15: { id: 'Q15', name: '[C]', label: 'Q15', desc: 'Matched "C"', isFinal: false, x: 440, y: 160 },
  Q16: { id: 'Q16', name: 'BOOST ACCEPT', label: 'Q16', desc: '+15% Boost Accept State (F)', isFinal: true, x: 575, y: 160 },
};

export const NFA_TRANSITIONS = [
  // 1. Cheat Input Stream Self-loop (Guessing keystroke is regular play)
  { from: 'Q8', to: 'Q8', symbol: 'Σ (Any Key)', isSelfLoop: true },

  // 2. Branch A: COIN
  { from: 'Q8', to: 'Q9', symbol: 'Key "C"' },
  { from: 'Q9', to: 'Q10', symbol: 'Key "O"' },
  { from: 'Q10', to: 'Q11', symbol: 'Key "I"' },
  { from: 'Q11', to: 'Q12', symbol: 'Key "N"' },

  // 3. Branch B: LUCK
  { from: 'Q8', to: 'Q13', symbol: 'Key "L"' },
  { from: 'Q13', to: 'Q14', symbol: 'Key "U"' },
  { from: 'Q14', to: 'Q15', symbol: 'Key "C"' },
  { from: 'Q15', to: 'Q16', symbol: 'Key "K"' },

  // 4. Gameplay Lifecycle Transitions (DFA States Q0 - Q7)
  { from: 'Q0', to: 'Q1', symbol: 'COIN [P]' },
  { from: 'Q1', to: 'Q2', symbol: 'MOVE [WASD]' },
  { from: 'Q2', to: 'Q2', symbol: 'MOVE [WASD]', isSelfLoop: true },
  { from: 'Q2', to: 'Q3', symbol: 'DROP [Enter]' },
  { from: 'Q1', to: 'Q3', symbol: 'DROP [Enter]' },
  { from: 'Q3', to: 'Q4', symbol: 'BOTTOM_TOUCH' },
  { from: 'Q4', to: 'Q5', symbol: 'GRAB_DONE' },
  { from: 'Q5', to: 'Q6', symbol: 'TOP_LIMIT' },
  { from: 'Q6', to: 'Q7', symbol: 'CHUTE_REACHED' },
  { from: 'Q7', to: 'Q0', symbol: 'RESET' },

  // 5. ε-Transitions connecting Cheats to Gameplay
  { from: 'Q12', to: 'Q0', symbol: 'ε: Unli Tokens', isEpsilon: true, isDashed: true },
  { from: 'Q16', to: 'Q4', symbol: 'ε: +15% Boost', isEpsilon: true, isDashed: true },
];

export class NFAEngine {
  constructor(onActiveStatesChange) {
    this.gameplayState = 'Q0';
    this.activeStates = new Set(['Q0', 'Q8']);
    this.onActiveStatesChange = onActiveStatesChange;
    this.cheatEnabled = false;
    this.unliCoinActive = false;
    this.boostChanceActive = false;

    // 4-key sequences
    this.seqCoin = ['C', 'O', 'I', 'N'];
    this.coinIdx = 0;

    this.seqLuck = ['L', 'U', 'C', 'K'];
    this.luckIdx = 0;
  }

  reset() {
    this.gameplayState = 'Q0';
    this.activeStates = new Set(['Q0', 'Q8']);
    this.cheatEnabled = false;
    this.unliCoinActive = false;
    this.boostChanceActive = false;
    this.coinIdx = 0;
    this.luckIdx = 0;
    this.notify();
  }

  setCheatMode(enabled) {
    this.cheatEnabled = enabled;
    // Initially, no active cheat is on when Shift + C (enable cheat) is turned on
    this.unliCoinActive = false;
    this.boostChanceActive = false;
    this.coinIdx = 0;
    this.luckIdx = 0;
    this.recomputeActiveStates();
    this.notify();
  }

  setGameplayState(stateId) {
    this.gameplayState = stateId || 'Q0';
    this.recomputeActiveStates();
    this.notify();
  }

  notifyGameAction(action) {
    // Kept for backward compatibility
  }

  recomputeActiveStates() {
    const states = new Set();
    // 1. Current gameplay lifecycle state
    states.add(this.gameplayState || 'Q0');

    if (this.cheatEnabled) {
      // 2. Cheat stream root is active when cheat mode is enabled
      states.add('Q8');

      // 3. Sequential typed progress
      if (this.coinIdx === 1) states.add('Q9');
      else if (this.coinIdx === 2) states.add('Q10');
      else if (this.coinIdx === 3) states.add('Q11');

      if (this.luckIdx === 1) states.add('Q13');
      else if (this.luckIdx === 2) states.add('Q14');
      else if (this.luckIdx === 3) states.add('Q15');

      // 4. Unlocked cheat accepting states stay active
      if (this.unliCoinActive) states.add('Q12');
      if (this.boostChanceActive) states.add('Q16');
    }

    this.activeStates = states;
  }

  feedInput(key) {
    const k = (key || '').toUpperCase();
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

    this.recomputeActiveStates();
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
    } else if (modifierKey === 'boost') {
      this.boostChanceActive = isActive;
    }

    this.cheatEnabled = this.unliCoinActive || this.boostChanceActive;
    this.recomputeActiveStates();
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
