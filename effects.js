(function () {
  const config = window.AURORA_CONFIG || {};
  const colors = {
    background: '#05070d',
    primaryPink: '#ff4f7d',
    softPink: '#ff8cab',
    purple: '#916dff',
    blue: '#63d8ff',
    gold: '#ffd56a',
    white: '#ffffff',
    ...(config.colors || {})
  };

  function createCanvasContext(canvas, width, height) {
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return ctx;
  }

  function resizeCanvas(canvas, callback) {
    const rect = canvas.getBoundingClientRect();
    const width = Math.max(320, rect.width || window.innerWidth);
    const height = Math.max(320, rect.height || window.innerHeight);
    callback(width, height);
  }

  function createAurora(ctx, width, height, time) {
    const primaryPink = colors.primaryPink || '#ff4f7d';
    const purple = colors.purple || '#916dff';
    const blue = colors.blue || '#63d8ff';
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, `${primaryPink}22`);
    gradient.addColorStop(0.5, `${purple}33`);
    gradient.addColorStop(1, `${blue}22`);

    ctx.save();
    ctx.globalAlpha = 0.55;
    ctx.filter = 'blur(70px)';
    for (let i = 0; i < 3; i += 1) {
      const offset = i * 120 + Math.sin(time * 0.0003 + i) * 60;
      ctx.beginPath();
      ctx.moveTo(-80, height * 0.4 + offset);
      ctx.bezierCurveTo(width * 0.3, height * 0.2 + offset, width * 0.7, height * 0.7 + offset, width + 80, height * 0.3 + offset);
      ctx.lineTo(width + 80, height);
      ctx.lineTo(-80, height);
      ctx.closePath();
      ctx.fillStyle = gradient;
      ctx.fill();
    }
    ctx.restore();
  }

  function createStars(ctx, width, height, time) {
    const stars = window.__auroraStars || [];
    if (!stars.length) {
      const count = config.particles?.maxStars || 80;
      for (let i = 0; i < count; i += 1) {
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          radius: Math.random() * 1.6 + 0.4,
          alpha: Math.random() * 0.8 + 0.2,
          drift: Math.random() * 0.004 + 0.001
        });
      }
      window.__auroraStars = stars;
    }

    stars.forEach((star, index) => {
      const twinkle = 0.5 + 0.5 * Math.sin(time * 0.001 + index * 0.6);
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${star.alpha * twinkle})`;
      ctx.fill();
    });
  }

  function createFireflies(ctx, width, height, time) {
    const fireflies = window.__auroraFireflies || [];
    if (!fireflies.length) {
      const count = config.particles?.maxFireflies || 20;
      for (let i = 0; i < count; i += 1) {
        fireflies.push({
          x: Math.random() * width,
          y: Math.random() * height,
          radius: Math.random() * 2.4 + 0.6,
          alpha: Math.random() * 0.6 + 0.2,
          speed: Math.random() * 0.0015 + 0.0006
        });
      }
      window.__auroraFireflies = fireflies;
    }

    fireflies.forEach((firefly, index) => {
      const pulse = 0.7 + 0.3 * Math.sin(time * firefly.speed * 1.8 + index);
      ctx.beginPath();
      ctx.arc(firefly.x + Math.sin(time * 0.001 + index) * 20, firefly.y + Math.cos(time * 0.0015 + index) * 18, firefly.radius * pulse, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 143, 171, ${firefly.alpha * pulse})`;
      ctx.fill();
    });
  }

  function createFog(ctx, width, height, time) {
    ctx.save();
    ctx.globalAlpha = 0.16;
    ctx.filter = 'blur(40px)';
    const fogGradient = ctx.createRadialGradient(width * 0.2, height * 0.25, 20, width * 0.2, height * 0.25, width * 0.45);
    fogGradient.addColorStop(0, colors.white || '#ffffff');
    fogGradient.addColorStop(1, 'transparent');
    ctx.fillStyle = fogGradient;
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
  }

  function createShootingStars(ctx, width, height, time) {
    const stars = window.__shootingStars || [];
    if (!stars.length) {
      for (let i = 0; i < (config.particles?.shootingStarCount || 3); i += 1) {
        stars.push({
          x: Math.random() * width * 0.8,
          y: Math.random() * height * 0.3,
          length: 120 + Math.random() * 200,
          speed: 2 + Math.random() * 3,
          alpha: 0.6,
          delay: Math.random() * 5000
        });
      }
      window.__shootingStars = stars;
    }

    stars.forEach((star, index) => {
      const phase = (time + star.delay) % 10000;
      if (phase < 2200) {
        const progress = phase / 2200;
        const x = star.x + progress * star.speed * 35;
        const y = star.y + progress * star.speed * 22;
        ctx.save();
        ctx.strokeStyle = `rgba(255,255,255,${star.alpha * (1 - progress)})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x - star.length * progress, y - star.length * progress * 0.4);
        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.restore();
      }
    });
  }

  function renderIntroCanvas(canvas) {
    const parent = canvas.parentElement;
    if (!parent) {
      return;
    }

    resizeCanvas(canvas, (width, height) => {
      const ctx = createCanvasContext(canvas, width, height);
      let frameId = 0;

      function draw(now) {
        ctx.clearRect(0, 0, width, height);
        createAurora(ctx, width, height, now);
        createStars(ctx, width, height, now);
        createFireflies(ctx, width, height, now);
        createFog(ctx, width, height, now);
        createShootingStars(ctx, width, height, now);
        frameId = window.requestAnimationFrame(draw);
      }

      window.cancelAnimationFrame(frameId);
      frameId = window.requestAnimationFrame(draw);
    });

    window.addEventListener('resize', () => resizeCanvas(canvas, (width, height) => {
      createCanvasContext(canvas, width, height);
    }), { passive: true });
  }

  function renderConstellation(canvas) {
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const points = Array.from({ length: 10 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 2 + 1
    }));

    function draw(now) {
      ctx.clearRect(0, 0, width, height);
      ctx.save();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.lineWidth = 1;
      points.forEach((point, index) => {
        points.forEach((other, otherIndex) => {
          if (otherIndex <= index) {
            return;
          }
          const distance = Math.hypot(point.x - other.x, point.y - other.y);
          if (distance < 110) {
            ctx.globalAlpha = 1 - distance / 110;
            ctx.beginPath();
            ctx.moveTo(point.x, point.y);
            ctx.lineTo(other.x, other.y);
            ctx.stroke();
          }
        });
      });
      ctx.restore();
      points.forEach((point) => {
        ctx.beginPath();
        ctx.arc(point.x, point.y, point.radius + Math.sin(now * 0.001 + point.x) * 0.4, 0, Math.PI * 2);
        ctx.fillStyle = '#ffd56a';
        ctx.fill();
      });
      window.requestAnimationFrame(draw);
    }

    window.requestAnimationFrame(draw);
  }

  function launchConfetti() {
    const container = document.createElement('div');
    container.className = 'confetti-layer';
    document.body.appendChild(container);
    const pieces = Array.from({ length: config.particles?.confettiCount || 60 }, () => {
      const piece = document.createElement('span');
      piece.className = 'confetti-piece';
      piece.style.setProperty('--x', `${Math.random() * 100}%`);
      piece.style.setProperty('--delay', `${Math.random() * 0.8}s`);
      piece.style.background = [colors.primaryPink, colors.softPink, colors.purple, colors.blue, colors.gold][Math.floor(Math.random() * 5)];
      container.appendChild(piece);
      return piece;
    });

    window.setTimeout(() => container.remove(), 2200);
    return pieces;
  }

  function initEffects() {
    const introCanvas = document.getElementById('introCanvas');
    const constellationCanvas = document.getElementById('constellationCanvas');
    if (introCanvas) {
      renderIntroCanvas(introCanvas);
    }
    if (constellationCanvas) {
      renderConstellation(constellationCanvas);
    }
    window.addEventListener('pointermove', (event) => {
      const glow = document.querySelector('.cursor-glow');
      if (glow) {
        glow.animate([
          { transform: `translate(${event.clientX}px, ${event.clientY}px) scale(1)` },
          { transform: `translate(${event.clientX}px, ${event.clientY}px) scale(1.05)` }
        ], {
          duration: 500,
          fill: 'forwards',
          easing: 'cubic-bezier(0.22, 1, 0.36, 1)'
        });
      }
    }, { passive: true });
  }

  window.AuroraEffects = {
    initEffects,
    launchConfetti
  };

  window.addEventListener('DOMContentLoaded', initEffects);
})();
