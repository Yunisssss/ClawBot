# CLAWBOT - Finite Automata Simulator (DFA & NFA)

An interactive retro-pastel arcade claw machine that demonstrates **Deterministic Finite Automata (DFA)** and **Nondeterministic Finite Automata (NFA)** side-by-side in real-time.

---

## 🕹️ Quick Start

To launch the simulator locally:

1. Open your terminal in this directory:
   ```bash
   cd c:\Users\Janeu\Intern\ClawBot\ClawBot
   ```
2. Start the local server:
   ```bash
   python -m http.server 8080
   ```
3. Open your browser and navigate to:
   ```
   http://localhost:8080
   ```

---

## 🎮 How to Play

### Controls
| Action | Keyboard | Screen Button |
| :--- | :--- | :--- |
| **Insert Coin** | `C` | Click **Insert Coin [C]** slot |
| **Move Gantry** | `W`, `A`, `S`, `D` or Arrow Keys | Click D-Pad arrows (`W`, `A`, `S`, `D`) |
| **Drop Claw** | `Enter` or `Space` | Click **DROP [Enter]** button |
| **Toggle Mode / Cheat** | `Shift + C` | Click **Enable Cheat Code** or Top Badge |
| **Collection Shelf** | Click button | Click **▲ COLLECTION SHELF** |

---

## 📐 Automata Theory Breakdown

### 1. The DFA (Normal Mode)
In normal mode, the claw machine follows a classic **Deterministic Finite Automaton**:
$$\delta: Q \times \Sigma \to Q$$
* At any millisecond, the machine occupies **strictly ONE active state**.
* **States ($Q$):**
  * `q0: IDLE` — Waiting for coin insertion (`COIN [C]`)
  * `q1: READY` — Credit loaded, carriage ready for movement
  * `q2: AIMING` — User positioning claw with WASD (`MOVE [WASD]` self-loop)
  * `q3: DROP` — Claw descending toward the prize bed (`DROP [Enter]`)
  * `q4: GRAB` — Claws closing over plushies (`BOTTOM_TOUCH`)
  * `q5: ASCEND` — Motor pulling claw up (`GRAB_DONE`)
  * `q6: RETURN` — Carriage returning to chute (`TOP_LIMIT`)
  * `q7: RESULT` — Prize drop evaluation & accepting state (`CHUTE_REACHED`) $\to$ resets to `q0`.

### 2. The NFA (Cheat ON Mode)
In cheat mode, the illustration panel transforms into an **Nondeterministic Finite Automaton**:
$$\delta: Q \times (\Sigma \cup \{\varepsilon\}) \to \mathcal{P}(Q)$$
* The machine can occupy **MULTIPLE states simultaneously** (subset construction):
  * Active set: `{ s0, s4, s_unli, s_boost }`
* **Pattern Matching Non-determinism:**
  * While receiving continuous player keypresses, state `s0` non-deterministically guesses whether each key is regular gameplay or the start of the cheat sequence (`C-L-A-W`):
    $$\delta(s_0, \text{'C'}) = \{s_0, s_1\}$$
* **$\varepsilon$-Transitions:**
  * From the Accepting State `s4`, the automaton branches spontaneously into the modifier sub-states:
    * `s_unli`: **Unlimited Coins** ($\infty$)
    * `s_boost`: **+15% Grip Probability Boost** (80% $\to$ 95% win rate)

---

## 🧸 Plushies Included
1. **Grizzly Bear** (Brown pixel bear)
2. **Red Fox** (Orange fox with white muzzle)
3. **Calico Cat** (White & ginger kitty)
4. **Spark Mouse** (Yellow electric mouse)

All caught plushies are safely kept in your slide-up **Collection Shelf**!
