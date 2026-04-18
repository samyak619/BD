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

  function createCakeTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 300;
    canvas.height = 350;
    const ctx = canvas.getContext('2d');

    const plateY = 310;
    ctx.fillStyle = '#aaa';
    ctx.beginPath();
    ctx.ellipse(150, plateY, 140, 18, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ccc';
    ctx.beginPath();
    ctx.ellipse(150, plateY - 3, 140, 18, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#c9785d';
    ctx.fillRect(35, 210, 230, 100);
    ctx.fillStyle = '#d4956a';
    ctx.beginPath();
    ctx.ellipse(150, 210, 115, 20, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#c9785d';
    ctx.beginPath();
    ctx.ellipse(150, 310, 115, 20, 0, 0, Math.PI, 0);
    ctx.fill();

    ctx.fillStyle = '#e8a87c';
    ctx.fillRect(25, 140, 250, 75);
    ctx.fillStyle = '#edba92';
    ctx.beginPath();
    ctx.ellipse(150, 140, 125, 20, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#e8a87c';
    ctx.beginPath();
    ctx.ellipse(150, 215, 125, 20, 0, 0, Math.PI, 0);
    ctx.fill();

    ctx.fillStyle = '#ffb6c1';
    ctx.fillRect(20, 130, 260, 15);
    ctx.beginPath();
    ctx.ellipse(150, 130, 130, 15, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#fff';
    for (let i = 0; i < 10; i++) {
      const x = 30 + i * 25 + 10;
      ctx.beginPath();
      ctx.arc(x, 143, 10, Math.PI, 0);
      ctx.fill();
    }

    ctx.fillStyle = '#ff6b8a';
    ctx.fillRect(25, 200, 250, 8);
    ctx.beginPath();
    ctx.ellipse(150, 200, 125, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    const candleColors = ['#ff6b8a', '#ffb6c1', '#ff4081', '#f48fb1', '#ff6b8a'];
    const candleX = [70, 110, 150, 190, 230];
    candleX.forEach((x, i) => {
      ctx.fillStyle = candleColors[i];
      ctx.fillRect(x - 4, 65, 8, 65);

      ctx.fillStyle = '#ffd700';
      ctx.beginPath();
      ctx.ellipse(x, 55, 7, 14, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffaa00';
      ctx.beginPath();
      ctx.ellipse(x, 58, 4, 8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.ellipse(x, 52, 2, 4, 0, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 22px Playfair Display, serif';
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(0,0,0,0.3)';
    ctx.shadowBlur = 4;
    ctx.fillText('Happy 24th!', 150, 185);
    ctx.shadowBlur = 0;

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

  function createKnifeCursor() {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');

    ctx.strokeStyle = '#ccc';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(4, 28);
    ctx.lineTo(20, 12);
    ctx.stroke();

    ctx.fillStyle = '#888';
    ctx.beginPath();
    ctx.moveTo(18, 14);
    ctx.lineTo(28, 2);
    ctx.lineTo(30, 4);
    ctx.lineTo(22, 16);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = '#aaa';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(18, 14);
    ctx.lineTo(28, 2);
    ctx.stroke();

    return 'url(' + canvas.toDataURL() + ') 4 28, pointer';
  }

  BD.sections.register('finale', {
    phase: 'cake',
    cakeMesh: null,
    cakeLeftMesh: null,
    cakeRightMesh: null,
    balloons: [],
    hearts: [],
    heartTexture: null,
    balloonTextures: [],
    clickHandler: null,
    knifeCursor: null,

    init() {
      document.querySelector('#finale-ui .replay-btn').addEventListener('click', () => {
        BD.sections.goTo('reveal');
      });
      this.knifeCursor = createKnifeCursor();
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

      const cakePrompt = document.getElementById('cake-prompt');
      if (cakePrompt) {
        cakePrompt.style.display = 'block';
        gsap.fromTo(cakePrompt, { opacity: 0 }, { opacity: 1, duration: 1, delay: 0.5 });
      }

      this.createCake();
      document.body.style.cursor = this.knifeCursor;

      this.clickHandler = (e) => this.onClick(e);
      window.addEventListener('click', this.clickHandler);
    },

    createCake() {
      const texture = createCakeTexture();
      const geo = new THREE.PlaneGeometry(2.5, 2.9);
      const mat = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        side: THREE.DoubleSide,
      });
      this.cakeMesh = new THREE.Mesh(geo, mat);
      this.cakeMesh.position.set(0, -0.3, 3);
      BD.engine.scene.add(this.cakeMesh);

      gsap.fromTo(this.cakeMesh.scale, { x: 0, y: 0, z: 0 }, {
        x: 1, y: 1, z: 1,
        duration: 0.8,
        ease: 'back.out(1.7)',
      });
    },

    onClick(e) {
      if (this.phase !== 'cake' || !this.cakeMesh) return;

      const mouse = new THREE.Vector2(
        (e.clientX / window.innerWidth) * 2 - 1,
        -(e.clientY / window.innerHeight) * 2 + 1
      );

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, BD.engine.camera);
      const intersects = raycaster.intersectObject(this.cakeMesh);

      if (intersects.length > 0) {
        this.cutCake();
      }
    },

    cutCake() {
      this.phase = 'balloons';
      document.body.style.cursor = 'default';

      const cakePrompt = document.getElementById('cake-prompt');
      if (cakePrompt) gsap.to(cakePrompt, { opacity: 0, duration: 0.3 });

      const texture = this.cakeMesh.material.map;

      const leftCanvas = document.createElement('canvas');
      leftCanvas.width = 128;
      leftCanvas.height = 300;
      const lctx = leftCanvas.getContext('2d');
      lctx.drawImage(texture.image, 0, 0, 128, 300, 0, 0, 128, 300);
      const leftTex = new THREE.CanvasTexture(leftCanvas);

      const rightCanvas = document.createElement('canvas');
      rightCanvas.width = 128;
      rightCanvas.height = 300;
      const rctx = rightCanvas.getContext('2d');
      rctx.drawImage(texture.image, 128, 0, 128, 300, 0, 0, 128, 300);
      const rightTex = new THREE.CanvasTexture(rightCanvas);

      const leftGeo = new THREE.PlaneGeometry(1.5, 3.5);
      const leftMat = new THREE.MeshBasicMaterial({ map: leftTex, transparent: true, side: THREE.DoubleSide });
      this.cakeLeftMesh = new THREE.Mesh(leftGeo, leftMat);
      this.cakeLeftMesh.position.copy(this.cakeMesh.position);
      this.cakeLeftMesh.position.x -= 0.75;

      const rightGeo = new THREE.PlaneGeometry(1.5, 3.5);
      const rightMat = new THREE.MeshBasicMaterial({ map: rightTex, transparent: true, side: THREE.DoubleSide });
      this.cakeRightMesh = new THREE.Mesh(rightGeo, rightMat);
      this.cakeRightMesh.position.copy(this.cakeMesh.position);
      this.cakeRightMesh.position.x += 0.75;

      BD.engine.scene.remove(this.cakeMesh);
      this.cakeMesh.geometry.dispose();
      this.cakeMesh.material.dispose();
      this.cakeMesh = null;

      BD.engine.scene.add(this.cakeLeftMesh);
      BD.engine.scene.add(this.cakeRightMesh);

      gsap.to(this.cakeLeftMesh.position, { x: -2.5, duration: 0.8, ease: 'power2.out' });
      gsap.to(this.cakeLeftMesh.rotation, { z: -0.3, duration: 0.8 });
      gsap.to(this.cakeLeftMesh.material, { opacity: 0, duration: 1, delay: 0.5 });

      gsap.to(this.cakeRightMesh.position, { x: 2.5, duration: 0.8, ease: 'power2.out' });
      gsap.to(this.cakeRightMesh.rotation, { z: 0.3, duration: 0.8 });
      gsap.to(this.cakeRightMesh.material, { opacity: 0, duration: 1, delay: 0.5 });

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
          rotSpeed: (Math.random() - 0.5) * 0.5,
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

      if (this.cakeMesh) {
        this.cakeMesh.position.y = -0.3 + Math.sin(elapsed * 1.5) * 0.05;
      }

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
      document.body.style.cursor = 'default';
      BD.particles.removePetals();
      if (this.clickHandler) window.removeEventListener('click', this.clickHandler);

      if (this.cakeMesh) {
        BD.engine.scene.remove(this.cakeMesh);
        this.cakeMesh.geometry.dispose();
        this.cakeMesh.material.map.dispose();
        this.cakeMesh.material.dispose();
        this.cakeMesh = null;
      }

      [this.cakeLeftMesh, this.cakeRightMesh].forEach(m => {
        if (m) {
          BD.engine.scene.remove(m);
          m.geometry.dispose();
          if (m.material.map) m.material.map.dispose();
          m.material.dispose();
        }
      });
      this.cakeLeftMesh = null;
      this.cakeRightMesh = null;

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

      const cakePrompt = document.getElementById('cake-prompt');
      if (cakePrompt) cakePrompt.style.display = 'none';

      return Promise.resolve();
    },
  });
})();
