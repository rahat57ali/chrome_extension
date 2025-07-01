const API_URL = 'http://localhost:5000/api/auth';

document.addEventListener('DOMContentLoaded', () => {
  setupGoogleLogin();
  setupEmailLogin();
  setupLogout();
  showProfile();
});

// ---- GOOGLE LOGIN ----
function setupGoogleLogin() {
  document.getElementById('googleLoginBtn').addEventListener('click', () => {
    const width = 500, height = 600;
    const left = (screen.width - width) / 2;
    const top = (screen.height - height) / 2;

    const popup = window.open(
      'http://localhost:5000/api/auth/google',
      'Google Login',
      `width=${width},height=${height},top=${top},left=${left}`
    );

    const checkPopupClosed = setInterval(() => {
      if (popup.closed) {
        clearInterval(checkPopupClosed);

        chrome.storage.local.get(['token'], ({ token }) => {
          if (token) showProfile();
        });
      }
    }, 500);
  });
}

// ---- EMAIL LOGIN ----
function setupEmailLogin() {
  document.getElementById('login-btn').addEventListener('click', async () => {
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    const message = document.getElementById('message');

    if (!email || !password) return (message.textContent = 'Email and password are required.');

    try {
      const res = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      if (!res.ok) return (message.textContent = data.message);

      chrome.storage.local.set({ token: data.token }, () => {
        showProfile();
      });
    } catch (err) {
      message.textContent = 'Something went wrong. Please try again.';
      console.error('Login error:', err);
    }
  });
}

// ---- LOGOUT ----
function setupLogout() {
  document.getElementById('logout').addEventListener('click', () => {
    chrome.storage.local.remove('token', () => {
      location.reload();
    });
  });
}

// ---- SHOW PROFILE AND ADMIN CONTROLS ----
async function showProfile() {
  chrome.storage.local.get('token', async ({ token }) => {
    if (!token) return;

    try {
      const res = await fetch(`${API_URL}/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json();
      if (!res.ok) throw new Error();

      const user = data.user;
      document.getElementById('user-email').textContent = user.email;
      document.getElementById('user-role').textContent = user.role;
      document.getElementById('login-form').style.display = 'none';
      document.getElementById('profile').style.display = 'block';

      // Show admin panel for 'admin' or 'superadmin'
      if (user.role === 'admin' || user.role === 'superAdmin') {
        document.getElementById('admin-panel').style.display = 'block';
      }

      // Show SuperAdmin panel button only for superadmin
      if (user.role === 'superAdmin') {
        const btn = document.getElementById('openAdminBtn');
        btn.style.display = 'block';
        btn.addEventListener('click', () => {
          chrome.tabs.create({ url: chrome.runtime.getURL('superAdmin.html') });
        });
      }
    } catch (err) {
      console.log('Invalid/expired token, logging out...');
      chrome.storage.local.remove('token');
    }
  });
}
