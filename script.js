// DOM Elements
const video = document.getElementById('video');
const emotionText = document.getElementById('emotion');
const loginPage = document.getElementById('loginPage');
const registerPage = document.getElementById('registerPage');
const mainPage = document.getElementById('mainPage');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const emotionList = document.querySelector('.emotion-list');
const startCameraBtn = document.getElementById('startCamera');
const stopCameraBtn = document.getElementById('stopCamera');
const videoContainer = document.getElementById('videoContainer');
const cameraOverlay = document.getElementById('cameraOverlay');
const moodIcon = document.getElementById('moodIcon');

// Camera stream reference
let currentStream = null;

// Dummy user database
let users = [
    { username: 'demo', password: 'demo123', email: 'demo@example.com' }
];

// Event Listeners
startCameraBtn?.addEventListener('click', async () => {
    try {
        await initializeEmotionDetection();
        toggleCameraUI(true);
    } catch (error) {
        alert('Tidak dapat mengakses kamera: ' + error.message);
        console.error(error);
    }
});

stopCameraBtn?.addEventListener('click', stopCamera);

// Show/hide login/register
function showLogin() {
    registerPage?.classList.add('hidden');
    loginPage?.classList.remove('hidden');
}

function showRegister() {
    loginPage?.classList.add('hidden');
    registerPage?.classList.remove('hidden');
}

// Login
function login(event) {
    event.preventDefault();
    const username = document.getElementById('username')?.value;
    const password = document.getElementById('password')?.value;
    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
        // Jika kita di login.html, redirect ke dashboard.html
        window.location.href = "dashboard.html";
    } else {
        alert('Invalid credentials! Try demo/demo123 or register a new account.');
    }
}

// Register
function register(event) {
    event.preventDefault();
    const username = document.getElementById('regUsername')?.value;
    const email = document.getElementById('regEmail')?.value;
    const password = document.getElementById('regPassword')?.value;
    const confirmPassword = document.getElementById('regConfirmPassword')?.value;

    if (password !== confirmPassword) {
        alert('Passwords do not match!');
        return;
    }

    if (users.some(u => u.username === username)) {
        alert('Username already exists!');
        return;
    }

    users.push({ username, password, email });
    alert('Registration successful! Please login.');
    showLogin();
}

// Logout
function logout() {
    stopCamera();
    window.location.href = "index.html";
}

// Kamera UI
function toggleCameraUI(isRunning) {
    startCameraBtn?.classList.toggle('hidden', isRunning);
    stopCameraBtn?.classList.toggle('hidden', !isRunning);
    videoContainer?.classList.toggle('hidden', !isRunning);
    cameraOverlay?.classList.toggle('hidden', isRunning);
    if (emotionText) {
        emotionText.textContent = isRunning ? 'Menganalisis...' : 'Menunggu Kamera...';
    }
}

// Stop kamera
function stopCamera() {
    if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
        currentStream = null;
    }
    if (video) video.srcObject = null;
    toggleCameraUI(false);
    resetEmotionDisplay();
}

// Load face-api.js dan mulai video
async function initializeEmotionDetection() {
    await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri('https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights'),
        faceapi.nets.faceExpressionNet.loadFromUri('https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights')
    ]);
    await startVideo();
}

async function startVideo() {
    const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 720, height: 560 } });
    if (video) {
        video.srcObject = stream;
    }
    currentStream = stream;
}

// Tracking Emosi
let recentEmotions = [];

function updateEmotionHistory(emotion) {
    const newEntry = { emotion, timestamp: new Date() };
    recentEmotions.unshift(newEntry);
    recentEmotions = recentEmotions.slice(0, 5);

    const icons = {
        happy: 'fa-face-laugh-beam',
        sad: 'fa-face-sad-tear',
        angry: 'fa-face-angry',
        neutral: 'fa-face-meh'
    };

    if (emotionList) {
        emotionList.innerHTML = recentEmotions.map(({ emotion, timestamp }) => {
            const timeStr = new Date(timestamp).toLocaleTimeString();
            const iconClass = icons[emotion.toLowerCase()] || 'fa-face-meh';
            return `
                <div class="emotion-item ${emotion.toLowerCase()}">
                    <i class="fas ${iconClass}"></i>
                    <span>${emotion}</span>
                    <span style="margin-left:auto;font-size:0.9em;color:#666">${timeStr}</span>
                </div>`;
        }).join('');
    }

    const stored = JSON.parse(localStorage.getItem('emotionHistory')) || [];
    stored.unshift(newEntry);
    localStorage.setItem('emotionHistory', JSON.stringify(stored.slice(0, 50)));
}

