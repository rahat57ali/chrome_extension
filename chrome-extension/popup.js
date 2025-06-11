const API_URL = 'http://localhost:5000/api/auth';


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

      // Check if token is stored
      chrome.storage.local.get(['token'], (result) => {
        const token = result.token;
        if (token) {
          fetch('http://localhost:5000/api/auth/profile', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })
          .then(res => res.json())
          .then(data => {
            console.log('User data:', data);
            showProfile(); // updates the UI
          })
          .catch(err => console.error('Profile fetch error:', err));
        }
      });

    }
  }, 500);
});




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

    // Save token
    chrome.storage.local.set({ token: data.token }, () => {
      showProfile();
    });
  } catch (err) {
   message.textContent = 'Something went wrong. Please check your credentials or try again.';
  console.error('Login failed:', err);
  }
});

document.getElementById('logout').addEventListener('click', () => {
  chrome.storage.local.remove('token', () => {
    // alert('Logged out successfully!');
    location.reload();
  });
});

document.getElementById('admin-btn').addEventListener('click', () => {
  alert('Redirecting to admin dashboard...');
  // Or open a page in new tab: chrome.tabs.create({ url: '...' });
});

async function showProfile() {
  chrome.storage.local.get('token', async ({ token }) => {
    if (!token) return;

    try {
      const res = await fetch(`${API_URL}/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json();
      if (!res.ok) throw new Error();

      document.getElementById('user-email').textContent = data.user.email;
      document.getElementById('user-role').textContent = data.user.role;
      document.getElementById('login-form').style.display = 'none';
      document.getElementById('profile').style.display = 'block';
      // Show admin panel if role is admin
      if (data.user.role === 'admin') {
        document.getElementById('admin-panel').style.display = 'block';
      } else {
        document.getElementById('admin-panel').style.display = 'none';
      }
    } catch (err) {
      console.log('Token expired or invalid, logging out...');
      chrome.storage.local.remove('token');
    }
  });
}

// Run on popup load
document.addEventListener('DOMContentLoaded', showProfile);
