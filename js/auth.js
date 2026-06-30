document.addEventListener('DOMContentLoaded', function() {
  const alertEl = document.getElementById('auth-alert');
  if (!alertEl) return;

  function showAlert(message, type) {
    alertEl.textContent = message;
    alertEl.className = 'auth-alert auth-alert-' + type;
    alertEl.style.display = 'block';
  }

  function setLoading(btnId, textId, spinnerId, loading) {
    const btn = document.getElementById(btnId);
    const text = document.getElementById(textId);
    const spinner = document.getElementById(spinnerId);
    if (!btn) return;
    btn.disabled = loading;
    text.style.display = loading ? 'none' : 'inline';
    spinner.style.display = loading ? 'inline' : 'none';
  }

  // --- Login Form ---
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      alertEl.style.display = 'none';

      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value.trim();

      if (!email || !password) {
        showAlert('Please fill in all fields', 'error');
        return;
      }

      setLoading('login-btn', 'login-text', 'login-spinner', true);

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
            window.location.href = '/admin.html';
          }, 800);
        } else {
          showAlert(data.error || 'Login failed', 'error');
        }
      } catch (err) {
        showAlert('Network error. Please try again.', 'error');
      } finally {
        setLoading('login-btn', 'login-text', 'login-spinner', false);
      }
    });
  }

  // --- Register Form ---
  const registerForm = document.getElementById('register-form');
  if (registerForm) {
    registerForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      alertEl.style.display = 'none';

      const name = document.getElementById('name').value.trim();
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value.trim();

      if (!name || !email || !password) {
        showAlert('Please fill in all fields', 'error');
        return;
      }

      if (password.length < 6) {
        showAlert('Password must be at least 6 characters', 'error');
        return;
      }

      setLoading('register-btn', 'register-text', 'register-spinner', true);

      try {
        const res = await fetch(CONFIG.API_BASE_URL + '/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password }),
        });

        const data = await res.json();

        if (res.ok && data.success) {
          showAlert('Account created! Redirecting to login...', 'success');
          setTimeout(() => {
            window.location.href = '/login.html';
          }, 1500);
        } else {
          showAlert(data.error || 'Registration failed', 'error');
        }
      } catch (err) {
        showAlert('Network error. Please try again.', 'error');
      } finally {
        setLoading('register-btn', 'register-text', 'register-spinner', false);
      }
    });
  }
});
