(function () {
  const BD = window.BD;

  const circleCanvas = document.createElement('canvas');
  circleCanvas.width = 64;
  circleCanvas.height = 64;
  const ctx = circleCanvas.getContext('2d');
  const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  gradient.addColorStop(0, 'rgba(255,255,255,1)');
  gradient.addColorStop(0.5, 'rgba(255,255,255,0.6)');
  gradient.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 64, 64);
  const circleTexture = new THREE.CanvasTexture(circleCanvas);

  BD.particles = {
    circleMap: circleTexture,
    ambient: null,
    trail: null,
    trailMode: 'warm',

    createAmbient(count, colorScheme) {
      if (this.ambient) {
        BD.engine.scene.remove(this.ambient.points);
        this.ambient = null;
      }

      const cnt = BD.engine.isMobile ? Math.floor(count * 0.4) : count;
      const positions = new Float32Array(cnt * 3);
      const colors = new Float32Array(cnt * 3);
      const sizes = new Float32Array(cnt);
      const velocities = [];

      const palettes = {
        warm: [
          new THREE.Color(0xff6b8a),
          new THREE.Color(0xff8fab),
          new THREE.Color(0xffd1dc),
          new THREE.Color(0xf48fb1),
        ],
        storm: [
          new THREE.Color(0x6688aa),
          new THREE.Color(0x445566),
          new THREE.Color(0x8899aa),
          new THREE.Color(0x334455),
        ],
      };

      const palette = palettes[colorScheme] || palettes.warm;

      for (let i = 0; i < cnt; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 20;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 20;

        const c = palette[Math.floor(Math.random() * palette.length)];
        colors[i * 3] = c.r;
        colors[i * 3 + 1] = c.g;
        colors[i * 3 + 2] = c.b;

        sizes[i] = Math.random() * 3 + 1;

        velocities.push({
          x: (Math.random() - 0.5) * 0.3,
          y: (Math.random() - 0.5) * 0.3,
          z: (Math.random() - 0.5) * 0.3,
        });
      }

      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

      const mat = new THREE.PointsMaterial({
        size: 0.08,
        map: circleTexture,
        vertexColors: true,
        transparent: true,
        opacity: 0.7,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        sizeAttenuation: true,
      });

      const points = new THREE.Points(geo, mat);
      BD.engine.scene.add(points);

      this.ambient = { points, geo, velocities, count: cnt };
      return this.ambient;
    },

    updateAmbient(dt, mouseInfluence) {
      if (!this.ambient) return;
      const pos = this.ambient.geo.attributes.position.array;
      const mx = BD.engine.mouse.nx * (mouseInfluence || 0.5);
      const my = BD.engine.mouse.ny * (mouseInfluence || 0.5);

      for (let i = 0; i < this.ambient.count; i++) {
        const v = this.ambient.velocities[i];
        pos[i * 3] += (v.x + mx * 0.02) * dt;
        pos[i * 3 + 1] += (v.y + my * 0.02) * dt;
        pos[i * 3 + 2] += v.z * dt;

        if (Math.abs(pos[i * 3]) > 10) v.x *= -1;
        if (Math.abs(pos[i * 3 + 1]) > 10) v.y *= -1;
        if (Math.abs(pos[i * 3 + 2]) > 10) v.z *= -1;
      }
      this.ambient.geo.attributes.position.needsUpdate = true;
    },

    lerpAmbientColors(targetScheme, speed) {
      if (!this.ambient) return;
      const palettes = {
        warm: [
          new THREE.Color(0xff6b8a),
          new THREE.Color(0xff8fab),
          new THREE.Color(0xffd1dc),
          new THREE.Color(0xf48fb1),
        ],
        storm: [
          new THREE.Color(0x6688aa),
          new THREE.Color(0x445566),
          new THREE.Color(0x8899aa),
          new THREE.Color(0x334455),
        ],
      };
      const palette = palettes[targetScheme] || palettes.warm;
      const colors = this.ambient.geo.attributes.color.array;

      for (let i = 0; i < this.ambient.count; i++) {
        const target = palette[i % palette.length];
        colors[i * 3] += (target.r - colors[i * 3]) * speed;
        colors[i * 3 + 1] += (target.g - colors[i * 3 + 1]) * speed;
        colors[i * 3 + 2] += (target.b - colors[i * 3 + 2]) * speed;
      }
      this.ambient.geo.attributes.color.needsUpdate = true;
    },

    initTrail() {
      const maxTrail = BD.engine.isMobile ? 80 : 150;
      const positions = new Float32Array(maxTrail * 3);
      const opacities = new Float32Array(maxTrail);
      const sizes = new Float32Array(maxTrail);

      for (let i = 0; i < maxTrail; i++) {
        sizes[i] = Math.random() * 0.08 + 0.02;
      }

      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geo.setAttribute('opacity', new THREE.BufferAttribute(opacities, 1));
      geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

      const mat = new THREE.PointsMaterial({
        size: 0.07,
        map: circleTexture,
        color: 0xff6b8a,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });

      const points = new THREE.Points(geo, mat);
      BD.engine.scene.add(points);

      this.trail = {
        points, geo, maxTrail,
        head: 0,
        lastX: 0, lastY: 0,
        velocities: new Float32Array(maxTrail * 3),
      };
    },

    updateTrail() {
      if (!this.trail) return;
      const { nx, ny } = BD.engine.mouse;
      const pos = this.trail.geo.attributes.position.array;
      const ops = this.trail.geo.attributes.opacity.array;
      const vel = this.trail.velocities;

      const worldX = nx * 5 * (BD.engine.camera.aspect || 1);
      const worldY = ny * 5;

      const dx = worldX - this.trail.lastX;
      const dy = worldY - this.trail.lastY;
      if (Math.abs(dx) > 0.005 || Math.abs(dy) > 0.005) {
        for (let s = 0; s < 3; s++) {
          const idx = this.trail.head;
          const spread = 0.3;
          pos[idx * 3] = worldX + (Math.random() - 0.5) * spread;
          pos[idx * 3 + 1] = worldY + (Math.random() - 0.5) * spread;
          pos[idx * 3 + 2] = 2 + (Math.random() - 0.5) * 0.5;
          vel[idx * 3] = (Math.random() - 0.5) * 0.02;
          vel[idx * 3 + 1] = Math.random() * 0.01 + 0.005;
          vel[idx * 3 + 2] = (Math.random() - 0.5) * 0.01;
          ops[idx] = 0.8 + Math.random() * 0.2;
          this.trail.head = (this.trail.head + 1) % this.trail.maxTrail;
        }
        this.trail.lastX = worldX;
        this.trail.lastY = worldY;
      }

      for (let i = 0; i < this.trail.maxTrail; i++) {
        pos[i * 3] += vel[i * 3];
        pos[i * 3 + 1] += vel[i * 3 + 1];
        pos[i * 3 + 2] += vel[i * 3 + 2];
        ops[i] *= 0.96;
        if (ops[i] < 0.01) ops[i] = 0;
      }

      this.trail.geo.attributes.position.needsUpdate = true;
      this.trail.geo.attributes.opacity.needsUpdate = true;

      const isHearts = this.trailMode === 'hearts';
      this.trail.points.material.color.set(isHearts ? 0xff4081 : 0xff6b8a);
    },

    createPetals(count) {
      this.removePetals();
      const cnt = BD.engine.isMobile ? Math.floor(count * 0.4) : count;
      const petalCanvas = document.createElement('canvas');
      petalCanvas.width = 32;
      petalCanvas.height = 32;
      const pctx = petalCanvas.getContext('2d');
      pctx.fillStyle = '#ff6b8a';
      pctx.beginPath();
      pctx.moveTo(16, 2);
      pctx.bezierCurveTo(24, 2, 30, 12, 24, 22);
      pctx.bezierCurveTo(20, 28, 16, 30, 16, 30);
      pctx.bezierCurveTo(16, 30, 12, 28, 8, 22);
      pctx.bezierCurveTo(2, 12, 8, 2, 16, 2);
      pctx.fill();
      const petalTexture = new THREE.CanvasTexture(petalCanvas);

      const group = new THREE.Group();
      const petals = [];
      const colors = [0xff6b8a, 0xff8fab, 0xffd1dc, 0xf48fb1, 0xffc1cc];

      for (let i = 0; i < cnt; i++) {
        const geo = new THREE.PlaneGeometry(0.12 + Math.random() * 0.1, 0.15 + Math.random() * 0.1);
        const mat = new THREE.MeshBasicMaterial({
          map: petalTexture,
          color: colors[Math.floor(Math.random() * colors.length)],
          transparent: true,
          opacity: 0.7 + Math.random() * 0.3,
          side: THREE.DoubleSide,
          depthWrite: false,
        });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(
          (Math.random() - 0.5) * 16,
          Math.random() * 12 + 4,
          (Math.random() - 0.5) * 10
        );
        mesh.rotation.set(
          Math.random() * Math.PI,
          Math.random() * Math.PI,
          Math.random() * Math.PI
        );
        mesh.userData = {
          speedY: -(0.3 + Math.random() * 0.5),
          speedX: (Math.random() - 0.5) * 0.3,
          rotSpeedX: (Math.random() - 0.5) * 2,
          rotSpeedY: (Math.random() - 0.5) * 2,
          rotSpeedZ: (Math.random() - 0.5) * 1.5,
          wobble: Math.random() * Math.PI * 2,
          wobbleSpeed: 1 + Math.random() * 2,
        };
        group.add(mesh);
        petals.push(mesh);
      }

      BD.engine.scene.add(group);
      this.petals = { group, items: petals, count: cnt };
    },

    updatePetals(dt, elapsed) {
      if (!this.petals) return;
      this.petals.items.forEach(p => {
        const d = p.userData;
        p.position.y += d.speedY * dt;
        p.position.x += (d.speedX + Math.sin(elapsed * d.wobbleSpeed + d.wobble) * 0.2) * dt;
        p.rotation.x += d.rotSpeedX * dt;
        p.rotation.y += d.rotSpeedY * dt;
        p.rotation.z += d.rotSpeedZ * dt;

        if (p.position.y < -6) {
          p.position.y = 8 + Math.random() * 4;
          p.position.x = (Math.random() - 0.5) * 16;
        }
      });
    },

    removePetals() {
      if (this.petals) {
        BD.engine.scene.remove(this.petals.group);
        this.petals.group.traverse(child => {
          if (child.geometry) child.geometry.dispose();
          if (child.material) {
            if (child.material.map) child.material.map.dispose();
            child.material.dispose();
          }
        });
        this.petals = null;
      }
    },

    removeAmbient() {
      if (this.ambient) {
        BD.engine.scene.remove(this.ambient.points);
        this.ambient.geo.dispose();
        this.ambient.points.material.dispose();
        this.ambient = null;
      }
    },
  };
})();
