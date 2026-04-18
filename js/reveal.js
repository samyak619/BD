(function () {
  const BD = window.BD;

  BD.sections.register('reveal', {
    confetti: null,
    confettiVelocities: null,

    init() {},

    enter() {
      BD.particles.removeAmbient();
      BD.sections.showUI('reveal-ui');

      this.burstParticles();
      this.startConfetti();
      this.animateText();
      BD.particles.createPetals(40);
    },

    burstParticles() {
      const count = BD.engine.isMobile ? 300 : 800;
      const positions = new Float32Array(count * 3);
      const colors = new Float32Array(count * 3);
      const velocities = [];
      const palette = [
        new THREE.Color(0xff6b8a),
        new THREE.Color(0xff6b8a),
        new THREE.Color(0xffd700),
        new THREE.Color(0xff9a9e),
      ];

      for (let i = 0; i < count; i++) {
        positions[i * 3] = 0;
        positions[i * 3 + 1] = 0;
        positions[i * 3 + 2] = 0;
        const c = palette[Math.floor(Math.random() * palette.length)];
        colors[i * 3] = c.r;
        colors[i * 3 + 1] = c.g;
        colors[i * 3 + 2] = c.b;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;
        const speed = Math.random() * 8 + 3;
        velocities.push({
          x: Math.sin(phi) * Math.cos(theta) * speed,
          y: Math.sin(phi) * Math.sin(theta) * speed,
          z: Math.cos(phi) * speed,
          decay: 0.96 + Math.random() * 0.03,
        });
      }

      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

      const mat = new THREE.PointsMaterial({
        size: 0.08,
        map: BD.particles.circleMap,
        vertexColors: true,
        transparent: true,
        opacity: 1,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });

      const points = new THREE.Points(geo, mat);
      BD.engine.scene.add(points);

      const burst = { points, geo, velocities, count, mat };

      const animate = (dt) => {
        const pos = burst.geo.attributes.position.array;
        for (let i = 0; i < burst.count; i++) {
          const v = burst.velocities[i];
          pos[i * 3] += v.x * dt;
          pos[i * 3 + 1] += v.y * dt;
          pos[i * 3 + 2] += v.z * dt;
          v.x *= v.decay;
          v.y *= v.decay;
          v.z *= v.decay;
        }
        burst.geo.attributes.position.needsUpdate = true;
        burst.mat.opacity *= 0.995;

        if (burst.mat.opacity < 0.01) {
          BD.engine.scene.remove(burst.points);
          BD.engine.removeUpdate(animate);
          burst.geo.dispose();
          burst.mat.dispose();
        }
      };

      BD.engine.onUpdate(animate);
    },

    startConfetti() {
      const count = BD.engine.isMobile ? 150 : 400;
      const positions = new Float32Array(count * 3);
      const colors = new Float32Array(count * 3);
      const palette = [
        new THREE.Color(0xff6b8a),
        new THREE.Color(0xff6b8a),
        new THREE.Color(0xffd700),
        new THREE.Color(0xffffff),
        new THREE.Color(0xff9a9e),
      ];

      const velocities = [];

      for (let i = 0; i < count; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 15;
        positions[i * 3 + 1] = Math.random() * 10 + 5;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
        const c = palette[Math.floor(Math.random() * palette.length)];
        colors[i * 3] = c.r;
        colors[i * 3 + 1] = c.g;
        colors[i * 3 + 2] = c.b;
        velocities.push({
          x: (Math.random() - 0.5) * 0.5,
          y: -(Math.random() * 2 + 1),
          z: (Math.random() - 0.5) * 0.3,
          wobble: Math.random() * 3,
        });
      }

      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

      const mat = new THREE.PointsMaterial({
        size: 0.09,
        map: BD.particles.circleMap,
        vertexColors: true,
        transparent: true,
        opacity: 0.9,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });

      const points = new THREE.Points(geo, mat);
      BD.engine.scene.add(points);
      this.confetti = { points, geo, velocities, count, mat };
      this.confettiVelocities = velocities;
    },

    animateText() {
      const hb = document.querySelector('#reveal-ui .hb-text');
      const age = document.querySelector('#reveal-ui .age');

      gsap.to(age, {
        opacity: 1,
        duration: 2,
        delay: 0.3,
      });

      gsap.to(hb, {
        opacity: 1,
        scale: 1,
        rotateY: 0,
        duration: 1.5,
        delay: 0.5,
        ease: 'back.out(1.7)',
      });

      gsap.delayedCall(5, () => {
        if (BD.sections.current === 'reveal') {
          BD.sections.goTo('story');
        }
      });
    },

    update(dt, elapsed) {
      BD.particles.updatePetals(dt, elapsed);
      if (this.confetti) {
        const pos = this.confetti.geo.attributes.position.array;
        for (let i = 0; i < this.confetti.count; i++) {
          const v = this.confettiVelocities[i];
          pos[i * 3] += (v.x + Math.sin(elapsed * v.wobble) * 0.3) * dt;
          pos[i * 3 + 1] += v.y * dt;
          pos[i * 3 + 2] += v.z * dt;

          if (pos[i * 3 + 1] < -6) {
            pos[i * 3 + 1] = 6 + Math.random() * 3;
            pos[i * 3] = (Math.random() - 0.5) * 15;
          }
        }
        this.confetti.geo.attributes.position.needsUpdate = true;
      }
    },

    exit() {
      if (this.confetti) {
        BD.engine.scene.remove(this.confetti.points);
        this.confetti.geo.dispose();
        this.confetti.mat.dispose();
        this.confetti = null;
      }

      BD.particles.removePetals();
      const ui = document.getElementById('reveal-ui');
      return new Promise(r => {
        gsap.to(ui, { opacity: 0, duration: 0.8, onComplete: r });
      });
    },
  });
})();
