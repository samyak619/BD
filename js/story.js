(function () {
  const BD = window.BD;

  const CHAPTERS = [
    { text: "We didn't exactly start as friends...", color: 'storm', progress: [0, 0.3] },
    { text: "But somewhere between the arguments, something changed...", color: 'transitioning', progress: [0.3, 0.6] },
    { text: "And now I can't imagine not having you", color: 'warm', progress: [0.6, 1.0] },
  ];

  BD.sections.register('story', {
    scrollProgress: 0,
    scrollTarget: 0,
    currentChapter: -1,
    wheelHandler: null,
    touchStartHandler: null,
    touchMoveHandler: null,
    touchStartY: 0,

    init() {},

    enter() {
      this.scrollProgress = 0;
      this.scrollTarget = 0;
      this.currentChapter = -1;

      BD.particles.createAmbient(500, 'storm');
      BD.sections.showUI('story-ui');

      document.body.style.overflow = 'hidden';

      const storyUI = document.getElementById('story-ui');
      gsap.fromTo(storyUI, { opacity: 0 }, { opacity: 1, duration: 1 });

      this.wheelHandler = (e) => {
        e.preventDefault();
        this.scrollTarget += e.deltaY * 0.0003;
        this.scrollTarget = Math.max(0, Math.min(1, this.scrollTarget));
      };

      this.touchStartHandler = (e) => {
        this.touchStartY = e.touches[0].clientY;
      };

      this.touchMoveHandler = (e) => {
        e.preventDefault();
        const dy = this.touchStartY - e.touches[0].clientY;
        this.scrollTarget += dy * 0.001;
        this.scrollTarget = Math.max(0, Math.min(1, this.scrollTarget));
        this.touchStartY = e.touches[0].clientY;
      };

      window.addEventListener('wheel', this.wheelHandler, { passive: false });
      window.addEventListener('touchstart', this.touchStartHandler, { passive: true });
      window.addEventListener('touchmove', this.touchMoveHandler, { passive: false });

      this.showChapterText(0);
    },

    showChapterText(index) {
      if (index === this.currentChapter) return;
      this.currentChapter = index;

      const textEl = document.getElementById('story-text');
      gsap.to(textEl, {
        opacity: 0,
        duration: 0.4,
        onComplete: () => {
          textEl.textContent = CHAPTERS[index].text;
          const chapterColor = index === 0 ? 'rgba(150,180,210,0.9)'
            : index === 1 ? 'rgba(220,190,150,0.9)'
            : 'rgba(255,107,138,0.95)';
          textEl.style.color = chapterColor;
          gsap.to(textEl, { opacity: 1, duration: 0.6 });
        },
      });
    },

    update(dt) {
      this.scrollProgress += (this.scrollTarget - this.scrollProgress) * 0.05;

      const p = this.scrollProgress;

      if (p < 0.3) {
        BD.particles.lerpAmbientColors('storm', 0.02);
      } else if (p < 0.6) {
        const t = (p - 0.3) / 0.3;
        BD.particles.lerpAmbientColors(t > 0.5 ? 'warm' : 'storm', 0.02);
      } else {
        BD.particles.lerpAmbientColors('warm', 0.02);
      }

      BD.particles.updateAmbient(dt, 0.5 + p * 0.5);

      BD.engine.camera.position.z = 5 - p * 3;
      BD.engine.camera.rotation.z = Math.sin(p * Math.PI) * 0.05;

      for (let i = 0; i < CHAPTERS.length; i++) {
        const [start, end] = CHAPTERS[i].progress;
        if (p >= start && p < end) {
          this.showChapterText(i);
          break;
        }
      }

      const hint = document.querySelector('#story-ui .scroll-hint');
      if (hint) hint.style.opacity = p > 0.05 ? '0' : '0.4';

      if (p >= 0.98) {
        BD.sections.goTo('gallery');
      }
    },

    exit() {
      if (this.wheelHandler) window.removeEventListener('wheel', this.wheelHandler);
      if (this.touchStartHandler) window.removeEventListener('touchstart', this.touchStartHandler);
      if (this.touchMoveHandler) window.removeEventListener('touchmove', this.touchMoveHandler);

      BD.engine.camera.position.set(0, 0, 5);
      BD.engine.camera.rotation.set(0, 0, 0);

      const ui = document.getElementById('story-ui');
      return new Promise(r => {
        gsap.to(ui, { opacity: 0, duration: 0.5, onComplete: r });
      });
    },
  });
})();
