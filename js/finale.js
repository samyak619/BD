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

  function createBalloonTexture(color) {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 96;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(32, 32, 26, 30, 0, 0, Math.PI * 2);
    ctx.fill();
    const grad = ctx.createRadialGradient(24, 22, 4, 32, 32, 28);
    grad.addColorStop(0, 'rgba(255,255,255,0.4)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(32, 32, 26, 30, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(28, 60);
    ctx.lineTo(32, 68);
    ctx.lineTo(36, 60);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(32, 68);
    ctx.bezierCurveTo(30, 78, 34, 85, 32, 94);
    ctx.stroke();
    return new THREE.CanvasTexture(canvas);
  }

  BD.sections.register('finale', {
    phase: 'cake',
    balloons: [],
    hearts: [],
    heartTexture: null,
    balloonTextures: [],

    init() {
      document.querySelector('#finale-ui .replay-btn').addEventListener('click', () => {
        BD.sections.goTo('reveal');
      });
    },

    enter() {
      this.phase = 'cake';
      this.balloons = [];
      this.hearts = [];
      BD.particles.createAmbient(200, 'warm');
      BD.sections.showUI('finale-ui');

      const finalText = document.querySelector('#finale-ui .final-text');
      finalText.style.opacity = '0';
      const btn = document.querySelector('#finale-ui .replay-btn');
      btn.style.opacity = '0';

      const cake = document.getElementById('cake-container');
      cake.classList.remove('cut');
      cake.style.display = 'block';
      cake.style.opacity = '1';
      cake.style.transform = 'scale(1)';

      const prompt = document.getElementById('cake-prompt');
      prompt.style.display = 'block';
      gsap.fromTo(prompt, { opacity: 0 }, { opacity: 1, duration: 1, delay: 0.5 });

      gsap.fromTo(cake, { scale: 0, opacity: 0 }, {
        scale: 1, opacity: 1, duration: 0.8, delay: 0.3, ease: 'back.out(1.7)',
      });

      cake.onclick = () => {
        if (this.phase === 'cake') this.cutCake();
      };
    },

    cutCake() {
      this.phase = 'balloons';

      const prompt = document.getElementById('cake-prompt');
      gsap.to(prompt, { opacity: 0, duration: 0.3 });

      const cake = document.getElementById('cake-container');
      cake.classList.add('cut');

      gsap.to(cake, {
        scale: 0.3,
        opacity: 0,
        duration: 0.8,
        ease: 'power2.in',
        onComplete: () => {
          cake.style.display = 'none';
        },
      });

      this.launchBalloons();
      gsap.delayedCall(3, () => this.showFinalMessage());
    },

    launchBalloons() {
      const colors = ['#ff6b8a', '#ff4081', '#e91e63', '#f48fb1', '#ffd700', '#ff9a9e', '#4fc3f7', '#81c784'];
      const count = BD.engine.isMobile ? 12 : 20;

      colors.forEach(c => {
        this.balloonTextures.push(createBalloonTexture(c));
      });

      for (let i = 0; i < count; i++) {
        const tex = this.balloonTextures[i % this.balloonTextures.length];
        const size = 0.5 + Math.random() * 0.4;
        const geo = new THREE.PlaneGeometry(size, size * 1.5);
        const mat = new THREE.MeshBasicMaterial({
          map: tex,
          transparent: true,
          opacity: 0.9,
          side: THREE.DoubleSide,
          depthWrite: false,
        });

        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(
          (Math.random() - 0.5) * 6,
          -5 - Math.random() * 3,
          1 + (Math.random() - 0.5) * 3
        );
        mesh.userData = {
          speedY: 1.5 + Math.random() * 1.5,
          wobble: Math.random() * Math.PI * 2,
          wobbleSpeed: 1 + Math.random() * 2,
          wobbleAmt: 0.3 + Math.random() * 0.5,
        };

        BD.engine.scene.add(mesh);
        this.balloons.push(mesh);
      }
    },

    showFinalMessage() {
      this.phase = 'hearts';
      this.heartTexture = createHeartTexture();
      BD.particles.createPetals(20);

      const count = BD.engine.isMobile ? 12 : 20;
      for (let i = 0; i < count; i++) {
        const size = 0.2 + Math.random() * 0.3;
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
          wobble: Math.random() * Math.PI * 2,
          wobbleSpeed: 0.5 + Math.random() * 1.5,
          pulseSpeed: 1 + Math.random() * 2,
        };
        BD.engine.scene.add(mesh);
        this.hearts.push(mesh);
      }

      const finalText = document.querySelector('#finale-ui .final-text');
      gsap.fromTo(finalText, { opacity: 0, y: 20 }, {
        opacity: 1, y: 0, duration: 2,
      });

      const btn = document.querySelector('#finale-ui .replay-btn');
      gsap.fromTo(btn, { opacity: 0 }, { opacity: 1, duration: 1, delay: 2 });
    },

    update(dt, elapsed) {
      BD.particles.updateAmbient(dt, 0.2);
      BD.particles.updatePetals(dt, elapsed);

      this.balloons.forEach(b => {
        const d = b.userData;
        b.position.y += d.speedY * dt;
        b.position.x += Math.sin(elapsed * d.wobbleSpeed + d.wobble) * d.wobbleAmt * dt;
        b.rotation.z = Math.sin(elapsed * d.wobbleSpeed + d.wobble) * 0.1;
      });

      this.hearts.forEach(h => {
        const d = h.userData;
        h.position.y += d.speedY * dt;
        h.position.x += (d.speedX + Math.sin(elapsed * d.wobbleSpeed + d.wobble) * 0.15) * dt;
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

      const cake = document.getElementById('cake-container');
      if (cake) { cake.style.display = 'none'; cake.onclick = null; }
      const prompt = document.getElementById('cake-prompt');
      if (prompt) prompt.style.display = 'none';

      this.balloons.forEach(mesh => {
        BD.engine.scene.remove(mesh);
        mesh.geometry.dispose();
        mesh.material.dispose();
      });
      this.balloons = [];
      this.balloonTextures.forEach(t => t.dispose());
      this.balloonTextures = [];

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
