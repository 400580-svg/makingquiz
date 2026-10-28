// Original SVG badges (trophy / conference laurels) — animated with CSS in styles.css
const TROPHY_SVG = '<svg class="trophy" width="16" height="16" viewBox="0 0 24 24" fill="#181A1B" xmlns="http://www.w3.org/2000/svg"><path d="M5 3h14v2h3v3c0 2.8-2.2 5-5 5h-.4a6 6 0 0 1-3.6 2.6V18h3v2H8v-2h3v-2.4A6 6 0 0 1 7.4 13H7c-2.8 0-5-2.2-5-5V5h3V3zm0 4H4v1c0 1.7 1.3 3 3 3h.1A9 9 0 0 1 7 8.4V7zm15 0h-1v1.4a9 9 0 0 1-.1 2.6c1.7 0 3.1-1.3 3.1-3V7h-2z"/></svg>';
const LAUREL_SVG = '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12 2c-2 2.5-2 5-1 7 1-2 1.5-4 1-7zm-4 1.5C6.5 6 6.5 8.5 8 10.5c.3-2.3.3-4.6 0-7zm8 0c-.3 2.4-.3 4.7 0 7 1.5-2 1.5-4.5 0-7zM5 6.5C4 9 4.8 11.5 6.5 13c0-2.2-.4-4.4-1.5-6.5zm14 0C17.9 8.6 17.5 10.8 17.5 13c1.7-1.5 2.5-4 1.5-6.5zM4 12c-.5 2.5.8 4.8 3 6-.5-2-.5-4 .2-5.8A7 7 0 0 1 4 12zm16 0a7 7 0 0 1-3.2.2c.7 1.8.7 3.8.2 5.8 2.2-1.2 3.5-3.5 3-6zm-11.5 3.5c-1 1.5-1 3.5 0 5.5 1.3-1 2-2.5 2-4.5-.7-.3-1.4-.7-2-1zm7 0c-.6.3-1.3.7-2 1 0 2 .7 3.5 2 4.5 1-2 1-4 0-5.5z"/></svg>';

function badgeFor(rank) {
  if (rank === 1) return '<span class="rank-badge champ">' + TROPHY_SVG + 'SUPER BOWL CHAMPION</span>';
  if (rank === 2) return '<span class="rank-badge afc">' + LAUREL_SVG + 'AFC CHAMPIONSHIP</span>';
  if (rank === 3) return '<span class="rank-badge nfc">' + LAUREL_SVG + 'NFC CHAMPIONSHIP</span>';
  return '<span class="rank-num">#' + rank + '</span>';
}

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
  const errBox = document.getElementById('error-box');

  // ---- Overall leaderboard ----
  try {
    const res = await fetch('/api/leaderboards/overall');
    const data = await res.json();
    if (!res.ok) throw new Error((data.errors || [])[0] || 'Failed to load');
    const body = document.getElementById('overall-body');
    if (!data.leaders.length) {
      body.innerHTML = '<tr><td colspan="4">No completed attempts yet — be the first!</td></tr>';
    }
    data.leaders.forEach(l => {
      const tr = document.createElement('tr');
      if (l.username === me.username) tr.className = 'me-row';
      tr.innerHTML =
        '<td class="rank-cell">' + badgeFor(l.rank) + '</td>' +
        '<td class="username-cell">' + escapeHtml(l.username) + '</td>' +
        '<td>' + l.total_attempts + '</td>' +
        '<td>' + l.avg_accuracy + '%</td>';
      body.appendChild(tr);
    });
  } catch (err) {
    errBox.hidden = false;
    errBox.textContent = 'Could not load overall leaderboard: ' + err.message;
  }

  // ---- Per-quiz leaderboard ----
  const select = document.getElementById('quiz-select');
  const quizBody = document.getElementById('quiz-lb-body');
  try {
    const res = await fetch('/api/quizzes');
    const data = await res.json();
    if (!res.ok) throw new Error((data.errors || [])[0] || 'Failed to load quizzes');
    for (const q of data.quizzes) {
      const opt = document.createElement('option');
      opt.value = q.id; opt.textContent = q.title;
      select.appendChild(opt);
    }
    await loadQuizLb();
  } catch (err) {
    errBox.hidden = false;
    errBox.textContent = 'Could not load quizzes: ' + err.message;
  }

  async function loadQuizLb() {
    quizBody.innerHTML = '';
    try {
      const res = await fetch('/api/leaderboards/quiz/' + encodeURIComponent(select.value));
      const data = await res.json();
      if (!res.ok) throw new Error((data.errors || [])[0] || 'Failed to load');
      if (!data.leaders.length) {
        quizBody.innerHTML = '<tr><td colspan="4">No completed attempts on this playbook yet.</td></tr>';
        return;
      }
      data.leaders.forEach(l => {
        const tr = document.createElement('tr');
        if (l.username === me.username) tr.className = 'me-row';
        tr.innerHTML =
          '<td class="rank-cell">' + badgeFor(l.rank) + '</td>' +
          '<td class="username-cell">' + escapeHtml(l.username) + '</td>' +
          '<td>' + l.highest_score + '/' + l.total_questions + '</td>' +
          '<td>' + l.completed_attempts + '</td>';
        quizBody.appendChild(tr);
      });
    } catch (err) {
      errBox.hidden = false;
      errBox.textContent = 'Could not load playbook leaderboard: ' + err.message;
    }
  }
  select.addEventListener('change', loadQuizLb);

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[c]);
  }
});
