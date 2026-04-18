(function () {
  const BD = window.BD;

  BD.sections.register('universe', {
    group: null,
    planets: [],
    sunMesh: null,
    raycaster: new THREE.Raycaster(),
    clickHandler: null,

    init() {},

    enter() {
      BD.particles.createAmbient(300, 'warm');
      BD.sections.showUI('universe-ui');

      this.group = new THREE.Group();
      this.planets = [];

      this.createSun();
      this.createPlanets();

      BD.engine.scene.add(this.group);

      gsap.fromTo(this.group.scale, { x: 0, y: 0, z: 0 }, {
        x: 1, y: 1, z: 1, duration: 1.5, ease: 'back.out(1.4)',
      });

      this.clickHandler = (e) => this.onClick(e);
      window.addEventListener('click', this.clickHandler);

      gsap.delayedCall(12, () => {
        if (BD.sections.current === 'universe') {
          BD.sections.goTo('gallery');
        }
      });
    },

    createSun() {
      const loader = new THREE.TextureLoader();
      loader.load('assets/images/photo3.jpg', (texture) => {
        const geo = new THREE.SphereGeometry(1.2, 32, 32);
        const mat = new THREE.MeshBasicMaterial({ map: texture });
        this.sunMesh = new THREE.Mesh(geo, mat);
        this.group.add(this.sunMesh);

        const glowGeo = new THREE.SphereGeometry(1.5, 32, 32);
        const glowMat = new THREE.MeshBasicMaterial({
          color: 0xf4c87a,
          transparent: true,
          opacity: 0.15,
          side: THREE.BackSide,
        });
        const glow = new THREE.Mesh(glowGeo, glowMat);
        this.group.add(glow);
      });
    },

    createPlanets() {
      const planetData = [
        { name: 'dance', color: 0xff6b8a, radius: 3, speed: 0.4, size: 0.25 },
        { name: 'instagram', color: 0xc13584, radius: 4, speed: 0.3, size: 0.2 },
        { name: 'music', color: 0xf4c87a, radius: 5, speed: 0.2, size: 0.22 },
        { name: 'heart', color: 0xff4757, radius: 3.5, speed: 0.35, size: 0.28 },
      ];

      planetData.forEach((pd, i) => {
        const geo = new THREE.SphereGeometry(pd.size, 16, 16);
        const mat = new THREE.MeshBasicMaterial({
          color: pd.color,
          transparent: true,
          opacity: 0.8,
        });
        const mesh = new THREE.Mesh(geo, mat);

        const orbitGeo = new THREE.RingGeometry(pd.radius - 0.01, pd.radius + 0.01, 64);
        const orbitMat = new THREE.MeshBasicMaterial({
          color: pd.color,
          transparent: true,
          opacity: 0.1,
          side: THREE.DoubleSide,
        });
        const orbitRing = new THREE.Mesh(orbitGeo, orbitMat);
        orbitRing.rotation.x = Math.PI / 2;
        this.group.add(orbitRing);

        mesh.userData = {
          name: pd.name,
          radius: pd.radius,
          speed: pd.speed,
          angle: (i / planetData.length) * Math.PI * 2,
        };

        this.group.add(mesh);
        this.planets.push(mesh);
      });
    },

    onClick(e) {
      const mouse = new THREE.Vector2(
        (e.clientX / window.innerWidth) * 2 - 1,
        -(e.clientY / window.innerHeight) * 2 + 1
      );

      this.raycaster.setFromCamera(mouse, BD.engine.camera);
      const intersects = this.raycaster.intersectObjects(this.planets);

      if (intersects.length > 0) {
        const planet = intersects[0].object;
        this.triggerPlanetEffect(planet);
      }
    },

    triggerPlanetEffect(planet) {
      const pos = planet.position.clone();
      const count = 30;
      const positions = new Float32Array(count * 3);
      const color = planet.material.color;

      for (let i = 0; i < count; i++) {
        positions[i * 3] = pos.x;
        positions[i * 3 + 1] = pos.y;
        positions[i * 3 + 2] = pos.z;
      }

      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      const mat = new THREE.PointsMaterial({
        size: 0.05,
        color: color,
        transparent: true,
        opacity: 1,
        blending: THREE.AdditiveBlending,
      });

      const burst = new THREE.Points(geo, mat);
      BD.engine.scene.add(burst);

      const vels = [];
      for (let i = 0; i < count; i++) {
        vels.push({
          x: (Math.random() - 0.5) * 3,
          y: (Math.random() - 0.5) * 3,
          z: (Math.random() - 0.5) * 3,
        });
      }

      const animate = (dt) => {
        const p = geo.attributes.position.array;
        for (let i = 0; i < count; i++) {
          p[i * 3] += vels[i].x * dt;
          p[i * 3 + 1] += vels[i].y * dt;
          p[i * 3 + 2] += vels[i].z * dt;
        }
        geo.attributes.position.needsUpdate = true;
        mat.opacity *= 0.97;
        if (mat.opacity < 0.01) {
          BD.engine.scene.remove(burst);
          BD.engine.removeUpdate(animate);
          geo.dispose();
          mat.dispose();
        }
      };

      BD.engine.onUpdate(animate);

      gsap.to(planet.scale, {
        x: 1.5, y: 1.5, z: 1.5,
        duration: 0.2,
        yoyo: true,
        repeat: 1,
      });
    },

    update(dt, elapsed) {
      BD.particles.updateAmbient(dt, 0.3);

      if (this.sunMesh) {
        this.sunMesh.rotation.y += 0.1 * dt;
      }

      this.planets.forEach(p => {
        const d = p.userData;
        d.angle += d.speed * dt;
        p.position.x = Math.cos(d.angle) * d.radius;
        p.position.z = Math.sin(d.angle) * d.radius;
        p.position.y = Math.sin(d.angle * 2) * 0.3;
      });

      if (this.group) {
        this.group.rotation.y += (BD.engine.mouse.nx * 0.2 - this.group.rotation.y) * 0.02;
        this.group.rotation.x += (-BD.engine.mouse.ny * 0.1 - this.group.rotation.x) * 0.02;
      }
    },

    exit() {
      if (this.clickHandler) window.removeEventListener('click', this.clickHandler);

      if (this.group) {
        return new Promise(r => {
          gsap.to(this.group.scale, {
            x: 0, y: 0, z: 0,
            duration: 0.8,
            onComplete: () => {
              BD.engine.scene.remove(this.group);
              this.group.traverse(child => {
                if (child.geometry) child.geometry.dispose();
                if (child.material) {
                  if (child.material.map) child.material.map.dispose();
                  child.material.dispose();
                }
              });
              this.group = null;
              r();
            },
          });
        });
      }
    },
  });
})();
