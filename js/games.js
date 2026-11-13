/**
 * GameBase + QuizGame + RedFlagGame + ScenarioGame.
 */
(function (global) {
  'use strict';

  class GameBase {
    constructor(root, { onComplete } = {}) {
      this.root = root;
      this.onComplete = onComplete || (() => {});
      this.state = { index: 0, score: 0, locked: false, finished: false };
      this.items = [];
      this.el = {};
    }

    /** Dispara SFX si AudioManager está disponible. */
    sfx(name) {
      global.App?.audio?.play(name);
    }

    setFeedback(ok, msg) {
      if (!this.el.feedback) return;
      this.el.feedback.textContent = msg;
      this.el.feedback.className = 'feedback ' + (ok ? 'ok' : 'bad');
    }

    clearFeedback() {
      if (!this.el.feedback) return;
      this.el.feedback.textContent = '';
      this.el.feedback.className = 'feedback';
    }

    updateScore() {
      if (!this.el.score) return;
      const newText = `Aciertos: ${this.state.score}`;
      if (this.el.score.textContent === newText) return;
      this.el.score.textContent = newText;
      this.el.score.classList.remove('pop');
      void this.el.score.offsetWidth;
      this.el.score.classList.add('pop');
    }

    updateCounter(prefix = '') {
      if (this.el.counter) {
        this.el.counter.textContent = `${prefix}${this.state.index + 1} / ${this.items.length}`;
      }
    }

    toggle(el, visible) {
      if (el) el.hidden = !visible;
    }

    /** Reinicia una animación CSS en un elemento. */
    replayAnimation(el, cls) {
      if (!el) return;
      el.classList.remove(cls);
      void el.offsetWidth;
      el.classList.add(cls);
    }
  }

  /* ─── QUIZ ─────────────────────────────────────── */
  class QuizGame extends GameBase {
    constructor(root, config, options = {}) {
      super(root, options);
      this.items = config.questions;
      this.el = {
        counter:  root.querySelector('[data-role="counter"]'),
        score:    root.querySelector('[data-role="score"]'),
        question: root.querySelector('[data-role="question"]'),
        options:  root.querySelector('[data-role="options"]'),
        feedback: root.querySelector('[data-role="feedback"]'),
        next:     root.querySelector('[data-role="next"]'),
        restart:  root.querySelector('[data-role="restart"]')
      };
      this.bind();
      this.reset();
    }

    bind() {
      this.el.next?.addEventListener('click', () => this.next());
      this.el.restart?.addEventListener('click', () => this.reset());
    }

    reset() {
      this.state = { index: 0, score: 0, locked: false, finished: false };
      this.toggle(this.el.restart, false);
      this.toggle(this.el.next, false);
      this.render();
    }

    render() {
      const q = this.items[this.state.index];
      this.state.locked = false;
      this.updateCounter('Pregunta ');
      this.updateScore();
      this.clearFeedback();
      this.toggle(this.el.next, false);

      this.el.question.textContent = q.q;
      this.el.options.innerHTML = '';

      // Reiniciar animación del título
      this.replayAnimation(this.el.question, 'anim');

      q.options.forEach((text, idx) => {
        const btn = document.createElement('button');
        btn.className = 'option';
        btn.type = 'button';
        btn.textContent = text;
        btn.style.setProperty('--i', idx);   // ⚠️ ANTES de appendChild
        btn.addEventListener('click', () => this.answer(idx, btn));
        this.el.options.appendChild(btn);
      });
    }

    answer(idx, btn) {
      if (this.state.locked) return;
      this.state.locked = true;

      const q = this.items[this.state.index];
      const all = Array.from(this.el.options.children);
      all.forEach(o => (o.disabled = true));

      const correct = idx === q.correct;
      if (correct) this.state.score++;

      btn.classList.add(correct ? 'correct' : 'wrong');
      if (!correct) all[q.correct].classList.add('correct');

      this.setFeedback(correct, (correct ? '✅ ' : '❌ ') + q.why);
      this.updateScore();
      this.sfx(correct ? 'correct' : 'wrong');

      const isLast = this.state.index === this.items.length - 1;
      this.toggle(this.el.next, true);
      this.el.next.textContent = isLast ? 'Ver resultado →' : 'Siguiente →';
    }

    next() {
      if (this.state.index < this.items.length - 1) {
        this.state.index++;
        this.render();
      } else {
        this.finish();
      }
    }

    finish() {
      this.state.finished = true;
      this.el.counter.textContent = 'Resultado';
      this.el.score.textContent = '';
      this.el.question.textContent = `Acertaste ${this.state.score} de ${this.items.length}.`;
      this.el.options.innerHTML = '';
      this.toggle(this.el.next, false);
      this.toggle(this.el.restart, true);

      const ratio = this.state.score / this.items.length;
      const msg = ratio === 1 ? '🌟 ¡Perfecto!'
                : ratio >= 0.6 ? '👏 Muy bien: repasá lo que falló.'
                : '💪 Repasá y volvé a intentarlo.';
      this.setFeedback(true, msg);
      this.sfx('win');
      this.onComplete(this.state.score, this.items.length);
    }
  }

  /* ─── RED FLAG ─────────────────────────────────── */
  class RedFlagGame extends GameBase {
    constructor(root, config, options = {}) {
      super(root, options);
      this.items = config.cards;
      this.el = {
        counter:   root.querySelector('[data-role="counter"]'),
        score:     root.querySelector('[data-role="score"]'),
        statement: root.querySelector('[data-role="statement"]'),
        feedback:  root.querySelector('[data-role="feedback"]'),
        red:       root.querySelector('[data-role="red"]'),
        green:     root.querySelector('[data-role="green"]'),
        restart:   root.querySelector('[data-role="restart"]')
      };
      this.bind();
      this.reset();
    }

    bind() {
      this.el.red?.addEventListener('click',   () => this.answer('red'));
      this.el.green?.addEventListener('click', () => this.answer('green'));
      this.el.restart?.addEventListener('click', () => this.reset());
    }

    reset() {
      this.state = { index: 0, score: 0, locked: false, finished: false };
      this.toggle(this.el.restart, false);
      this.toggle(this.el.red, true);
      this.toggle(this.el.green, true);
      this.render();
    }

    render() {
      const card = this.items[this.state.index];
      this.state.locked = false;

      this.updateCounter('Tarjeta ');
      this.updateScore();
      this.clearFeedback();

      this.el.statement.textContent = card.text;
      this.replayAnimation(this.el.statement, 'pop');
      this.sfx('card');

      [this.el.red, this.el.green].forEach(b => {
        if (!b) return;
        b.disabled = false;
        b.classList.remove('correct', 'wrong');
      });
    }

    answer(choice) {
      if (this.state.locked) return;
      const card = this.items[this.state.index];
      const correct = choice === card.flag;
      if (correct) this.state.score++;

      this.state.locked = true;
      this.el.red.disabled = true;
      this.el.green.disabled = true;

      const chosen = choice === 'red' ? this.el.red : this.el.green;
      chosen.classList.add(correct ? 'correct' : 'wrong');
      if (!correct) {
        (card.flag === 'red' ? this.el.red : this.el.green).classList.add('correct');
      }

      this.setFeedback(correct,
        correct ? '✅ ¡Correcto!' :
        card.flag === 'red' ? '❌ Era una RED FLAG.' : '❌ Era una GREEN FLAG.');
      this.updateScore();
      this.sfx(correct ? 'correct' : 'wrong');

      setTimeout(() => {
        this.state.locked = false;
        this.state.index++;
        if (this.state.index >= this.items.length) this.finish();
        else this.render();
      }, 1200);
    }

    finish() {
      this.state.finished = true;
      this.el.counter.textContent = 'Resultado';
      this.el.score.textContent = '';
      this.el.statement.textContent = `¡Terminaste! Acertaste ${this.state.score} de ${this.items.length}.`;
      this.setFeedback(true,
        this.state.score >= 7 ? '🌟 Ojo entrenado.' :
        this.state.score >= 5 ? '👍 Vas bien, seguí practicando.' :
                                '💪 Repasá las señales y volvé a intentarlo.');
      this.toggle(this.el.red, false);
      this.toggle(this.el.green, false);
      this.toggle(this.el.restart, true);
      this.sfx('win');
      this.onComplete(this.state.score, this.items.length);
    }
  }

  /* ─── SCENARIO ─────────────────────────────────── */
  class ScenarioGame extends GameBase {
    constructor(root, config, options = {}) {
      super(root, options);
      this.items = config.scenarios;
      this.el = {
        counter:   root.querySelector('[data-role="counter"]'),
        situation: root.querySelector('[data-role="situation"]'),
        options:   root.querySelector('[data-role="options"]'),
        feedback:  root.querySelector('[data-role="feedback"]'),
        next:      root.querySelector('[data-role="next"]'),
        restart:   root.querySelector('[data-role="restart"]')
      };
      this.bind();
      this.reset();
    }

    bind() {
      this.el.next?.addEventListener('click', () => this.next());
      this.el.restart?.addEventListener('click', () => this.reset());
    }

    reset() {
      this.state = { index: 0, score: 0, locked: false, finished: false };
      this.toggle(this.el.restart, false);
      this.toggle(this.el.next, false);
      this.render();
    }

    render() {
      const sc = this.items[this.state.index];
      this.state.locked = false;
      this.updateCounter('Caso ');
      this.clearFeedback();
      this.toggle(this.el.next, false);

      this.el.situation.textContent = sc.situation;
      this.el.options.innerHTML = '';
      this.replayAnimation(this.el.situation, 'anim');

      sc.options.forEach((opt, idx) => {
        const btn = document.createElement('button');
        btn.className = 'option';
        btn.type = 'button';
        btn.textContent = opt.text;
        btn.style.setProperty('--i', idx);   // ⚠️ ANTES de appendChild
        btn.addEventListener('click', () => this.answer(idx, btn));
        this.el.options.appendChild(btn);
      });
    }

    answer(idx, btn) {
      if (this.state.locked) return;
      this.state.locked = true;

      const sc = this.items[this.state.index];
      const all = Array.from(this.el.options.children);
      all.forEach(o => (o.disabled = true));

      const chosen = sc.options[idx];
      const ok = chosen.style === 'assertive';
      btn.classList.add('style-' + chosen.style);

      const assertiveIdx = sc.options.findIndex(o => o.style === 'assertive');
      if (assertiveIdx !== -1 && idx !== assertiveIdx) {
        all[assertiveIdx].classList.add('style-assertive');
      }

      this.setFeedback(ok, chosen.feedback);
      this.sfx(ok ? 'correct' : 'wrong');

      const isLast = this.state.index === this.items.length - 1;
      this.toggle(this.el.next, true);
      this.el.next.textContent = isLast ? 'Ver resultado →' : 'Siguiente caso →';
    }

    next() {
      if (this.state.index < this.items.length - 1) {
        this.state.index++;
        this.render();
      } else {
        this.finish();
      }
    }

    finish() {
      this.state.finished = true;
      this.el.counter.textContent = '¡Listo!';
      this.el.situation.textContent = 'Ya viste los 4 casos. Lo importante es reconocer el estilo asertivo en cada situación.';
      this.el.options.innerHTML = '';
      this.toggle(this.el.next, false);
      this.toggle(this.el.restart, true);
      this.setFeedback(true, '💬 La asertividad se entrena: cuanto más la practicás, más natural sale.');
      this.sfx('win');
    }
  }

  global.App = global.App || {};
  global.App.QuizGame     = QuizGame;
  global.App.RedFlagGame  = RedFlagGame;
  global.App.ScenarioGame = ScenarioGame;
})(window);