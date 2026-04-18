(function () {
  const BD = window.BD;

  // TODO: Change back to '2026-05-01T00:00:00+05:30' before deploying!
  const BIRTHDAY = new Date('2026-04-18T00:00:00+05:30');

  BD.sections = {
    current: null,
    registry: {},
    transitioning: false,

    register(name, section) {
      this.registry[name] = section;
    },

    isBirthdayOrAfter() {
      return Date.now() >= BIRTHDAY.getTime();
    },

    getBirthdayTime() {
      return BIRTHDAY.getTime();
    },

    async goTo(name) {
      if (this.transitioning) return;
      if (this.current === name) return;
      this.transitioning = true;

      const prev = this.registry[this.current];
      const next = this.registry[name];

      if (prev && prev.exit) {
        await prev.exit();
      }

      this.hideAllUI();
      this.current = name;

      if (next && next.enter) {
        await next.enter();
      }

      this.transitioning = false;
    },

    hideAllUI() {
      const ids = [
        'countdown-ui', 'reveal-ui', 'story-ui',
        'universe-ui', 'gallery-ui', 'wishes-ui',
        'letter-ui', 'finale-ui',
      ];
      ids.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
      });
    },

    showUI(id) {
      const el = document.getElementById(id);
      if (el) el.style.display = 'flex';
    },

    start() {
      BD.engine.init();
      BD.audio.init();
      BD.particles.initTrail();

      Object.values(this.registry).forEach(s => {
        if (s.init) s.init();
      });

      BD.engine.onUpdate((dt, elapsed) => {
        BD.particles.updateTrail();
        const sec = this.registry[this.current];
        if (sec && sec.update) sec.update(dt, elapsed);
      });

      this.goTo('splash');
    },
  };
})();
