document.addEventListener('DOMContentLoaded', () => {
  const logout = document.getElementById('nav-logout');
  logout.addEventListener('click', async (e) => {
    e.preventDefault();
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/login.html';
  });

  const raw = sessionStorage.getItem('lastResult');
  if (!raw) { window.location.href = '/playbooks.html'; return; }
  const result = JSON.parse(raw);

  document.getElementById('score').textContent =
    result.score + ' / ' + result.total_questions;
  document.getElementById('pct').textContent =
    result.percentage + '% correct';

  const review = document.getElementById('review');
  result.details.forEach((d, i) => {
    const item = document.createElement('div');
    item.className = 'review-item ' + (d.is_correct ? 'correct' : 'wrong');
    const status = document.createElement('div');
    status.className = 'status';
    status.textContent = (i + 1) + '. ' + (d.is_correct ? 'CORRECT' : 'INCORRECT') + ' — ' + d.question_text;
    const note = document.createElement('div');
    note.className = 'answer-note';
    note.textContent = d.is_correct
      ? 'Your answer: ' + d.selected_text
      : 'Your answer: ' + (d.selected_text || 'No answer') + ' | Correct answer: ' + d.correct_text;
    item.append(status, note);
    review.appendChild(item);
  });

  document.getElementById('retry-btn').addEventListener('click', () => {
    sessionStorage.removeItem('lastResult');
    window.location.href = '/quiz.html?id=' + result.quiz_id;
  });
});
