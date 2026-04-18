(function () {
  const BD = window.BD;

  const WISHES = [
    'For your smile that fixes bad days',
    'For your random 2am rants I secretly love',
    'For being the best thing about that office',
    'For the way you dance like nobody\'s watching',
    'For making reels that actually make me laugh',
    'For being you, always',
    'For every fight that somehow made us closer',
    'For your laugh that\'s way too contagious',
    'For tolerating my nonsense every single day',
    'For those looks you give when you\'re pretending to be mad',
    'For making ordinary days feel different',
    'For being the person I text first about everything',
    'For your energy that lights up any room',
    'For those late night conversations that never get boring',
    'For being someone I never expected to find',
    'For your weird food combos I secretly want to try',
    'For every inside joke only we understand',
    'For the way you say my name when you\'re annoyed',
    'For making me actually want to show up to work',
    'For being the most real person I know',
    'For your confidence that inspires everyone around you',
    'For every stupid argument that ended with us laughing',
    'For being my favorite notification',
    'For being the reason I believe in good things',
  ];

  BD.sections.register('wishes', {
    group: null,
    lanterns: [],
    revealed: 0,
    raycaster: new THREE.Raycaster(),
    clickHandler: null,

    init() {},

    enter() {
      BD.particles.createAmbient(200, 'warm');
      BD.particles.createPetals(25);
      BD.sections.showUI('wishes-ui');

      this.group = new THREE.Group();
      this.lanterns = [];
      this.revealed = 0;

      this.updateCounter();
      this.createLanterns();

      BD.engine.scene.add(this.group);

      this.clickHandler = (e) => this.onClick(e);
      window.addEventListener('click', this.clickHandler);

      gsap.delayedCall(15, () => {
        const skip = document.getElementById('wishes-skip');
        if (skip && BD.sections.current === 'wishes') {
          skip.style.display = 'block';
          skip.onclick = () => BD.sections.goTo('letter');
        }
      });
    },

    createLanterns() {
      for (let i = 0; i < 24; i++) {
        const geo = new THREE.SphereGeometry(0.15, 16, 16);
        const mat = new THREE.MeshBasicMaterial({
          color: 0xff6b8a,
          transparent: true,
          opacity: 0.7,
        });
        const mesh = new THREE.Mesh(geo, mat);

        const phi = Math.acos(1 - 2 * (i + 0.5) / 24);
        const theta = Math.PI * (1 + Math.sqrt(5)) * i;
        const radius = 2.5;

        mesh.position.set(
          radius * Math.sin(phi) * Math.cos(theta),
          radius * Math.sin(phi) * Math.sin(theta) * 0.5,
          radius * Math.cos(phi)
        );

        const glowGeo = new THREE.SphereGeometry(0.25, 16, 16);
        const glowMat = new THREE.MeshBasicMaterial({
          color: 0xff6b8a,
          transparent: true,
          opacity: 0.15,
          side: THREE.BackSide,
        });
        const glow = new THREE.Mesh(glowGeo, glowMat);
        mesh.add(glow);

        mesh.userData = {
          index: i,
          revealed: false,
          baseY: mesh.position.y,
          floatOffset: Math.random() * Math.PI * 2,
          floatSpeed: 0.5 + Math.random() * 0.5,
        };

        this.group.add(mesh);
        this.lanterns.push(mesh);
      }
    },

    onClick(e) {
      const mouse = new THREE.Vector2(
        (e.clientX / window.innerWidth) * 2 - 1,
        -(e.clientY / window.innerHeight) * 2 + 1
      );

      this.raycaster.setFromCamera(mouse, BD.engine.camera);
      const intersects = this.raycaster.intersectObjects(this.lanterns, true);

      if (intersects.length > 0) {
        let lantern = intersects[0].object;
        if (!lantern.userData.index && lantern.userData.index !== 0) {
          lantern = lantern.parent;
        }
        if (!lantern.userData.revealed) {
          this.revealWish(lantern);
        }
      }
    },

    revealWish(lantern) {
      lantern.userData.revealed = true;
      this.revealed++;
      this.updateCounter();

      const pos = lantern.position.clone();
      const count = 20;
      const positions = new Float32Array(count * 3);
      for (let i = 0; i < count; i++) {
        positions[i * 3] = pos.x;
        positions[i * 3 + 1] = pos.y;
        positions[i * 3 + 2] = pos.z;
      }

      const burstGeo = new THREE.BufferGeometry();
      burstGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      const burstMat = new THREE.PointsMaterial({
        size: 0.06,
        map: BD.particles.circleMap,
        color: 0xff4081,
        transparent: true,
        opacity: 1,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });

      const burst = new THREE.Points(burstGeo, burstMat);
      BD.engine.scene.add(burst);

      const vels = [];
      for (let i = 0; i < count; i++) {
        vels.push({
          x: (Math.random() - 0.5) * 4,
          y: (Math.random() - 0.5) * 4,
          z: (Math.random() - 0.5) * 4,
        });
      }

      const anim = (dt) => {
        const p = burstGeo.attributes.position.array;
        for (let i = 0; i < count; i++) {
          p[i * 3] += vels[i].x * dt;
          p[i * 3 + 1] += vels[i].y * dt;
          p[i * 3 + 2] += vels[i].z * dt;
        }
        burstGeo.attributes.position.needsUpdate = true;
        burstMat.opacity *= 0.96;
        if (burstMat.opacity < 0.01) {
          BD.engine.scene.remove(burst);
          BD.engine.removeUpdate(anim);
          burstGeo.dispose();
          burstMat.dispose();
        }
      };
      BD.engine.onUpdate(anim);

      gsap.to(lantern.scale, {
        x: 0, y: 0, z: 0,
        duration: 0.3,
        onComplete: () => {
          lantern.visible = false;
        },
      });

      const wishText = document.getElementById('wish-text');
      gsap.killTweensOf(wishText);
      gsap.to(wishText, {
        opacity: 0,
        duration: 0.2,
        onComplete: () => {
          wishText.textContent = WISHES[lantern.userData.index];
          gsap.fromTo(wishText, { opacity: 0 }, {
            opacity: 1,
            duration: 0.5,
            onComplete: () => {
              gsap.to(wishText, { opacity: 0, duration: 0.5, delay: 10 });
            },
          });
        },
      });

      if (this.revealed >= 24) {
        gsap.delayedCall(4, () => {
          if (BD.sections.current === 'wishes') {
            BD.sections.goTo('letter');
          }
        });
      }
    },

    updateCounter() {
      const el = document.getElementById('wishes-counter');
      el.textContent = this.revealed + ' / 24 wishes';
    },

    update(dt, elapsed) {
      BD.particles.updateAmbient(dt, 0.3);
      BD.particles.updatePetals(dt, elapsed);

      this.lanterns.forEach(l => {
        if (!l.userData.revealed) {
          l.position.y = l.userData.baseY + Math.sin(elapsed * l.userData.floatSpeed + l.userData.floatOffset) * 0.15;
        }
      });

      if (this.group) {
        this.group.rotation.y += 0.2 * dt;
      }
    },

    exit() {
      if (this.clickHandler) window.removeEventListener('click', this.clickHandler);

      if (this.group) {
        BD.engine.scene.remove(this.group);
        this.group.traverse(child => {
          if (child.geometry) child.geometry.dispose();
          if (child.material) child.material.dispose();
        });
        this.group = null;
      }

      BD.particles.removePetals();
      this.lanterns = [];
      return Promise.resolve();
    },
  });
})();
