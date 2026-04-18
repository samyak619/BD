(function () {
  const BD = window.BD;

  BD.sections.register('countdown', {
    hearts: null,
    timerInterval: null,

    init() {},

    enter() {
      BD.particles.createAmbient(600, 'warm');
      BD.sections.showUI('countdown-ui');

      this.createHearts();
      this.startTimer();

      const ui = document.getElementById('countdown-ui');
      gsap.fromTo(ui, { opacity: 0 }, { opacity: 1, duration: 1.5 });
    },

    createHearts() {
      const group = new THREE.Group();
      const heartShape = new THREE.Shape();

      heartShape.moveTo(0, 0.3);
      heartShape.bezierCurveTo(0, 0.5, -0.15, 0.6, -0.3, 0.6);
      heartShape.bezierCurveTo(-0.6, 0.6, -0.6, 0.2, -0.6, 0.2);
      heartShape.bezierCurveTo(-0.6, -0.1, -0.3, -0.35, 0, -0.6);
      heartShape.bezierCurveTo(0.3, -0.35, 0.6, -0.1, 0.6, 0.2);
      heartShape.bezierCurveTo(0.6, 0.2, 0.6, 0.6, 0.3, 0.6);
      heartShape.bezierCurveTo(0.15, 0.6, 0, 0.5, 0, 0.3);

      const geo = new THREE.ShapeGeometry(heartShape);
      const mat = new THREE.MeshBasicMaterial({
        color: 0xf4c87a,
        transparent: true,
        opacity: 0.25,
        side: THREE.DoubleSide,
      });

      const count = BD.engine.isMobile ? 8 : 15;
      for (let i = 0; i < count; i++) {
        const mesh = new THREE.Mesh(geo, mat.clone());
        mesh.position.set(
          (Math.random() - 0.5) * 12,
          (Math.random() - 0.5) * 8,
          (Math.random() - 0.5) * 6 - 2
        );
        mesh.scale.setScalar(Math.random() * 0.3 + 0.1);
        mesh.userData.speed = Math.random() * 0.5 + 0.2;
        mesh.userData.rotSpeed = (Math.random() - 0.5) * 0.5;
        mesh.userData.floatOffset = Math.random() * Math.PI * 2;
        group.add(mesh);
      }

      BD.engine.scene.add(group);
      this.hearts = group;
    },

    startTimer() {
      const update = () => {
        const now = Date.now();
        const target = BD.sections.getBirthdayTime();
        const diff = Math.max(0, target - now);

        const days = Math.floor(diff / 86400000);
        const hours = Math.floor((diff % 86400000) / 3600000);
        const mins = Math.floor((diff % 3600000) / 60000);
        const secs = Math.floor((diff % 60000) / 1000);

        document.getElementById('cd-days').textContent = String(days).padStart(2, '0');
        document.getElementById('cd-hours').textContent = String(hours).padStart(2, '0');
        document.getElementById('cd-mins').textContent = String(mins).padStart(2, '0');
        document.getElementById('cd-secs').textContent = String(secs).padStart(2, '0');

        if (diff <= 0) {
          clearInterval(this.timerInterval);
          BD.sections.goTo('reveal');
        }
      };

      update();
      this.timerInterval = setInterval(update, 1000);
    },

    update(dt, elapsed) {
      BD.particles.updateAmbient(dt, 0.5);

      if (this.hearts) {
        const mx = BD.engine.mouse.nx;
        const my = BD.engine.mouse.ny;
        this.hearts.rotation.y += (mx * 0.1 - this.hearts.rotation.y) * 0.02;
        this.hearts.rotation.x += (-my * 0.1 - this.hearts.rotation.x) * 0.02;

        this.hearts.children.forEach(h => {
          h.position.y += Math.sin(elapsed * h.userData.speed + h.userData.floatOffset) * 0.003;
          h.rotation.z += h.userData.rotSpeed * dt;
        });
      }
    },

    exit() {
      if (this.timerInterval) clearInterval(this.timerInterval);
      if (this.hearts) {
        BD.engine.scene.remove(this.hearts);
        this.hearts = null;
      }
      const ui = document.getElementById('countdown-ui');
      return new Promise(r => {
        gsap.to(ui, { opacity: 0, duration: 0.5, onComplete: r });
      });
    },
  });
})();
