(function () {
  const BD = window.BD;

  BD.audio = {
    tracks: {},
    currentTrack: null,
    isPlaying: false,
    btn: null,

    init() {
      this.btn = document.getElementById('music-btn');
      this.tracks.melikeyuh = new Audio('assets/audio/me-like-yuh.mp3');
      this.tracks.mommae = new Audio('assets/audio/mommae.mp3');

      Object.values(this.tracks).forEach(t => {
        t.loop = true;
        t.volume = 0;
      });

      this.btn.addEventListener('click', () => this.toggle());
    },

    play(trackName) {
      const track = this.tracks[trackName];
      if (!track) return;

      if (this.currentTrack && this.currentTrack !== track) {
        this.fadeOut(this.currentTrack);
      }

      this.currentTrack = track;
      track.play().catch(() => {});
      this.fadeIn(track);
      this.isPlaying = true;
      this.btn.style.display = 'flex';
      this.btn.textContent = '\u266B';
    },

    switchTo(trackName) {
      if (this.currentTrack === this.tracks[trackName]) return;
      this.play(trackName);
    },

    fadeIn(track, duration) {
      duration = duration || 1000;
      track.volume = 0;
      const steps = 20;
      const inc = 0.7 / steps;
      const interval = duration / steps;
      let step = 0;
      const id = setInterval(() => {
        step++;
        track.volume = Math.min(0.7, track.volume + inc);
        if (step >= steps) clearInterval(id);
      }, interval);
    },

    fadeOut(track, duration) {
      duration = duration || 800;
      const steps = 20;
      const dec = track.volume / steps;
      const interval = duration / steps;
      let step = 0;
      const id = setInterval(() => {
        step++;
        track.volume = Math.max(0, track.volume - dec);
        if (step >= steps) {
          clearInterval(id);
          track.pause();
        }
      }, interval);
    },

    toggle() {
      if (!this.currentTrack) return;
      if (this.isPlaying) {
        this.currentTrack.pause();
        this.isPlaying = false;
        this.btn.textContent = '\u2715';
      } else {
        this.currentTrack.play().catch(() => {});
        this.isPlaying = true;
        this.btn.textContent = '\u266B';
      }
    },

    pause() {
      if (this.currentTrack) {
        this.currentTrack.pause();
        this.isPlaying = false;
      }
    },
  };
})();
