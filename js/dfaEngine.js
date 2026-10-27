/**
 * CLAWBOT - Deterministic Finite Automaton (DFA) Engine
 * Formal 5-tuple: M = (Q, Σ, δ, q0, F)
 */

export const DFA_STATES = {
  q0: { id: 'q0', name: 'IDLE', label: 'q0: IDLE', desc: 'Waiting for COIN [C]', isFinal: false, x: 50, y: 70 },
  q1: { id: 'q1', name: 'READY', label: 'q1: READY', desc: 'Coin Loaded. Use WASD', isFinal: false, x: 160, y: 70 },
  q2: { id: 'q2', name: 'AIMING', label: 'q2: AIMING', desc: 'Positioning Claw. Press Enter', isFinal: false, x: 280, y: 70 },
  q3: { id: 'q3', name: 'DROPPING', label: 'q3: DROP', desc: 'Claw Descending...', isFinal: false, x: 400, y: 70 },
  q4: { id: 'q4', name: 'GRABBING', label: 'q4: GRAB', desc: 'Closing Claw Fingers', isFinal: false, x: 400, y: 220 },
  q5: { id: 'q5', name: 'ASCENDING', label: 'q5: ASCEND', desc: 'Pulling Up...', isFinal: false, x: 280, y: 220 },
  q6: { id: 'q6', name: 'RETURNING', label: 'q6: RETURN', desc: 'Returning to Chute', isFinal: false, x: 160, y: 220 },
  q7: { id: 'q7', name: 'RESULT', label: 'q7: RESULT', desc: 'Prize Evaluation (Accepting)', isFinal: true, x: 50, y: 220 },
};

// Transition Table δ(state, symbol) -> next_state
export const DFA_TRANSITIONS = [
  { from: 'q0', to: 'q1', symbol: 'COIN [C]' },
  { from: 'q1', to: 'q2', symbol: 'MOVE [WASD]' },
  { from: 'q2', to: 'q2', symbol: 'MOVE [WASD]' }, // Self-loop
  { from: 'q2', to: 'q3', symbol: 'DROP [Enter]' },
  { from: 'q1', to: 'q3', symbol: 'DROP [Enter]' },
  { from: 'q3', to: 'q4', symbol: 'BOTTOM_TOUCH' },
  { from: 'q4', to: 'q5', symbol: 'GRAB_DONE' },
  { from: 'q5', to: 'q6', symbol: 'TOP_LIMIT' },
  { from: 'q6', to: 'q7', symbol: 'CHUTE_REACHED' },
  { from: 'q7', to: 'q0', symbol: 'RESET' },
];

export class DFAEngine {
  constructor(onStateChange) {
    this.currentState = 'q0';
    this.onStateChange = onStateChange;
  }

  reset() {
    this.transitionTo('q0');
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
