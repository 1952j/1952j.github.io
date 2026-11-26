const canvas = document.getElementById("snow");
const ctx = canvas.getContext("2d");

let width, height, flakes;

function resize() {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
}

function createFlakes() {
  const count = Math.floor(width / 15);
  flakes = Array.from({ length: count }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    radius: Math.random() * 2 + 0.8,
    speedY: Math.random() * 0.7 + 0.3,
    speedX: Math.random() * 0.4 - 0.2,
    opacity: Math.random() * 0.5 + 0.15,
    sway: Math.random() * Math.PI * 2,
  }));
}

function draw() {
  ctx.clearRect(0, 0, width, height);

  for (const f of flakes) {
    ctx.beginPath();
    ctx.arc(f.x, f.y, f.radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(240, 246, 252, ${f.opacity})`;
    ctx.fill();

    f.sway += 0.01;
    f.y += f.speedY;
    f.x += f.speedX + Math.sin(f.sway) * 0.25;

    // Wrap around screen edges
    if (f.y > height) {
      f.y = -5;
      f.x = Math.random() * width;
    }
    if (f.x > width) f.x = 0;
    if (f.x < 0) f.x = width;
  }

  requestAnimationFrame(draw);
}

window.addEventListener("resize", () => {
  resize();
  createFlakes();
});

resize();
createFlakes();
draw();
