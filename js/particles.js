(function () {
  const BD = window.BD;

  BD.particles = {
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
          new THREE.Color(0xf4c87a),
          new THREE.Color(0xf0a0a0),
          new THREE.Color(0xffd1dc),
          new THREE.Color(0xffe4b5),
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
          new THREE.Color(0xf4c87a),
          new THREE.Color(0xf0a0a0),
          new THREE.Color(0xffd1dc),
          new THREE.Color(0xffe4b5),
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
      const maxTrail = BD.engine.isMobile ? 30 : 60;
      const positions = new Float32Array(maxTrail * 3);
      const opacities = new Float32Array(maxTrail);

      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geo.setAttribute('opacity', new THREE.BufferAttribute(opacities, 1));

      const mat = new THREE.PointsMaterial({
        size: 0.04,
        color: 0xf4c87a,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });

      const points = new THREE.Points(geo, mat);
      BD.engine.scene.add(points);

      this.trail = {
        points, geo, maxTrail,
        head: 0,
        lastX: 0, lastY: 0,
      };
    },

    updateTrail() {
      if (!this.trail) return;
      const { nx, ny } = BD.engine.mouse;
      const pos = this.trail.geo.attributes.position.array;
      const ops = this.trail.geo.attributes.opacity.array;

      const worldX = nx * 5 * (BD.engine.camera.aspect || 1);
      const worldY = ny * 5;

      const dx = worldX - this.trail.lastX;
      const dy = worldY - this.trail.lastY;
      if (Math.abs(dx) > 0.01 || Math.abs(dy) > 0.01) {
        const idx = this.trail.head;
        pos[idx * 3] = worldX + (Math.random() - 0.5) * 0.1;
        pos[idx * 3 + 1] = worldY + (Math.random() - 0.5) * 0.1;
        pos[idx * 3 + 2] = 2;
        ops[idx] = 1.0;
        this.trail.head = (this.trail.head + 1) % this.trail.maxTrail;
        this.trail.lastX = worldX;
        this.trail.lastY = worldY;
      }

      for (let i = 0; i < this.trail.maxTrail; i++) {
        ops[i] *= 0.95;
        if (ops[i] < 0.01) ops[i] = 0;
      }

      this.trail.geo.attributes.position.needsUpdate = true;
      this.trail.geo.attributes.opacity.needsUpdate = true;

      const isHearts = this.trailMode === 'hearts';
      this.trail.points.material.color.set(isHearts ? 0xff6b8a : 0xf4c87a);
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
