/**
 * AudioManager · SFX + música de fondo.
 *
 * Uso:
 *   App.audio.play('correct');            // efecto puntual
 *   App.audio.playMusic('background');    // música en loop
 *   App.audio.toggleMute();               // mute/unmute
 *   App.audio.setMusicVolume(0.2);
 *   App.audio.setSfxVolume(0.8);
 *
 * Deshabilitar todo (ej: presentación sin sonido):
 *   App.audio = new App.AudioManager({ enabled: false });
 *
 * Para cambiar rutas o extensiones, editá DEFAULTS abajo.
 */
(function (global) {
  'use strict';

  /* ── Configuración editable ── */
  const DEFAULTS = {
    enabled:      true,
    musicPath:    'audio/music/',
    musicExt:     '.mp3',
    musicVolume:  0.25,
    sfxPath:      'audio/sfx/',
    sfxExt:       '.mp3',
    sfxVolume:    0.7,
    // sonidos que se precargan (el resto se carga on-demand)
    preloadSfx:   ['click', 'correct', 'wrong', 'card', 'win'],
    // throttle anti-spam (ms entre repeticiones del mismo sonido)
    throttleMs:   60
  };

  class AudioManager {
    constructor(options = {}) {
      this.config = { ...DEFAULTS, ...options };
      this._musicVolume = this.config.musicVolume;
      this._sfxVolume   = this.config.sfxVolume;
      this._muted       = false;
      this._music       = null;
      this._musicName   = null;
      this._pendingMusic = false;
      this._sfxCache    = {};
      this._lastPlayed  = {};

      if (!this.config.enabled) return;

      this._preloadSfx();
      this._bindAutoplayWorkaround();
    }

    /* ── SFX ── */

    /**
     * Reproduce un efecto. Si no existe el archivo, falla silencioso.
     * @param {string} name
     */
    play(name) {
      if (!this.config.enabled || this._muted) return;

      // throttle anti-spam
      const now  = performance.now();
      const last = this._lastPlayed[name] || 0;
      if (now - last < this.config.throttleMs) return;
      this._lastPlayed[name] = now;

      const template = this._getSfx(name);
      if (!template) return;

      // cloneNode permite solapar varias reproducciones del mismo sonido
      const node = template.cloneNode();
      node.volume = this._sfxVolume;
      node.play().catch(() => { /* autoplay bloqueado o archivo faltante */ });
    }

    _getSfx(name) {
      if (this._sfxCache[name]) return this._sfxCache[name];

      const audio = new Audio(this.config.sfxPath + name + this.config.sfxExt);
      audio.preload = 'auto';
      this._sfxCache[name] = audio;
      return audio;
    }

    _preloadSfx() {
      this.config.preloadSfx.forEach(name => this._getSfx(name));
    }

    /* ── Música ── */

    /**
     * Reproduce música de fondo en loop.
     * Si el navegador bloquea el autoplay, la inicia en el primer gesto del usuario.
     */
    playMusic(name = 'background') {
      if (!this.config.enabled) return;
      this._musicName = name;
      this.stopMusic();

      const audio = new Audio(this.config.musicPath + name + this.config.musicExt);
      audio.loop   = true;
      audio.volume = this._muted ? 0 : this._musicVolume;
      this._music  = audio;

      audio.play().catch(() => {
        // bloqueado por política de autoplay → esperamos el primer gesto
        this._pendingMusic = true;
      });
    }

    stopMusic() {
      if (this._music) {
        this._music.pause();
        this._music.currentTime = 0;
        this._music = null;
      }
    }

    _bindAutoplayWorkaround() {
      const start = () => {
        if (this._pendingMusic) {
          this._pendingMusic = false;
          this.playMusic(this._musicName || 'background');
        }
        document.removeEventListener('click', start);
        document.removeEventListener('keydown', start);
        document.removeEventListener('touchstart', start);
      };
      document.addEventListener('click', start);
      document.addEventListener('keydown', start);
      document.addEventListener('touchstart', start);
    }

    /* ── Volumen / mute ── */

    setMusicVolume(v) {
      this._musicVolume = Math.max(0, Math.min(1, v));
      if (this._music && !this._muted) this._music.volume = this._musicVolume;
    }

    setSfxVolume(v) {
      this._sfxVolume = Math.max(0, Math.min(1, v));
    }

    /** @returns {boolean} nuevo estado (true = muteado) */
    toggleMute() {
      this._muted = !this._muted;
      if (this._music) this._music.volume = this._muted ? 0 : this._musicVolume;
      return this._muted;
    }

    isMuted() { return this._muted; }
  }

  global.App = global.App || {};
  global.App.AudioManager = AudioManager;
  global.App.audio        = new AudioManager();
})(window);