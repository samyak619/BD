(function () {
  const BD = window.BD;

  BD.sections.register('splash', {
    particles: null,

    init() {
      const splash = document.getElementById('splash');
      splash.addEventListener('click', () => this.onTap());
      splash.addEventListener('touchstart', (e) => {
        e.preventDefault();
        this.onTap();
      });
    },

    onTap() {
      if (BD.sections.current !== 'splash') return;

      BD.audio.play('melikeyuh');

      const splash = document.getElementById('splash');
      gsap.to(splash, {
        opacity: 0,
        duration: 0.8,
        onComplete: () => {
          splash.style.display = 'none';
          if (BD.sections.isBirthdayOrAfter()) {
            BD.sections.goTo('reveal');
          } else {
            BD.sections.goTo('countdown');
          }
        },
      });
    },

    enter() {
      BD.particles.createAmbient(200, 'warm');
      document.getElementById('splash').style.display = 'flex';
      document.getElementById('splash').style.opacity = '1';
    },

    update(dt) {
      BD.particles.updateAmbient(dt, 0.3);
    },

    exit() {
      return new Promise(r => setTimeout(r, 100));
    },
  });
})();
