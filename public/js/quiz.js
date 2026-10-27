const params = new URLSearchParams(window.location.search);
const quizId = params.get('id');

document.addEventListener('DOMContentLoaded', async () => {
  const logout = document.getElementById('nav-logout');
  logout.addEventListener('click', async (e) => {
    e.preventDefault();
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/login.html';
  });

  const form = document.getElementById('quiz-form');
  const progress = document.getElementById('progress');
  const errBox = document.getElementById('error-box');
  const submitBtn = document.getElementById('submit-btn');

  const meRes = await fetch('/api/auth/me');
  if (!meRes.ok) { window.location.href = '/login.html'; return; }

  let data;
  try {
    const res = await fetch('/api/quizzes/' + encodeURIComponent(quizId));
    data = await res.json();
    if (!res.ok) throw new Error((data.errors || [])[0] || 'Quiz not found');
  } catch (err) {
    errBox.hidden = false; errBox.textContent = err.message;
    submitBtn.disabled = true;
    return;
  }

  document.getElementById('quiz-title').textContent = data.quiz.title;
  const questions = data.questions;
  const selected = {};

  function updateProgress() {
    const answered = Object.keys(selected).length;
    progress.textContent = answered + ' of ' + questions.length + ' answered';
  }

  questions.forEach((q, qi) => {
    const card = document.createElement('div');
    card.className = 'question-card';
    const h2 = document.createElement('h2');
    h2.textContent = (qi + 1) + '. ' + q.question_text;
    card.appendChild(h2);
    q.options.forEach((opt) => {
      const label = document.createElement('label');
      label.className = 'choice';
      const radio = document.createElement('input');
      radio.type = 'radio';
      radio.name = 'q_' + q.id;
      radio.value = opt.id;
      radio.style.marginRight = '10px';
      radio.addEventListener('change', () => {
        selected[q.id] = opt.id;
        card.querySelectorAll('.choice').forEach(c => c.classList.remove('selected'));
        label.classList.add('selected');
        updateProgress();
      });
      label.appendChild(radio);
      label.appendChild(document.createTextNode(opt.text));
      card.appendChild(label);
    });
    form.appendChild(card);
  });
  updateProgress();

  submitBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    errBox.hidden = true;
    try {
      const res = await fetch('/api/quizzes/' + encodeURIComponent(quizId) + '/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: selected })
      });
      const result = await res.json();
      if (!res.ok) throw new Error((result.errors || [])[0] || 'Submit failed');
      sessionStorage.setItem('lastResult', JSON.stringify({
        quiz_id: quizId,
        quiz_title: data.quiz.title,
        ...result
      }));
      window.location.href = '/results.html';
    } catch (err) {
      errBox.hidden = false;
      errBox.textContent = err.message;
    }
  });
});
