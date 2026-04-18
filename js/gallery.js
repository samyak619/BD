(function () {
  const BD = window.BD;

  const CAPTIONS = [
    'Zhatu being Zhatu',
    'The one who makes every place better',
    'Golden hour has nothing on you',
    'Stunning in every version of you',
  ];

  BD.sections.register('gallery', {
    group: null,
    cards: [],
    cardGroups: [],
    selectedCard: null,
    autoCycleIndex: 0,
    autoPaused: false,
    clickHandler: null,

    init() {},

    enter() {
      BD.particles.createAmbient(300, 'warm');
      BD.particles.createPetals(30);
      BD.audio.switchTo('mommae');
      BD.sections.showUI('gallery-ui');

      this.group = new THREE.Group();
      this.cards = [];
      this.cardGroups = [];
      this.selectedCard = null;
      this.autoCycleIndex = 0;
      this.autoPaused = false;

      this.createCards();
      BD.engine.scene.add(this.group);

      gsap.fromTo(this.group.rotation, { y: -Math.PI }, {
        y: 0, duration: 1.5, ease: 'power2.out',
      });

      this.clickHandler = (e) => this.onClick(e);
      window.addEventListener('click', this.clickHandler);

      const skip = document.getElementById('gallery-skip');
      if (skip) {
        skip.style.display = 'block';
        skip.onclick = () => BD.sections.goTo('wishes');
      }

      gsap.delayedCall(2, () => this.autoCycleNext());
    },

    createCards() {
      const loader = new THREE.TextureLoader();
      const photos = ['photo1.jpg', 'photo2.jpg', 'photo3.jpg', 'photo4.jpg'];

      photos.forEach((photo, i) => {
        const angle = (i / photos.length) * Math.PI * 2;
        const radius = 3;

        const cardGroup = new THREE.Group();
        cardGroup.position.x = Math.cos(angle) * radius;
        cardGroup.position.z = Math.sin(angle) * radius;
        cardGroup.position.y = Math.sin(angle * 2) * 0.3;

        const frontGeo = new THREE.PlaneGeometry(1.8, 2.4);
        loader.load('assets/images/' + photo, (texture) => {
          const frontMat = new THREE.MeshBasicMaterial({
            map: texture,
            side: THREE.DoubleSide,
          });
          const front = new THREE.Mesh(frontGeo, frontMat);
          front.userData.cardIndex = i;
          cardGroup.add(front);
          this.cards.push(front);
        });

        const backGeo = new THREE.PlaneGeometry(1.8, 2.4);
        const backMat = new THREE.MeshBasicMaterial({
          color: 0x1a0a0a,
          side: THREE.FrontSide,
        });
        const back = new THREE.Mesh(backGeo, backMat);
        back.rotation.y = Math.PI;
        cardGroup.add(back);

        const borderGeo = new THREE.PlaneGeometry(1.9, 2.5);
        const borderMat = new THREE.MeshBasicMaterial({
          color: 0xff6b8a,
          transparent: true,
          opacity: 0.3,
          side: THREE.DoubleSide,
        });
        const border = new THREE.Mesh(borderGeo, borderMat);
        border.position.z = -0.01;
        cardGroup.add(border);

        cardGroup.lookAt(0, 0, 0);
        cardGroup.userData = {
          index: i,
          baseAngle: angle,
          radius: radius,
          originalPos: cardGroup.position.clone(),
          originalRot: cardGroup.rotation.clone(),
        };

        this.group.add(cardGroup);
        this.cardGroups.push(cardGroup);
      });
    },

    autoCycleNext() {
      if (BD.sections.current !== 'gallery' || this.autoPaused) return;

      if (this.autoCycleIndex >= 4) {
        gsap.delayedCall(2, () => {
          if (BD.sections.current === 'gallery') {
            BD.sections.goTo('wishes');
          }
        });
        return;
      }

      const cardGroup = this.cardGroups[this.autoCycleIndex];
      if (!cardGroup) return;

      this.selectCard(cardGroup, this.autoCycleIndex);

      gsap.delayedCall(5, () => {
        if (BD.sections.current !== 'gallery') return;
        this.deselectCard(cardGroup);
        this.autoCycleIndex++;
        gsap.delayedCall(1, () => this.autoCycleNext());
      });
    },

    onClick(e) {
      const mouse = new THREE.Vector2(
        (e.clientX / window.innerWidth) * 2 - 1,
        -(e.clientY / window.innerHeight) * 2 + 1
      );

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, BD.engine.camera);
      const intersects = raycaster.intersectObjects(this.cards);

      if (intersects.length > 0) {
        this.autoPaused = true;
        const card = intersects[0].object;
        const cardGroup = card.parent;

        if (this.selectedCard === cardGroup) {
          this.deselectCard(cardGroup);
        } else {
          if (this.selectedCard) this.deselectCard(this.selectedCard);
          this.selectCard(cardGroup, card.userData.cardIndex);
        }
      } else if (this.selectedCard) {
        this.deselectCard(this.selectedCard);
      }
    },

    selectCard(cardGroup, index) {
      this.selectedCard = cardGroup;

      gsap.to(cardGroup.scale, {
        x: 0, y: 0, z: 0,
        duration: 0.3,
        ease: 'power2.in',
        onComplete: () => {
          this.group.remove(cardGroup);
          BD.engine.scene.add(cardGroup);
          cardGroup.position.set(0, 0, 3);
          cardGroup.rotation.set(0, 0, 0);
          gsap.to(cardGroup.scale, {
            x: 1.2, y: 1.2, z: 1.2,
            duration: 0.7,
            ease: 'back.out(1.7)',
          });
        },
      });

      const caption = document.getElementById('gallery-caption');
      caption.textContent = CAPTIONS[index];
      gsap.killTweensOf(caption);
      gsap.to(caption, { opacity: 1, duration: 0.5, delay: 0.8 });
    },

    deselectCard(cardGroup) {
      const d = cardGroup.userData;
      this.selectedCard = null;

      const caption = document.getElementById('gallery-caption');
      gsap.killTweensOf(caption);
      gsap.to(caption, { opacity: 0, duration: 0.3 });

      gsap.to(cardGroup.scale, {
        x: 0, y: 0, z: 0,
        duration: 0.3,
        ease: 'power2.in',
        onComplete: () => {
          BD.engine.scene.remove(cardGroup);
          this.group.add(cardGroup);
          cardGroup.position.copy(d.originalPos);
          cardGroup.rotation.set(d.originalRot.x, d.originalRot.y, d.originalRot.z);
          gsap.to(cardGroup.scale, {
            x: 1, y: 1, z: 1,
            duration: 0.5,
            ease: 'power2.out',
          });
        },
      });
    },

    update(dt, elapsed) {
      BD.particles.updateAmbient(dt, 0.3);
      BD.particles.updatePetals(dt, elapsed);

      if (this.group && !this.selectedCard) {
        this.group.rotation.y += 0.3 * dt;
      }

      if (this.group) {
        const my = BD.engine.mouse.ny;
        this.group.rotation.x += (-my * 0.05 - this.group.rotation.x) * 0.02;
      }
    },

    exit() {
      if (this.clickHandler) window.removeEventListener('click', this.clickHandler);

      if (this.group) {
        BD.engine.scene.remove(this.group);
        this.group.traverse(child => {
          if (child.geometry) child.geometry.dispose();
          if (child.material) {
            if (child.material.map) child.material.map.dispose();
            child.material.dispose();
          }
        });
        this.group = null;
      }

      this.cards = [];
      this.cardGroups = [];
      this.selectedCard = null;

      const caption = document.getElementById('gallery-caption');
      caption.style.opacity = '0';

      BD.particles.removePetals();

      const skip = document.getElementById('gallery-skip');
      if (skip) skip.style.display = 'none';

      return Promise.resolve();
    },
  });
})();
