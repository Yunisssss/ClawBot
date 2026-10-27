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
| **Insert Coin** | `P` | Click **Insert Coin [P]** slot |
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
* **Catch Rate:** 50% normal grip probability.
* **States ($Q$):**
  * `Q0: IDLE` — Waiting for coin insertion (`COIN [P]`)
  * `Q1: READY` — Credit loaded, carriage ready for movement
  * `Q2: AIMING` — User positioning claw with WASD (`MOVE [WASD]` self-loop)
  * `Q3: DROP` — Claw descending toward the prize bed (`DROP [Enter]`)
  * `Q4: GRAB` — Claws closing over plushies (`BOTTOM_TOUCH`)
  * `Q5: ASCEND` — Motor pulling claw up (`GRAB_DONE`)
  * `Q6: RETURN` — Carriage returning to chute (`TOP_LIMIT`)
  * `Q7: RESULT` — Prize drop evaluation & accepting state (`CHUTE_REACHED`) $\to$ resets to `Q0`.

### 2. The NFA (Cheat ON Mode)
In cheat mode, the automata visualizer presents an integrated **Nondeterministic Finite Automaton**:
$$\delta: Q \times (\Sigma \cup \{\varepsilon\}) \to \mathcal{P}(Q)$$

* **Complete Gameplay Lifecycle ($Q_0 - Q_7$):**
  * The NFA includes all 8 gameplay states from the DFA (`Q0: IDLE` through `Q7: RESULT`), tracking live carriage movement, drops, grabs, and prize returns.
  * The claw grab superposition has been removed so the gameplay lifecycle strictly matches the real machine's physical state.
* **Cheat Keystroke Stream ($Q_8 - Q_{16}$):**
  * State `Q8: Σ* STREAM` maintains an active self-loop for any incoming keystroke $\Sigma$ during normal gameplay.
  * When initially enabled via `Shift + C`, **cheats start locked** until typed:
    * Type `C-O-I-N`: Transitions non-deterministically through `Q9 [C] -> Q10 [O] -> Q11 [I] -> Q12 [UNLI ACCEPT]`.
    * Type `L-U-C-K`: Transitions non-deterministically through `Q13 [L] -> Q14 [U] -> Q15 [C] -> Q16 [BOOST ACCEPT]`.
* **$\varepsilon$-Transitions:**
  * `Q12` $\xrightarrow{\varepsilon}$ `Q0`: Unlocks Unlimited Tokens ($\infty$) directly into the coin slot.
  * `Q16` $\xrightarrow{\varepsilon}$ `Q4`: Grants a +15% Grip Probability Boost (boosting normal catch rate from 50% to 65%).
* **Subset Construction:** The machine can occupy multiple states simultaneously (e.g. `{ Q2, Q8, Q12, Q16 }`). When cheat mode is toggled off, all cheats are completely deactivated.

---

## 🧸 Plushies Included
1. **Grizzly Bear** (Brown pixel bear)
2. **Red Fox** (Orange fox with white muzzle)
3. **Calico Cat** (White & ginger kitty)
4. **Spark Mouse** (Yellow electric mouse)

All caught plushies are safely kept in your slide-up **Collection Shelf**!
