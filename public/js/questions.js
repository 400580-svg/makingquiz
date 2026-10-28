// Question Tools — CSV upload with preview + confirmed import (Phase 4).
// The client parses the CSV and shows a preview; the SERVER is the real
// gatekeeper — it re-validates every row on preview AND on import.

const SAMPLE_CSV =
  'question,choice_1,choice_2,choice_3,choice_4,correct_answer,quiz_title\n' +
  '"How many points is a touchdown worth (before the extra point)?",6,7,3,5,1,"Football Basics: Points & Penalties"\n' +
  '"Which number did Peyton Manning wear?",18,16,12,4,1,"Jersey Numbers: Guess the Number"';

document.addEventListener('DOMContentLoaded', async () => {
  document.getElementById('nav-logout').addEventListener('click', async (e) => {
    e.preventDefault();
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/login.html';
  });

  const errBox = document.getElementById('error-box');
  const okBox = document.getElementById('success-box');
  function showError(msg) { errBox.hidden = false; errBox.textContent = msg; okBox.hidden = true; }
  function showOk(msg) { okBox.hidden = false; okBox.textContent = msg; errBox.hidden = true; }

  // --- Only teachers/admins may use this page (server enforces it too) ---
  const meRes = await fetch('/api/auth/me');
  if (!meRes.ok) { window.location.href = '/login.html'; return; }
  const me = await meRes.json();
  if (me.role !== 'teacher' && me.role !== 'admin') {
    document.querySelector('.page').innerHTML = '<h1>Not allowed</h1><p class="auth-subtitle">Only teachers and admins can use Question Tools.</p>';
    return;
  }

  document.getElementById('sample-link').addEventListener('click', (e) => {
    e.preventDefault();
    const blob = new Blob([SAMPLE_CSV], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'sample-questions.csv';
    a.click();
    URL.revokeObjectURL(a.href);
  });

  // --- Simple CSV parser: handles quoted fields, commas inside quotes, "" escapes ---
  function parseCsv(text) {
    const rows = [];
    let row = [], field = '', inQuotes = false;
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      if (inQuotes) {
        if (ch === '"') {
          if (text[i + 1] === '"') { field += '"'; i++; }
          else inQuotes = false;
        } else field += ch;
      } else if (ch === '"') inQuotes = true;
      else if (ch === ',') { row.push(field); field = ''; }
      else if (ch === '\n') { row.push(field); rows.push(row); row = []; field = ''; }
      else if (ch !== '\r') field += ch;
    }
    if (field !== '' || row.length) { row.push(field); rows.push(row); }
    return rows;
  }

  const fileInput = document.getElementById('csv-file');
  const checkBtn = document.getElementById('check-btn');
  const importBtn = document.getElementById('import-btn');
  let pendingValid = [];

  fileInput.addEventListener('change', () => {
    checkBtn.disabled = !fileInput.files.length;
    document.getElementById('preview-section').hidden = true;
    importBtn.disabled = true;
    pendingValid = [];
  });

  checkBtn.addEventListener('click', async () => {
    hideBoxes();
    const file = fileInput.files[0];
    if (!file) return;
    const text = await file.text();
    let rows = parseCsv(text);
    // Drop a header row if present (first column contains "question")
    if (rows.length && String(rows[0][0] || '').trim().toLowerCase().startsWith('question')) rows = rows.slice(1);
    if (!rows.length) return showError('This file has no question rows in it.');

    const payload = rows.map(r => ({
      question_text: r[0] || '',
      choices: [r[1] || '', r[2] || '', r[3] || '', r[4] || ''],
      correct_index: r[5] || '',
      quiz_title: r[6] || ''
    }));

    const res = await fetch('/api/questions/import/preview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rows: payload })
    });
    const data = await res.json();
    if (!res.ok) return showError(((data.errors) || [])[0] || 'Could not check this file.');

    renderPreview(data, payload.length);
  });

  function renderPreview(data, total) {
    const section = document.getElementById('preview-section');
    section.hidden = false;
    document.getElementById('preview-summary').innerHTML =
      '<b>' + data.valid_count + '</b> good row' + (data.valid_count === 1 ? '' : 's') +
      ' ready to import, <b>' + data.invalid_count + '</b> bad row' + (data.invalid_count === 1 ? '' : 's') +
      ' that will be skipped' + (total !== data.valid_count + data.invalid_count ? '.' : '.');

    const body = document.getElementById('preview-body');
    body.innerHTML = '';
    const all = []
      .concat(data.valid.map(v => Object.assign(v, { ok: true })))
      .concat(data.invalid.map(v => Object.assign(v, { ok: false })))
      .sort((a, b) => a.row - b.row);

    for (const r of all) {
      const tr = document.createElement('tr');
      tr.className = r.ok ? 'row-ok' : 'row-bad';
      const choices = (r.choices || []).map(escapeHtml).join(' &middot; ');
      const status = r.ok
        ? '<span class="ok-text">&#10003; OK</span>'
        : '<span class="bad-text">&#10007; ' + escapeHtml((r.errors || []).join(' ')) + '</span>';
      tr.innerHTML =
        '<td>' + r.row + '</td>' +
        '<td class="status-cell">' + status + '</td>' +
        '<td>' + escapeHtml(r.question_text) + '</td>' +
        '<td class="choices-cell">' + choices + '</td>' +
        '<td>#' + escapeHtml(String(r.correct_index)) + '</td>' +
        '<td>' + escapeHtml(r.quiz_title) + '</td>';
      body.appendChild(tr);
    }

    pendingValid = data.valid.map(v => ({
      question_text: v.question_text,
      choices: v.choices,
      correct_index: v.correct_index,
      quiz_title: v.quiz_title
    }));
    importBtn.disabled = pendingValid.length === 0;
    if (data.valid_count) showOk('Preview ready — ' + data.valid_count + ' row(s) will be imported when you click the button below.');
  }

  importBtn.addEventListener('click', async () => {
    hideBoxes();
    importBtn.disabled = true;
    importBtn.textContent = 'Importing…';
    const res = await fetch('/api/questions/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rows: pendingValid })
    });
    const data = await res.json();
    importBtn.textContent = 'Import the good rows';
    if (!res.ok) return showError(((data.errors) || [])[0] || 'Import failed — nothing was saved.');
    showOk('Imported ' + data.imported + ' question(s). They are live in their quizzes now.');
    document.getElementById('preview-section').hidden = true;
    fileInput.value = '';
    checkBtn.disabled = true;
    pendingValid = [];
  });

  function hideBoxes() { errBox.hidden = true; okBox.hidden = true; }

  function escapeHtml(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[c]);
  }
});