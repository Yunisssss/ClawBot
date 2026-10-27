/**
 * CLAWBOT - Collection Shelf Drawer
 * Tracks won prizes and renders an inventory showcase drawer
 */

import { PLUSHIE_CONFIGS, drawPlushie } from './sprites.js?v=2';

export class CollectionShelf {
  constructor() {
    this.drawerEl = document.getElementById('collection-drawer');
    this.backdropEl = document.getElementById('drawer-backdrop');
    this.gridEl = document.getElementById('shelf-items-grid');
    this.totalCountEl = document.getElementById('total-prizes-count');
    this.openBtn = document.getElementById('btn-open-shelf');
    this.closeBtn = document.getElementById('btn-close-shelf');

    this.inventory = {
      bear: 0,
      fox: 0,
      cat: 0,
      pikachu: 0,
    };
    this.totalPrizes = 0;

    this.initEvents();
  }

  initEvents() {
    this.openBtn.addEventListener('click', () => this.open());
    this.closeBtn.addEventListener('click', () => this.close());
    this.backdropEl.addEventListener('click', () => this.close());

    // ESC key closes drawer
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen()) {
        this.close();
      }
    });
  }

  addPrize(type) {
    if (this.inventory[type] !== undefined) {
      this.inventory[type]++;
    } else {
      this.inventory[type] = 1;
    }
    this.totalPrizes++;
    this.render();
  }

  isOpen() {
    return this.drawerEl.classList.contains('open');
  }

  open() {
    this.drawerEl.classList.add('open');
    this.backdropEl.classList.add('active');
    this.render();
  }

  close() {
    this.drawerEl.classList.remove('open');
    this.backdropEl.classList.remove('active');
  }

  render() {
    this.totalCountEl.textContent = this.totalPrizes;

    if (this.totalPrizes === 0) {
      this.gridEl.innerHTML = `
        <div class="shelf-empty-msg">
          No plushies caught yet!<br>
          Insert a coin, aim with WASD, and drop the claw!
        </div>
      `;
      return;
    }

    this.gridEl.innerHTML = '';

    Object.keys(this.inventory).forEach(type => {
      const count = this.inventory[type];
      if (count > 0) {
        const config = PLUSHIE_CONFIGS[type] || { name: type };
        
        const card = document.createElement('div');
        card.className = 'shelf-card';

        const canvas = document.createElement('canvas');
        canvas.className = 'shelf-card-icon';
        canvas.width = 64;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');
        drawPlushie(ctx, type, 32, 32, 52);

        const nameEl = document.createElement('div');
        nameEl.className = 'shelf-card-name';
        nameEl.textContent = config.name;

        const countEl = document.createElement('div');
        countEl.className = 'shelf-card-count';
        countEl.textContent = `x${count}`;

        card.appendChild(canvas);
        card.appendChild(nameEl);
        card.appendChild(countEl);

        this.gridEl.appendChild(card);
      }
    });
  }
}
