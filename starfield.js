(() => {
  const canvas = document.getElementById('starfield');
  if (!canvas) return;
  const context = canvas.getContext('2d', { alpha: true });
  if (!context) return;
  const motionOff = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let width = 0;
  let height = 0;
  let ratio = 1;
  let frame = 0;
  let lastTime = 0;
  const stars = [];
  const starCount = 190;
  const origin = { x: 0.73, y: 0.34 };
  const rand = (min, max) => min + Math.random() * (max - min);

  function makeStar(initial = false) {
    return {
      x: rand(-1, 1),
      y: rand(-0.9, 0.9),
      z: initial ? rand(0.12, 1) : 1,
      size: rand(0.45, 1.65),
      warm: Math.random() > 0.88
    };
  }

  function resize() {
    const box = canvas.getBoundingClientRect();
    width = Math.max(1, box.width);
    height = Math.max(1, box.height);
    ratio = Math.min(window.devicePixelRatio || 1, 1.7);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    stars.length = 0;
    for (let i = 0; i < starCount; i++) stars.push(makeStar(true));
    draw(0);
  }

  function draw(time) {
    context.clearRect(0, 0, width, height);
    const centerX = width * origin.x;
    const centerY = height * origin.y;
    const radius = Math.max(width, height) * 0.78;
    const elapsed = lastTime ? Math.min(34, time - lastTime) : 16;
    lastTime = time;
    const speed = motionOff ? 0 : elapsed * 0.000045;

    for (const star of stars) {
      star.z -= speed;
      if (star.z <= 0.045) Object.assign(star, makeStar());
      const scale = 0.18 / star.z;
      const x = centerX + star.x * radius * scale;
      const y = centerY + star.y * radius * scale;
      if (x < -12 || x > width + 12 || y < -12 || y > height + 12) continue;
      const depth = Math.min(1, 0.23 + (1 - star.z) * 0.78);
      const pointSize = star.size * (0.42 + scale * 0.48);
      const colour = star.warm ? `rgba(242,209,154,${depth})` : `rgba(219,235,239,${depth * 0.78})`;
      context.fillStyle = colour;
      context.beginPath();
      context.arc(x, y, pointSize, 0, Math.PI * 2);
      context.fill();
      if (star.z < 0.22 && !motionOff) {
        context.strokeStyle = star.warm ? `rgba(242,209,154,${depth * 0.28})` : `rgba(219,235,239,${depth * 0.16})`;
        context.lineWidth = 0.7;
        context.beginPath();
        context.moveTo(x, y);
        context.lineTo(x - star.x * 13 * scale, y - star.y * 13 * scale);
        context.stroke();
      }
    }

    const pulse = motionOff ? 0.5 : 0.43 + Math.sin(time * 0.00115) * 0.07;
    const flare = context.createRadialGradient(centerX, centerY, 0, centerX, centerY, Math.min(width, height) * 0.28);
    flare.addColorStop(0, `rgba(255,225,169,${pulse * 0.29})`);
    flare.addColorStop(0.12, `rgba(238,185,106,${pulse * 0.12})`);
    flare.addColorStop(1, 'rgba(238,185,106,0)');
    context.fillStyle = flare;
    context.fillRect(0, 0, width, height);

    const glow = context.createRadialGradient(centerX, centerY, 0, centerX, centerY, Math.min(width, height) * 0.075);
    glow.addColorStop(0, 'rgba(255,247,221,0.9)');
    glow.addColorStop(0.08, 'rgba(255,219,154,0.74)');
    glow.addColorStop(0.3, 'rgba(231,181,102,0.2)');
    glow.addColorStop(1, 'rgba(231,181,102,0)');
    context.fillStyle = glow;
    context.fillRect(centerX - height * 0.16, centerY - height * 0.16, height * 0.32, height * 0.32);

    context.save();
    context.translate(centerX, centerY);
    context.globalAlpha = pulse * 0.45;
    context.strokeStyle = 'rgba(255,230,188,0.7)';
    context.lineWidth = 1;
    context.beginPath();
    context.moveTo(-width * 0.16, 0);
    context.lineTo(width * 0.16, 0);
    context.moveTo(0, -height * 0.19);
    context.lineTo(0, height * 0.19);
    context.stroke();
    context.restore();

    if (!motionOff) frame = requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize, { passive: true });
  resize();
  if (motionOff) draw(0);
  else frame = requestAnimationFrame(draw);
  window.addEventListener('pagehide', () => cancelAnimationFrame(frame), { once: true });
})();
