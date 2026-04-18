(function () {
  const BD = window.BD;

  function createHeartTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#ff2d55';
    ctx.beginPath();
    ctx.moveTo(32, 56);
    ctx.bezierCurveTo(12, 40, 2, 26, 2, 16);
    ctx.bezierCurveTo(2, 6, 10, 2, 18, 2);
    ctx.bezierCurveTo(24, 2, 30, 6, 32, 12);
    ctx.bezierCurveTo(34, 6, 40, 2, 46, 2);
    ctx.bezierCurveTo(54, 2, 62, 6, 62, 16);
    ctx.bezierCurveTo(62, 26, 52, 40, 32, 56);
    ctx.fill();
    return new THREE.CanvasTexture(canvas);
  }

  BD.sections.register('finale', {
    hearts: [],
    heartTexture: null,

    init() {
      document.querySelector('#finale-ui .replay-btn').addEventListener('click', () => {
        BD.sections.goTo('reveal');
      });
    },

    enter() {
      BD.particles.createAmbient(200, 'warm');
      BD.particles.createPetals(20);
      BD.sections.showUI('finale-ui');

      this.heartTexture = createHeartTexture();
      this.createFloatingHearts();

      const finalText = document.querySelector('#finale-ui .final-text');
      gsap.fromTo(finalText, { opacity: 0, y: 20 }, {
        opacity: 1, y: 0, duration: 2, delay: 0.5,
      });

      const btn = document.querySelector('#finale-ui .replay-btn');
      gsap.fromTo(btn, { opacity: 0 }, { opacity: 1, duration: 1, delay: 3 });
    },

    createFloatingHearts() {
      this.hearts = [];
      const count = BD.engine.isMobile ? 15 : 25;

      for (let i = 0; i < count; i++) {
        const size = 0.2 + Math.random() * 0.4;
        const geo = new THREE.PlaneGeometry(size, size);
        const mat = new THREE.MeshBasicMaterial({
          map: this.heartTexture,
          transparent: true,
          opacity: 0.4 + Math.random() * 0.4,
          side: THREE.DoubleSide,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
        });

        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(
          (Math.random() - 0.5) * 14,
          (Math.random() - 0.5) * 10,
          (Math.random() - 0.5) * 6
        );
        mesh.userData = {
          speedY: 0.2 + Math.random() * 0.4,
          speedX: (Math.random() - 0.5) * 0.2,
          rotSpeed: (Math.random() - 0.5) * 1.5,
          wobble: Math.random() * Math.PI * 2,
          wobbleSpeed: 0.5 + Math.random() * 1.5,
          pulseSpeed: 1 + Math.random() * 2,
          baseScale: size,
        };

        BD.engine.scene.add(mesh);
        this.hearts.push(mesh);
      }
    },

    update(dt, elapsed) {
      BD.particles.updateAmbient(dt, 0.2);
      BD.particles.updatePetals(dt, elapsed);

      this.hearts.forEach(h => {
        const d = h.userData;
        h.position.y += d.speedY * dt;
        h.position.x += (d.speedX + Math.sin(elapsed * d.wobbleSpeed + d.wobble) * 0.15) * dt;
        h.rotation.z += d.rotSpeed * dt;

        const pulse = 1 + Math.sin(elapsed * d.pulseSpeed) * 0.1;
        h.scale.setScalar(pulse);

        if (h.position.y > 7) {
          h.position.y = -7;
          h.position.x = (Math.random() - 0.5) * 14;
        }
      });
    },

    exit() {
      BD.particles.removePetals();

      this.hearts.forEach(mesh => {
        BD.engine.scene.remove(mesh);
        mesh.geometry.dispose();
        mesh.material.dispose();
      });
      this.hearts = [];

      if (this.heartTexture) {
        this.heartTexture.dispose();
        this.heartTexture = null;
      }

      return Promise.resolve();
    },
  });
})();
