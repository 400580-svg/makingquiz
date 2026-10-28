// Original SVG badges (trophy / conference laurels) — animated with CSS in styles.css
// #1 badge: an original Super Bowl-style trophy — silver football on a tee,
// atop a tall silver column with a gold base. (Original art, not the real trophy.)
const TROPHY_SVG = '<svg class="trophy" width="18" height="24" viewBox="0 0 24 32" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="sbS" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#EAF2F8"/><stop offset=".45" stop-color="#B9C6D3"/><stop offset="1" stop-color="#7E8E9E"/></linearGradient></defs><ellipse cx="12" cy="5" rx="6.5" ry="4.2" fill="url(#sbS)" stroke="#5B6B7B" stroke-width=".8"/><path d="M12 2.4v5.2M9.8 3.4v3.2M14.2 3.4v3.2" stroke="#41505F" stroke-width=".7"/><path d="M9.5 9.4h5l1.3 1.9v2.1H8.2v-2.1z" fill="url(#sbS)" stroke="#5B6B7B" stroke-width=".7"/><path d="M10.2 13.4h3.6c-.2 3.4.3 6.6 1.9 9.2H8.3c1.6-2.6 2.1-5.8 1.9-9.2z" fill="url(#sbS)" stroke="#5B6B7B" stroke-width=".7"/><rect x="7" y="22.6" width="10" height="2.2" rx="1" fill="url(#sbS)" stroke="#5B6B7B" stroke-width=".7"/><rect x="5" y="24.8" width="14" height="2.7" rx="1.2" fill="#C9A227" stroke="#8C6D12" stroke-width=".7"/></svg>';
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
