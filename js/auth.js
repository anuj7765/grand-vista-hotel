document.addEventListener('DOMContentLoaded', function() {
  const loginForm = document.getElementById('login-form');
  if (!loginForm) return;

  const alertEl = document.getElementById('auth-alert');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const loginBtn = document.getElementById('login-btn');
  const loginText = document.getElementById('login-text');
  const loginSpinner = document.getElementById('login-spinner');

  function showAlert(message, type) {
    alertEl.textContent = message;
    alertEl.className = 'auth-alert auth-alert-' + type;
    alertEl.style.display = 'block';
  }

  function setLoading(loading) {
    loginBtn.disabled = loading;
    loginText.style.display = loading ? 'none' : 'inline';
    loginSpinner.style.display = loading ? 'inline' : 'none';
  }

  loginForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    alertEl.style.display = 'none';

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if (!email || !password) {
      showAlert('Please fill in all fields', 'error');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(CONFIG.API_BASE_URL + '/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        showAlert('Login successful! Redirecting...', 'success');
        setTimeout(() => {
          window.location.href = data.user.role === 'admin' ? '/admin.html' : '/';
        }, 800);
      } else {
        showAlert(data.error || 'Login failed', 'error');
      }
    } catch (err) {
      showAlert('Network error. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  });
});
