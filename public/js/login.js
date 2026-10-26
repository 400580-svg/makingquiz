document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('login-form');
  const errorBox = document.getElementById('error-box');
  const submitBtn = form.querySelector('button[type="submit"]');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorBox.hidden = true;

    const payload = {
      identifier: form.identifier.value.trim(),
      password: form.password.value
    };
    if (!payload.identifier || !payload.password) {
      errorBox.hidden = false;
      errorBox.textContent = 'Enter your email/username and password.';
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Logging in...';
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok) {
        window.location.href = '/dashboard.html';
      } else {
        errorBox.hidden = false;
        errorBox.textContent = (data.errors || ['Login failed.'])[0];
      }
    } catch {
      errorBox.hidden = false;
      errorBox.textContent = 'Could not reach the server. Check your connection and try again.';
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Log In';
    }
  });
});
