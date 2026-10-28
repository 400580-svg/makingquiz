document.addEventListener('DOMContentLoaded', async () => {
  const logout = document.getElementById('nav-logout');
  logout.addEventListener('click', async (e) => {
    e.preventDefault();
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/login.html';
  });

  const meRes = await fetch('/api/auth/me');
  if (!meRes.ok) { window.location.href = '/login.html'; return; }
  const me = await meRes.json();
  document.getElementById('nav-username').textContent = me.username;

  const grid = document.getElementById('quiz-grid');
  const errBox = document.getElementById('error-box');
  try {
    const res = await fetch('/api/quizzes');
    const data = await res.json();
    if (!res.ok) throw new Error((data.errors || [])[0] || 'Failed to load');
    if (!data.quizzes.length) {
      errBox.hidden = false; errBox.textContent = 'No quizzes available yet.';
      return;
    }
    for (const quiz of data.quizzes) {
      const card = document.createElement('div');
      card.className = 'quiz-card';
      const badge = document.createElement('span');
      badge.className = 'badge'; badge.textContent = quiz.category;
      const h2 = document.createElement('h2'); h2.textContent = quiz.title;
      const p = document.createElement('p'); p.textContent = quiz.description || '';
      const meta = document.createElement('div');
      meta.className = 'meta'; meta.textContent = quiz.question_count + ' questions';
      const btn = document.createElement('a');
      btn.className = 'btn-primary';
      btn.style.textAlign = 'center'; btn.style.textDecoration = 'none';
      btn.href = '/quiz.html?id=' + quiz.id;
      btn.textContent = 'PRACTICE NOW';
      card.append(badge, h2, p, meta, btn);
      grid.appendChild(card);
    }
  } catch (err) {
    errBox.hidden = false; errBox.textContent = 'Could not load quizzes. ' + err.message;
  }
});
