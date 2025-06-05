document.getElementById("registerForm").addEventListener("submit", register);
document.getElementById("loginForm").addEventListener("submit", login);

function showRegister() {
  document.getElementById("loginPage").classList.add("hidden");
  document.getElementById("registerPage").classList.remove("hidden");
}

function showLogin() {
  document.getElementById("registerPage").classList.add("hidden");
  document.getElementById("loginPage").classList.remove("hidden");
}

function register(e) {
  e.preventDefault();

  const username = document.getElementById("regUsername").value;
  const email = document.getElementById("regEmail").value;
  const password = document.getElementById("regPassword").value;
  const confirmPassword = document.getElementById("regConfirmPassword").value;

  if (password !== confirmPassword) {
    alert("Password tidak cocok!");
    return;
  }

  const userData = { username, email, password };
  localStorage.setItem("userAccount", JSON.stringify(userData));
  alert("Registrasi berhasil! Silakan login.");
  showLogin();
}

function login(e) {
  e.preventDefault();

  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  const storedUser = JSON.parse(localStorage.getItem("userAccount"));

  if (!storedUser) {
    alert("Belum ada akun terdaftar. Silakan registrasi.");
    return;
  }

  if (username === storedUser.username && password === storedUser.password) {
    alert("Login berhasil!");
    window.location.href = "dashboard.html"; // ganti sesuai halaman utama kamu
  } else {
    alert("Username atau password salah!");
  }
}
