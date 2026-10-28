document.addEventListener('DOMContentLoaded', async () => {
  const logoutBtn = document.getElementById('logout-btn');

  // Load current user; redirect to login if the session is gone.
  try {
    const res = await fetch('/api/auth/me');
    if (!res.ok) { window.location.href = '/login.html'; return; }
    const user = await res.json();
    document.getElementById('welcome-username').textContent = user.username;
    document.getElementById('welcome-role').textContent = user.role;

    // Only teachers/admins get the Question Tools button.
    if (user.role === 'teacher' || user.role === 'admin') {
      document.getElementById('teacher-tools-link').style.display = 'block';
    }

    // RBAC demonstration: only teacher/admin can read stats.
    const statsRes = await fetch('/api/admin/stats');
    if (statsRes.ok) {
      const stats = await statsRes.json();
      const el = document.getElementById('admin-stats');
      el.hidden = false;
      el.textContent = 'Users by role: ' +
        stats.users_by_role.map(r => r.role + '=' + r.count).join(', ');
    }
  } catch {
    window.location.href = '/login.html';
  }

  logoutBtn.addEventListener('click', async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/login.html';
  });
});