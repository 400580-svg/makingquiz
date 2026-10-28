document.addEventListener('DOMContentLoaded', async () => {
  const logout = document.getElementById('nav-logout');
  logout.addEventListener('click', async (e) => {
    e.preventDefault();
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/login.html';
  });

  const meRes = await fetch('/api/auth/me');
  if (!meRes.ok) { window.location.href = '/login.html'; return; }

  const list = document.getElementById('history-list');
  const summary = document.getElementById('history-summary');
  const errBox = document.getElementById('error-box');

  try {
    const res = await fetch('/api/history');
    const data = await res.json();
    if (!res.ok) throw new Error((data.errors || [])[0] || 'Failed to load');

    if (!data.attempts.length) {
      summary.innerHTML = '<strong>No attempts yet.</strong><p>Complete a quiz and it will show up here.</p>';
      return;
    }

    const totalAttempts = data.attempts.length;
    const avg = data.attempts.reduce((s, a) => s + a.percentage, 0) / totalAttempts;
    summary.innerHTML =
      '<strong>Attempts: ' + totalAttempts + '</strong>' +
      '<p>Average score: ' + Math.round(avg * 10) / 10 + '%</p>';

    for (const a of data.attempts) {
      const item = document.createElement('div');
      item.className = 'review-item ' + (a.percentage >= 70 ? 'correct' : 'wrong');
      const when = new Date(a.completed_at).toLocaleString();
      const status = document.createElement('div');
      status.className = 'status';
      status.textContent = a.quiz_title + ' — ' + a.score + '/' + a.total_questions + ' (' + a.percentage + '%)';
      const note = document.createElement('div');
      note.className = 'answer-note';
      note.textContent = 'Completed ' + when + ' • ' + a.quiz_category;
      item.append(status, note);
      list.appendChild(item);
    }
  } catch (err) {
    errBox.hidden = false;
    errBox.textContent = 'Could not load history. ' + err.message;
  }
});
