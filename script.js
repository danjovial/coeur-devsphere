console.log("✅ Script chargé — prêt à démarrer avec startAll()");

// --------- Variables globales ----------
const canvas = document.getElementById('matrix');
const ctx = canvas.getContext('2d');
const heartCanvas = document.getElementById('heartCanvas');
const heartCtx = heartCanvas.getContext ? heartCanvas.getContext('2d') : null;
const countdownEl = document.getElementById('countdown');

let matrixInterval = null;
let matrixRunning = false;

// Matrix settings (will be recalculés à chaque resize)
let letters = "HAPPY BIRTHDAY".split("");
let fontSize = 20;
let columns = 0;
let drops = [];
let colors = ["#00bfff", "#ff66cc"];
let offsets = [];

// Resize canvas & recalc columns/drops
function resizeMatrix() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  // recalc columns and drops
  columns = Math.floor(canvas.width / fontSize);
  drops = Array(columns).fill(1);
  offsets = Array(columns).fill(0).map(() => Math.floor(Math.random() * letters.length));
}
resizeMatrix();
window.addEventListener('resize', resizeMatrix);

// --------- Matrix draw function (no auto-start here) ----------
function drawMatrix() {
  // slightly transparent black to create trailing effect
  ctx.fillStyle = "rgba(0,0,0,0.05)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.font = fontSize + "px monospace";

  for (let i = 0; i < drops.length; i++) {
    ctx.fillStyle = colors[i % colors.length];

    const letterIndex = (drops[i] + offsets[i]) % letters.length;
    const text = letters[letterIndex];

    ctx.fillText(text, i * fontSize, drops[i] * fontSize);

    if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
      drops[i] = 0;
    }
    drops[i]++;
  }
}

// --------- Countdown (starts after matrix starts) ----------
function startCountdown(onComplete) {
  countdownEl.style.display = "block";
  let count = 3;
  countdownEl.textContent = count;

  const timer = setInterval(() => {
    count--;
    countdownEl.textContent = count > 0 ? count : "";
    if (count <= 0) {
      clearInterval(timer);
      countdownEl.style.display = "none";
      if (typeof onComplete === "function") onComplete();
    }
  }, 1000);
}

// --------- Messages + images sequence ----------
function launchMessages() {
  const messages = Array.from(document.querySelectorAll('.floating-message')).filter(el => el.tagName !== 'IMG');
  const images = Array.from(document.querySelectorAll('#message-container img.floating-message'));

  // Afficher messages texte un par un
  messages.forEach((msg, i) => {
    setTimeout(() => {
      msg.classList.add('show');
      setTimeout(() => msg.classList.remove('show'), 4000);
    }, i * 5000);
  });

  const totalMsgDuration = messages.length * 5000;

  // Afficher images une par une après messages
  images.forEach((img, i) => {
    setTimeout(() => {
      img.classList.add('show');
      setTimeout(() => img.classList.remove('show'), 4000);
    }, totalMsgDuration + i * 5000);
  });

  const totalDuration = totalMsgDuration + images.length * 5000;

  // Après tout, lancer le cœur en particules
  setTimeout(() => {
    stopMatrix();
    // masquer éléments précédents
    document.getElementById('matrix').style.display = 'none';
    document.getElementById('message-container').style.display = 'none';

    // show heart canvas and launch
    heartCanvas.style.display = 'block';

    // déclenche transition CSS douce
    setTimeout(() => heartCanvas.classList.add('show'), 50);

    launchHeartParticles();
  }, totalDuration + 1000);
}

// --------- Matrix control ----------
function startMatrix() {
  if (matrixRunning) return;
  matrixRunning = true;
  // Make sure canvas visible
  canvas.style.display = 'block';
  // start interval
  matrixInterval = setInterval(drawMatrix, 50);
}

function stopMatrix() {
  if (matrixInterval) {
    clearInterval(matrixInterval);
    matrixInterval = null;
  }
  matrixRunning = false;
}

// --------- Heart particles ----------
function launchHeartParticles() {
  if (!heartCtx) return console.warn("heart canvas ctx missing");
  function resizeHeartCanvas() {
    heartCanvas.width = window.innerWidth;
    heartCanvas.height = window.innerHeight;
  }
  resizeHeartCanvas();
  window.addEventListener("resize", resizeHeartCanvas);

  const particles = [];
  const centerX = heartCanvas.width / 2;
  const centerY = heartCanvas.height / 2;
  const numParticles = 800;

  for (let i = 0; i < numParticles; i++) {
    const t = Math.random() * Math.PI * 2;
    const r = 16 * Math.pow(Math.sin(t), 3);
    const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);

    particles.push({
      x: centerX + r * 15,
      y: centerY - y * 15,
      size: 2,
      color: "red",
      dx: (Math.random() - 0.5) * 2,
      dy: (Math.random() - 0.5) * 2,
    });
  }

  function animateHeart() {
    heartCtx.clearRect(0, 0, heartCanvas.width, heartCanvas.height);
    particles.forEach(p => {
      heartCtx.beginPath();
      heartCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      heartCtx.fillStyle = p.color;
      heartCtx.fill();

      p.x += p.dx;
      p.y += p.dy;
    });

   

    requestAnimationFrame(animateHeart);
  }
  animateHeart();

  // Afficher le cœur en douceur (transition CSS)
  setTimeout(() => heartCanvas.classList.add('show'), 50);

  // Afficher le message final APRÈS 3 secondes (par exemple)
  setTimeout(() => {
    const finalMsg = document.getElementById('final-message');
    if (finalMsg) finalMsg.classList.add('show');
  }, 3000);
}

// --------- Fonction qui démarre tout (appelée par le bouton) ----------
let started = false;
function startAll() {
  if (started) return;
  started = true;

  // cacher écran de démarrage si présent
  const startContainer = document.getElementById('start-container');
  if (startContainer) startContainer.style.display = 'none';

  // Play music (clic utilisateur allows play)
  const audio = document.getElementById('myAudio');
  if (audio) {
    audio.currentTime = 0;
    audio.play().catch(err => console.warn("Impossible de jouer l'audio automatiquement :", err));
  }

  // Start matrix
  startMatrix();

  // Start countdown then messages
  startCountdown(() => {
    launchMessages();
  });
}

// Optional: prevent accidental auto-start on page load
// (there's no auto-start code here — startAll() must be called from the bouton)
