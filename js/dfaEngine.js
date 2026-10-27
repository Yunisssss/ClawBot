/**
 * CLAWBOT - Deterministic Finite Automaton (DFA) Engine
 * Formal 5-tuple: M = (Q, Σ, δ, q0, F)
 * State names: Q0, Q1, Q2, Q3, Q4, Q5, Q6, Q7
 */

export const DFA_STATES = {
  Q0: { id: 'Q0', name: 'IDLE', label: 'Q0: IDLE', desc: 'Waiting for COIN [P]', isFinal: false, x: 70, y: 90 },
  Q1: { id: 'Q1', name: 'READY', label: 'Q1: READY', desc: 'Coin Loaded. Use WASD', isFinal: false, x: 240, y: 90 },
  Q2: { id: 'Q2', name: 'AIMING', label: 'Q2: AIMING', desc: 'Positioning Claw. Press Enter', isFinal: false, x: 420, y: 90 },
  Q3: { id: 'Q3', name: 'DROPPING', label: 'Q3: DROP', desc: 'Claw Descending...', isFinal: false, x: 600, y: 90 },
  Q4: { id: 'Q4', name: 'GRABBING', label: 'Q4: GRAB', desc: 'Closing Claw Fingers', isFinal: false, x: 600, y: 300 },
  Q5: { id: 'Q5', name: 'ASCENDING', label: 'Q5: ASCEND', desc: 'Pulling Up...', isFinal: false, x: 420, y: 300 },
  Q6: { id: 'Q6', name: 'RETURNING', label: 'Q6: RETURN', desc: 'Returning to Chute', isFinal: false, x: 240, y: 300 },
  Q7: { id: 'Q7', name: 'RESULT', label: 'Q7: RESULT', desc: 'Prize Evaluation (Accepting)', isFinal: true, x: 70, y: 300 },
};

// Transition Table δ(state, symbol) -> next_state
export const DFA_TRANSITIONS = [
  { from: 'Q0', to: 'Q1', symbol: 'COIN [P]' },
  { from: 'Q1', to: 'Q2', symbol: 'MOVE [WASD]' },
  { from: 'Q2', to: 'Q2', symbol: 'MOVE [WASD]' }, // Self-loop
  { from: 'Q2', to: 'Q3', symbol: 'DROP [Enter]' },
  { from: 'Q1', to: 'Q3', symbol: 'DROP [Enter]' },
  { from: 'Q3', to: 'Q4', symbol: 'BOTTOM_TOUCH' },
  { from: 'Q4', to: 'Q5', symbol: 'GRAB_DONE' },
  { from: 'Q5', to: 'Q6', symbol: 'TOP_LIMIT' },
  { from: 'Q6', to: 'Q7', symbol: 'CHUTE_REACHED' },
  { from: 'Q7', to: 'Q0', symbol: 'RESET' },
];

export class DFAEngine {
  constructor(onStateChange) {
    this.currentState = 'Q0';
    this.onStateChange = onStateChange;
  }

  reset() {
    this.transitionTo('Q0');
  }

  transition(symbol) {
    const edge = DFA_TRANSITIONS.find(t => t.from === this.currentState && t.symbol === symbol);
    if (edge) {
      this.transitionTo(edge.to, symbol);
      return true;
    }
    return false;
  }

  transitionTo(nextStateId, triggeringSymbol = '') {
    if (DFA_STATES[nextStateId]) {
      this.currentState = nextStateId;
      if (this.onStateChange) {
        this.onStateChange(this.getCurrentStateInfo(), triggeringSymbol);
      }
    }
  }

  getCurrentStateInfo() {
    return DFA_STATES[this.currentState];
  }
}
