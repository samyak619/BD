(function () {
  const BD = window.BD;

  const LETTER_TEXT = 'Hi Zhatu,\n\nI know I can\'t be there with you today, and that honestly feels a little off\u2026 it doesn\'t feel complete without you. But I\'ll make it up to you, properly, soon\u2014no excuses.\n\nI just hope today makes you smile a lot. You really deserve that\u2026 more than you think.\n\nAnd honestly, I like you for everything you are\u2014not just the happy, sorted version. Your random rants, your overthinking, even those moments when you\'re low\u2026 I don\'t know how, but it all just makes me feel closer to you.\n\nYou\'re not just my best friend. You\'re\u2026 more than that to me, even if I don\'t always say it out loud.\n\nSo enjoy your day, okay? And just remember, there\'s someone here who\'s thinking about you, missing you a little, and maybe smiling because of you too.';

  BD.sections.register('letter', {
    envelope: null,
    typing: false,

    init() {},

    enter() {
      BD.particles.createAmbient(150, 'warm');
      BD.particles.trailMode = 'hearts';
      BD.sections.showUI('letter-ui');

      this.createEnvelope();

      const prompt = document.querySelector('#letter-ui .envelope-prompt');
      prompt.style.display = 'block';
      gsap.fromTo(prompt, { opacity: 0 }, { opacity: 1, duration: 1 });

      const letterContent = document.getElementById('letter-text');
      letterContent.style.display = 'none';
      letterContent.innerHTML = '';

      const handler = () => {
        if (!this.typing) this.openEnvelope();
      };
      prompt.addEventListener('click', handler);
      prompt._handler = handler;
    },

    createEnvelope() {
      const group = new THREE.Group();

      const bodyGeo = new THREE.BoxGeometry(2, 1.2, 0.05);
      const bodyMat = new THREE.MeshBasicMaterial({
        color: 0xf5e6d0,
        transparent: true,
        opacity: 0.9,
      });
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      group.add(body);

      const flapGeo = new THREE.ConeGeometry(1.05, 0.7, 3);
      const flapMat = new THREE.MeshBasicMaterial({
        color: 0xe8d5be,
        transparent: true,
        opacity: 0.9,
        side: THREE.DoubleSide,
      });
      const flap = new THREE.Mesh(flapGeo, flapMat);
      flap.position.y = 0.6;
      flap.rotation.z = Math.PI;
      group.add(flap);

      const sealGeo = new THREE.CircleGeometry(0.12, 16);
      const sealMat = new THREE.MeshBasicMaterial({ color: 0xff6b8a });
      const seal = new THREE.Mesh(sealGeo, sealMat);
      seal.position.z = 0.03;
      group.add(seal);

      group.position.z = 2;
      BD.engine.scene.add(group);
      this.envelope = { group, flap, body };
    },

    openEnvelope() {
      this.typing = true;

      const prompt = document.querySelector('#letter-ui .envelope-prompt');
      gsap.to(prompt, { opacity: 0, duration: 0.3 });

      gsap.to(this.envelope.flap.rotation, {
        x: -Math.PI,
        duration: 0.8,
        ease: 'power2.inOut',
      });

      gsap.to(this.envelope.group.position, {
        y: 3,
        z: 0,
        duration: 1,
        delay: 0.8,
        ease: 'power2.in',
        onComplete: () => {
          BD.engine.scene.remove(this.envelope.group);
          this.envelope.group.traverse(child => {
            if (child.geometry) child.geometry.dispose();
            if (child.material) child.material.dispose();
          });
          this.envelope = null;
          this.startTyping();
        },
      });

      gsap.to(this.envelope.group.scale, {
        x: 0.5, y: 0.5, z: 0.5,
        duration: 1,
        delay: 0.8,
      });
    },

    startTyping() {
      const letterContent = document.getElementById('letter-text');
      letterContent.style.display = 'block';
      letterContent.innerHTML = '<span class="cursor-blink"></span>';

      let charIndex = 0;
      const speed = 35;

      const type = () => {
        if (charIndex < LETTER_TEXT.length) {
          const char = LETTER_TEXT[charIndex];
          const cursor = letterContent.querySelector('.cursor-blink');

          if (char === '\n') {
            cursor.insertAdjacentHTML('beforebegin', '<br>');
          } else {
            cursor.insertAdjacentText('beforebegin', char);
          }

          charIndex++;

          const delay = char === '.' || char === ',' || char === '\u2026' ? speed * 4 : speed;
          setTimeout(type, delay);
        } else {
          const cursor = letterContent.querySelector('.cursor-blink');
          gsap.to(cursor, { opacity: 0, duration: 1, delay: 2 });

          gsap.delayedCall(5, () => {
            if (BD.sections.current === 'letter') {
              BD.sections.goTo('finale');
            }
          });
        }
      };

      gsap.fromTo(letterContent, { opacity: 0 }, {
        opacity: 1, duration: 0.5, onComplete: type,
      });
    },

    update(dt) {
      BD.particles.updateAmbient(dt, 0.2);

      if (this.envelope) {
        this.envelope.group.position.y += Math.sin(Date.now() * 0.001) * 0.001;
      }
    },

    exit() {
      BD.particles.trailMode = 'warm';
      document.body.style.overflow = 'hidden';

      if (this.envelope) {
        BD.engine.scene.remove(this.envelope.group);
        this.envelope = null;
      }

      const ui = document.getElementById('letter-ui');
      return new Promise(r => {
        gsap.to(ui, { opacity: 0, duration: 0.8, onComplete: r });
      });
    },
  });
})();
