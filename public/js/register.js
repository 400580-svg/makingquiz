document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('register-form');
  const errorBox = document.getElementById('error-box');
  const submitBtn = form.querySelector('button[type="submit"]');

  function showErrors(messages) {
    errorBox.hidden = false;
    errorBox.innerHTML = '<ul>' + messages.map(m => '<li></li>').join('') + '</ul>';
    const lis = errorBox.querySelectorAll('li');
    messages.forEach((m, i) => { lis[i].textContent = m; });
  }

  function hideErrors() { errorBox.hidden = true; errorBox.innerHTML = ''; }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideErrors();

    const payload = {
      username: form.username.value.trim(),
      email: form.email.value.trim(),
      password: form.password.value,
      educator_key: form.educator_key.value.trim()
    };

    submitBtn.disabled = true;
    submitBtn.textContent = 'Creating account...';
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok) {
        errorBox.className = 'success-box';
        errorBox.hidden = false;
        errorBox.textContent = data.message + ' Redirecting to login...';
        setTimeout(() => { window.location.href = '/login.html'; }, 1500);
      } else {
        showErrors(data.errors || ['Registration failed. Please try again.']);
      }
    } catch {
      showErrors(['Could not reach the server. Check your connection and try again.']);
    } finally {
      if (!form.dataset.done) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Create Account';
      }
    }
  });
});
