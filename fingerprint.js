;(function (name, context, definition) {
  if (typeof module !== 'undefined' && module.exports) { module.exports = definition(); }
  else if (typeof define === 'function' && define.amd) { define(definition); }
  else { context[name] = definition(); }
})('Fingerprint', this, function () {
  'use strict';

  var Fingerprint = function () {
  };

  Fingerprint.prototype = {
    get: function(input){
      var keys = [];
      if(this.isCanvasSupported()){
        keys.push(this.getCanvasFingerprint(input));
      }
      return this.murmurhash3_32_gc(keys.join('###'), 31);
    },

    /**
     * JS Implementation of MurmurHash3 (r136) (as of May 20, 2011)
     *
     * @author <a href="mailto:gary.court@gmail.com">Gary Court</a>
     * @see http://github.com/garycourt/murmurhash-js
     * @author <a href="mailto:aappleby@gmail.com">Austin Appleby</a>
     * @see http://sites.google.com/site/murmurhash/
     *
     * @param {string} key ASCII only
     * @param {number} seed Positive integer only
     * @return {number} 32-bit positive integer hash
     */

    murmurhash3_32_gc: function(key, seed) {
      var remainder, bytes, h1, h1b, c1, c2, k1, i;

      remainder = key.length & 3; // key.length % 4
      bytes = key.length - remainder;
      h1 = seed;
      c1 = 0xcc9e2d51;
      c2 = 0x1b873593;
      i = 0;

      while (i < bytes) {
        k1 =
            ((key.charCodeAt(i) & 0xff)) |
            ((key.charCodeAt(++i) & 0xff) << 8) |
            ((key.charCodeAt(++i) & 0xff) << 16) |
            ((key.charCodeAt(++i) & 0xff) << 24);
        ++i;

        k1 = ((((k1 & 0xffff) * c1) + ((((k1 >>> 16) * c1) & 0xffff) << 16))) & 0xffffffff;
        k1 = (k1 << 15) | (k1 >>> 17);
        k1 = ((((k1 & 0xffff) * c2) + ((((k1 >>> 16) * c2) & 0xffff) << 16))) & 0xffffffff;

        h1 ^= k1;
        h1 = (h1 << 13) | (h1 >>> 19);
        h1b = ((((h1 & 0xffff) * 5) + ((((h1 >>> 16) * 5) & 0xffff) << 16))) & 0xffffffff;
        h1 = (((h1b & 0xffff) + 0x6b64) + ((((h1b >>> 16) + 0xe654) & 0xffff) << 16));
      }

      k1 = 0;

      switch (remainder) {
        case 3: k1 ^= (key.charCodeAt(i + 2) & 0xff) << 16;
        case 2: k1 ^= (key.charCodeAt(i + 1) & 0xff) << 8;
        case 1: k1 ^= (key.charCodeAt(i) & 0xff);

                k1 = (((k1 & 0xffff) * c1) + ((((k1 >>> 16) * c1) & 0xffff) << 16)) & 0xffffffff;
                k1 = (k1 << 15) | (k1 >>> 17);
                k1 = (((k1 & 0xffff) * c2) + ((((k1 >>> 16) * c2) & 0xffff) << 16)) & 0xffffffff;
                h1 ^= k1;
      }

      h1 ^= key.length;

      h1 ^= h1 >>> 16;
      h1 = (((h1 & 0xffff) * 0x85ebca6b) + ((((h1 >>> 16) * 0x85ebca6b) & 0xffff) << 16)) & 0xffffffff;
      h1 ^= h1 >>> 13;
      h1 = ((((h1 & 0xffff) * 0xc2b2ae35) + ((((h1 >>> 16) * 0xc2b2ae35) & 0xffff) << 16))) & 0xffffffff;
      h1 ^= h1 >>> 16;

      return h1 >>> 0;
    },

    isCanvasSupported: function () {
      var elem = document.createElement('canvas');
      return !!(elem.getContext && elem.getContext('2d'));
    },

    drawCanvas: function (canvas, input) {
      var ctx = canvas.getContext('2d');
      ctx.globalAlpha=0.8;

      ctx.textBaseline = "top";
      ctx.font = "14px 'Arial'";
      ctx.textBaseline = "alphabetic";
      ctx.fillStyle = "#f60";

      ctx.shadowBlur=20;
      ctx.shadowColor="black";
      ctx.fillRect(20,100,150,20);
      ctx.fillStyle = "#069";

      var grd=ctx.createLinearGradient(0,0,170,0);
      grd.addColorStop(0,"black");
      grd.addColorStop(1,"white");
      ctx.fillStyle=grd;
      ctx.fillRect(20,125,150,20);

      grd=ctx.createRadialGradient(75,50,5,90,60,100);
      grd.addColorStop(0,"red");
      grd.addColorStop(1,"white");

      // Fill with gradient
      ctx.fillStyle=grd;
      ctx.fillRect(20,70,150,20);

      var txt = input;
      ctx.fillText(txt, 20, 55);
    },

    getCanvasFingerprint: function (input) {
      // var canvas = document.createElement('canvas');
      var canvas = document.getElementById('myCanvas');
      var ctx = canvas.getContext('2d');
      ctx.shadowBlur=0;
      ctx.clearRect(0, 0, 500, 500);

      this.drawTrailCanvas(canvas, input);
      this.drawCanvas(canvas, input);
      return canvas.toDataURL();
    },


    drawTrailCanvas: function (canvas, input) {
      var SCREEN_WIDTH = 300;
      var SCREEN_HEIGHT = 200;

      var RADIUS = 110;

      var RADIUS_SCALE = 1;
      var RADIUS_SCALE_MIN = 1;
      var RADIUS_SCALE_MAX = 1.5;

      var QUANTITY = 25;

      var canvas;
      var context;
      var particles;

      var positionX = SCREEN_WIDTH * .5;
      var positionY = SCREEN_HEIGHT * .5;

      var randomSeed = input;

      init(canvas);

      function getRandom() {
        randomSeed = (randomSeed * 9301 + 49297) % 233280;
        return randomSeed / 233280;
      }

      function init() {
        if (canvas && canvas.getContext) {
          context = canvas.getContext('2d');
          createParticles();
          for (var i = 0; i < 200; i++) {
            loop();
          }
        }
      }

      function createParticles() {
        particles = [];

        for (var i = 0; i < QUANTITY; i++) {
          var particle = {
            position: { x: positionX, y: positionY },
            shift: { x: positionX, y: positionY },
            size: 3,
            angle: 0,
            speed: 0.01+getRandom()*0.04,
            targetSize: 1,
            fillColor: '#' + (getRandom() * 0x404040 + 0xaaaaaa | 0).toString(16),
            orbit: RADIUS*.5 + (RADIUS * .5 * getRandom())
          };

          particles.push( particle );
        }
      }


      function loop() {
        RADIUS_SCALE = Math.min( RADIUS_SCALE, RADIUS_SCALE_MAX );

        // Fade out the lines slowly by drawing a rectangle over the entire canvas
        context.fillStyle = 'rgba(255,255,255,0.05)';
        context.fillRect(0, 0, context.canvas.width, context.canvas.height);

        for (var i = 0, len = particles.length; i < len; i++) {
          var particle = particles[i];

          var lp = { x: particle.position.x, y: particle.position.y };

          // Offset the angle to keep the spin going
          particle.angle += particle.speed;

          particle.shift.x += ( positionX - particle.shift.x) * (particle.speed);
          particle.shift.y += ( positionY - particle.shift.y) * (particle.speed);

          particle.position.x = particle.shift.x + Math.cos(i + particle.angle) * (particle.orbit*RADIUS_SCALE);
          particle.position.y = particle.shift.y + Math.sin(i + particle.angle) * (particle.orbit*RADIUS_SCALE);

          particle.size += ( particle.targetSize - particle.size ) * 0.05;

          if( Math.round( particle.size ) == Math.round( particle.targetSize ) ) {
            particle.targetSize = 1 + getRandom() * 7;
          }

          context.beginPath();
          context.fillStyle = particle.fillColor;
          context.arc(particle.position.x, particle.position.y, particle.size/2, 0, Math.PI*2, true);
          context.fill();
        }
      }},
  };

  return Fingerprint;

});