function resetEmotionDisplay() {
    ['happy', 'sad', 'angry', 'neutral'].forEach(emotion => {
        const progress = document.getElementById(`${emotion}Progress`);
        const percent = document.getElementById(`${emotion}Percentage`);
        if (progress) progress.style.width = '0%';
        if (percent) percent.textContent = '0%';
    });
    if (moodIcon) moodIcon.className = 'fas fa-face-meh';
}

function goTo(page) {
  window.location.href = page;
}

function logout() {
  localStorage.clear();
  window.location.href = "index.html";
}

function renderFullEmotionHistory() {
  const stored = JSON.parse(localStorage.getItem('emotionHistory')) || [];
  const listContainer = document.getElementById('fullEmotionList');
  if (!listContainer) return;

  const iconMap = {
    happy: 'fa-face-laugh-beam',
    sad: 'fa-face-sad-tear',
    angry: 'fa-face-angry',
    neutral: 'fa-face-meh'
  };

  listContainer.innerHTML = stored.map(({ emotion, timestamp }) => {
    const lower = emotion.toLowerCase();
    const timeStr = new Date(timestamp).toLocaleString();
    const iconClass = iconMap[lower] || 'fa-face-meh';

    return `
      <div class="emotion-item ${lower}">
        <i class="fas ${iconClass}"></i>
        <span>${emotion}</span>
        <span style="margin-left:auto;font-size:0.9em;color:#666">${timeStr}</span>
      </div>
    `;
  }).join('');
}

function renderEmotionChart() {
  const stored = JSON.parse(localStorage.getItem('emotionHistory')) || [];
  const emotionCounts = {
    Happy: 0,
    Sad: 0,
    Angry: 0,
    Neutral: 0
  };

  stored.forEach(({ emotion }) => {
    const cap = emotion.charAt(0).toUpperCase() + emotion.slice(1).toLowerCase();
    if (emotionCounts.hasOwnProperty(cap)) {
      emotionCounts[cap]++;
    }
  });

  const ctx = document.getElementById('emotionChart').getContext('2d');
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: Object.keys(emotionCounts),
      datasets: [{
        label: 'Jumlah Emosi',
        data: Object.values(emotionCounts),
        backgroundColor: [
          '#4caf50', // Happy
          '#2196f3', // Sad
          '#f44336', // Angry
          '#9e9e9e'  // Neutral
        ],
        borderRadius: 10
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          stepSize: 1
        }
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: function(context) {
              return ` ${context.parsed.y} kali`;
            }
          }
        }
      }
    }
  });
}

// Jalankan saat halaman dimuat
window.onload = function () {
  renderFullEmotionHistory();
  renderEmotionChart();
};


// Face detection loop
video?.addEventListener('play', () => {
    const canvas = faceapi.createCanvasFromMedia(video);
    video.parentElement.appendChild(canvas);
    const displaySize = {
        width: video.videoWidth || 720,
        height: video.videoHeight || 560
    };
    faceapi.matchDimensions(canvas, displaySize);

    setInterval(async () => {
        const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceExpressions();
        if (!detections.length) return;

        const expressions = detections[0].expressions;

        const percentages = {
            happy: Math.round(expressions.happy * 100),
            sad: Math.round(expressions.sad * 100),
            angry: Math.round(expressions.angry * 100),
            neutral: Math.round(expressions.neutral * 100)
        };

        for (const [emotion, value] of Object.entries(percentages)) {
            const progress = document.getElementById(`${emotion}Progress`);
            const percent = document.getElementById(`${emotion}Percentage`);
            if (progress) progress.style.width = `${value}%`;
            if (percent) percent.textContent = `${value}%`;
        }

        const filteredEmotions = ['happy', 'sad', 'angry', 'neutral'];
        const dominant = Object.entries(expressions)
            .filter(([key]) => filteredEmotions.includes(key))
            .reduce((a, b) => a[1] > b[1] ? a : b)[0];

        const capitalizedEmotion = dominant.charAt(0).toUpperCase() + dominant.slice(1);
        if (emotionText) emotionText.textContent = capitalizedEmotion;

        const iconMap = {
            happy: 'fa-face-laugh-beam',
            sad: 'fa-face-sad-tear',
            angry: 'fa-face-angry',
            neutral: 'fa-face-meh'
        };
        if (moodIcon) {
            moodIcon.className = `fas ${iconMap[dominant]} ${dominant}`;
        }

        updateEmotionHistory(capitalizedEmotion);

        const resized = faceapi.resizeResults(detections, displaySize);
        const context = canvas.getContext('2d');
        context.clearRect(0, 0, canvas.width, canvas.height);
        faceapi.draw.drawDetections(canvas, resized);
        faceapi.draw.drawFaceExpressions(canvas, resized);
    }, 100);
});

// Form bindings (saat berada di login.html)
loginForm?.addEventListener('submit', login);
registerForm?.addEventListener('submit', register);
