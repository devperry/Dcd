/**
 * SlideDeck (navegación) + inicialización de juegos.
 */
(function (global) {
  'use strict';

  const TIMING = 'cubic-bezier(.2,.85,.25,1)';

  class SlideDeck {
    constructor(root) {
      this.root = root;
      this.slides = Array.from(root.querySelectorAll('.slide'));
      this.index = 0;
      this.bar = document.getElementById('bar');
      this.bind();
      this.show(0, { force: true });
    }

    bind() {
      document.addEventListener('keydown', e => this.onKey(e));

      let touchStart = null;
      document.addEventListener('touchstart', e => {
        const t = e.changedTouches[0];
        touchStart = { x: t.clientX, y: t.clientY };
      }, { passive: true });
      document.addEventListener('touchend', e => {
        if (!touchStart) return;
        const t = e.changedTouches[0];
        const dx = t.clientX - touchStart.x;
        const dy = t.clientY - touchStart.y;
        if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.4) {
          this.show(this.index + (dx < 0 ? 1 : -1));
        }
        touchStart = null;
      }, { passive: true });

      document.getElementById('edgeLeft')?.addEventListener('click',  () => this.show(this.index - 1));
      document.getElementById('edgeRight')?.addEventListener('click', () => this.show(this.index + 1));
    }

    onKey(e) {
      const tag = (e.target.tagName || '').toLowerCase();
      if (['input', 'textarea', 'select'].includes(tag)) return;
      if (e.key === ' ' && tag === 'button') return;

      const map = {
        ArrowRight: 1, ArrowDown: 1, PageDown: 1, ' ': 1,
        ArrowLeft: -1, ArrowUp: -1, PageUp: -1, Backspace: -1
      };
      if (e.key in map) {
        e.preventDefault();
        this.show(this.index + map[e.key]);
      } else if (e.key === 'Home') { e.preventDefault(); this.show(0); }
      else if (e.key === 'End')   { e.preventDefault(); this.show(this.slides.length - 1); }
      else if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        global.App?.audio?.toggleMute();
      }
    }

    show(i, { force = false } = {}) {
      if (!force && (i < 0 || i >= this.slides.length || i === this.index)) return;

      const direction = i >= this.index ? 1 : -1;

      // Limpiar TODAS las slides (por si hubo navegación rápida)
      this.slides.forEach(s =>
        s.classList.remove('active', 'is-entering-forward', 'is-entering-backward')
      );

      this.index = i;
      const slide = this.slides[this.index];

      // Forzar reflow antes de aplicar clases (clave para reiniciar animación)
      void slide.offsetWidth;

      slide.classList.add('active');
      slide.classList.add(direction >= 0 ? 'is-entering-forward' : 'is-entering-backward');
      slide.scrollTop = 0;

      this.animate(slide);
      this.updateBar();
      global.App?.audio?.play('click');
    }

    /**
     * Asigna animaciones variadas:
     * - `.rv` → animación según el tipo de elemento (o data-anim)
     * - mensajes de chat → msgPop stagger (WhatsApp style)
     * - semáforo → popIn stagger
     *
     * Importante: el `delay` va DENTRO del shorthand `animation`
     * para evitar bugs de reinicio entre navegaciones.
     */
    animate(slide) {
      const rvList    = Array.from(slide.querySelectorAll('.rv'));
      const msgList   = Array.from(slide.querySelectorAll('.phone__chat .msg'));
      const lightList = Array.from(slide.querySelectorAll('.traffic .light'));

      const all = [...rvList, ...msgList, ...lightList];

      // 1) Resetear animaciones
      all.forEach(el => { el.style.animation = 'none'; });

      // 2) Reflow único (obliga al navegador a aplicar el estado "none")
      void slide.offsetWidth;

      // 3) Aplicar animaciones (delay incluido en el shorthand)
      rvList.forEach((el, i) => {
        const name  = this.pickAnimation(el);
        const delay = (0.05 + i * 0.07).toFixed(3);
        el.style.animation = `${name} 0.55s ${TIMING} ${delay}s both`;
      });

      msgList.forEach((el, i) => {
        const delay = (0.15 + i * 0.08).toFixed(3);
        el.style.animation = `msgPop 0.4s cubic-bezier(.2,.9,.3,1.2) ${delay}s both`;
      });

      lightList.forEach((el, i) => {
        const delay = (0.15 + i * 0.12).toFixed(3);
        el.style.animation = `popIn 0.5s cubic-bezier(.2,.9,.3,1.2) ${delay}s both`;
      });
    }

    /**
     * Tipo de animación por elemento. Sobreescribible con data-anim="..." .
     */
    pickAnimation(el) {
      if (el.dataset.anim) return el.dataset.anim;
      if (el.matches('h1, h2'))                               return 'blurIn';
      if (el.matches('.badge'))                               return 'slideInDown';
      if (el.matches('.lead, .objetivo'))                     return 'slideInUp';
      if (el.matches('.example, .note, .reflect, .remember')) return 'slideInLeft';
      if (el.matches('.pill-row'))                            return 'popIn';
      if (el.matches('.checklist'))                           return 'slideInUp';
      if (el.matches('.chat-layout'))                         return 'slideInLeft';
      if (el.matches('.traffic'))                             return 'slideInUp';
      if (el.matches('.game'))                                return 'popIn';
      if (el.matches('.card'))                                return 'bounceIn';
      return 'riseIn';
    }

    updateBar() {
      if (!this.bar) return;
      this.bar.style.width = ((this.index + 1) / this.slides.length * 100) + '%';
      this.bar.classList.remove('flash');
      void this.bar.offsetWidth;
      this.bar.classList.add('flash');
    }
  }

  /* ─── Bootstrap ─── */
  const gameClasses = {
    quiz:     () => global.App.QuizGame,
    redflag:  () => global.App.RedFlagGame,
    scenario: () => global.App.ScenarioGame
  };

  function initGames() {
    document.querySelectorAll('[data-game]').forEach(root => {
      const type   = root.dataset.game;
      const config = root.dataset.config;
      const Klass  = gameClasses[type]?.();
      const data   = global.App.data[config];

      if (!Klass || !data) {
        console.warn(`[app] No se pudo inicializar "${type}" (config: "${config}")`);
        return;
      }
      new Klass(root, data);
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    const deckRoot = document.getElementById('deck');
    if (deckRoot) new SlideDeck(deckRoot);
    initGames();
    global.App?.audio?.playMusic('background');
  });

  global.App = global.App || {};
  global.App.SlideDeck = SlideDeck;
})(window);
