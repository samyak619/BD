(function () {
  const BD = window.BD = window.BD || {};

  const ENGINE = BD.engine = {
    renderer: null,
    scene: null,
    camera: null,
    clock: null,
    mouse: { x: 0, y: 0, nx: 0, ny: 0 },
    isMobile: /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent),
    callbacks: [],

    init() {
      this.clock = new THREE.Clock();
      this.scene = new THREE.Scene();

      this.camera = new THREE.PerspectiveCamera(
        60,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
      );
      this.camera.position.set(0, 0, 5);

      this.renderer = new THREE.WebGLRenderer({
        canvas: document.getElementById('three-canvas'),
        antialias: !this.isMobile,
        alpha: false,
      });
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      this.renderer.setClearColor(0x0a0a0a, 1);

      window.addEventListener('resize', () => this.onResize());
      window.addEventListener('mousemove', (e) => this.onMouseMove(e));
      window.addEventListener('touchmove', (e) => this.onTouchMove(e), { passive: true });

      this.animate();
    },

    onResize() {
      const w = window.innerWidth;
      const h = window.innerHeight;
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(w, h);
    },

    onMouseMove(e) {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
      this.mouse.nx = (e.clientX / window.innerWidth) * 2 - 1;
      this.mouse.ny = -(e.clientY / window.innerHeight) * 2 + 1;
    },

    onTouchMove(e) {
      if (e.touches.length > 0) {
        this.mouse.x = e.touches[0].clientX;
        this.mouse.y = e.touches[0].clientY;
        this.mouse.nx = (e.touches[0].clientX / window.innerWidth) * 2 - 1;
        this.mouse.ny = -(e.touches[0].clientY / window.innerHeight) * 2 + 1;
      }
    },

    onUpdate(fn) {
      this.callbacks.push(fn);
    },

    removeUpdate(fn) {
      this.callbacks = this.callbacks.filter(cb => cb !== fn);
    },

    animate() {
      requestAnimationFrame(() => this.animate());
      const dt = this.clock.getDelta();
      const elapsed = this.clock.getElapsedTime();
      for (const cb of this.callbacks) cb(dt, elapsed);
      this.renderer.render(this.scene, this.camera);
    },
  };
})();
