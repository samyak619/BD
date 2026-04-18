(function () {
  const BD = window.BD;

  BD.sections.register('finale', {
    heart: null,
    photoMeshes: [],

    init() {
      document.querySelector('#finale-ui .replay-btn').addEventListener('click', () => {
        BD.sections.goTo('reveal');
      });
    },

    enter() {
      BD.particles.createAmbient(200, 'warm');
      BD.sections.showUI('finale-ui');

      this.createHeart();
      this.createOrbitingPhotos();

      const finalText = document.querySelector('#finale-ui .final-text');
      gsap.fromTo(finalText, { opacity: 0, y: 20 }, {
        opacity: 1, y: 0, duration: 2, delay: 0.5,
      });

      const btn = document.querySelector('#finale-ui .replay-btn');
      gsap.fromTo(btn, { opacity: 0 }, { opacity: 1, duration: 1, delay: 3 });
    },

    createHeart() {
      const shape = new THREE.Shape();
      shape.moveTo(0, 0.3);
      shape.bezierCurveTo(0, 0.5, -0.15, 0.6, -0.3, 0.6);
      shape.bezierCurveTo(-0.6, 0.6, -0.6, 0.2, -0.6, 0.2);
      shape.bezierCurveTo(-0.6, -0.1, -0.3, -0.35, 0, -0.6);
      shape.bezierCurveTo(0.3, -0.35, 0.6, -0.1, 0.6, 0.2);
      shape.bezierCurveTo(0.6, 0.2, 0.6, 0.6, 0.3, 0.6);
      shape.bezierCurveTo(0.15, 0.6, 0, 0.5, 0, 0.3);

      const geo = new THREE.ExtrudeGeometry(shape, {
        depth: 0.2, bevelEnabled: true,
        bevelThickness: 0.05, bevelSize: 0.05, bevelSegments: 3,
      });
      const mat = new THREE.MeshBasicMaterial({
        color: 0xff6b8a,
        transparent: true,
        opacity: 0.6,
      });

      this.heart = new THREE.Mesh(geo, mat);
      this.heart.position.z = 1;
      this.heart.scale.setScalar(1.5);
      BD.engine.scene.add(this.heart);
    },

    createOrbitingPhotos() {
      const loader = new THREE.TextureLoader();
      const photos = ['photo1.jpg', 'photo2.jpg', 'photo3.jpg', 'photo4.jpg'];
      this.photoMeshes = [];

      photos.forEach((photo, i) => {
        loader.load('assets/images/' + photo, (texture) => {
          const geo = new THREE.PlaneGeometry(0.8, 1);
          const mat = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
            opacity: 0.6,
            side: THREE.DoubleSide,
          });
          const mesh = new THREE.Mesh(geo, mat);
          mesh.userData = {
            angle: (i / photos.length) * Math.PI * 2,
            radius: 3.5,
            speed: 0.3,
            yOffset: Math.sin(i) * 0.5,
          };
          BD.engine.scene.add(mesh);
          this.photoMeshes.push(mesh);
        });
      });
    },

    update(dt, elapsed) {
      BD.particles.updateAmbient(dt, 0.2);

      if (this.heart) {
        const scale = 1.5 + Math.sin(elapsed * 1.5) * 0.1;
        this.heart.scale.setScalar(scale);
        this.heart.rotation.y += 0.2 * dt;
      }

      this.photoMeshes.forEach(mesh => {
        const d = mesh.userData;
        d.angle += d.speed * dt;
        mesh.position.x = Math.cos(d.angle) * d.radius;
        mesh.position.z = Math.sin(d.angle) * d.radius;
        mesh.position.y = d.yOffset + Math.sin(elapsed + d.angle) * 0.3;
        mesh.lookAt(BD.engine.camera.position);
      });
    },

    exit() {
      if (this.heart) {
        BD.engine.scene.remove(this.heart);
        this.heart.geometry.dispose();
        this.heart.material.dispose();
        this.heart = null;
      }

      this.photoMeshes.forEach(mesh => {
        BD.engine.scene.remove(mesh);
        mesh.geometry.dispose();
        if (mesh.material.map) mesh.material.map.dispose();
        mesh.material.dispose();
      });
      this.photoMeshes = [];

      return Promise.resolve();
    },
  });
})();
