// ===== State =====
let student = { name: '', reg: '' };
let currentChapterIndex = null;
let currentAnswers = {}; // questionId -> selected letter
let timerInterval = null;
let timeLeftSeconds = 30 * 60;
let testSubmitted = false;

// ===== Elements =====
const screens = {
  login: document.getElementById('loginScreen'),
  chapters: document.getElementById('chapterScreen'),
  test: document.getElementById('testScreen'),
  results: document.getElementById('resultsScreen'),
};
const userBadge = document.getElementById('userBadge');
const userBadgeWrap = document.getElementById('userBadgeWrap');
const logoutBtn = document.getElementById('logoutBtn');

function showScreen(name) {
  Object.values(screens).forEach(s => s.classList.add('hidden'));
  screens[name].classList.remove('hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ===== Login =====
document.getElementById('loginForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const name = document.getElementById('studentName').value.trim();
  const reg = document.getElementById('regNumber').value.trim();
  if (!name || !reg) return;
  student = { name, reg };
  localStorage.setItem('cbt_student', JSON.stringify(student));
  userBadge.textContent = `${student.name} (${student.reg})`;
  userBadgeWrap.classList.remove('hidden');
  renderChapters();
  showScreen('chapters');
});

// ===== Logout =====
logoutBtn.addEventListener('click', () => {
  if (!confirm('Log out? Any unsaved test progress will be lost.')) return;
  clearInterval(timerInterval);
  localStorage.removeItem('cbt_student');
  student = { name: '', reg: '' };
  currentChapterIndex = null;
  currentAnswers = {};
  testSubmitted = false;
  userBadgeWrap.classList.add('hidden');
  document.getElementById('loginForm').reset();
  showScreen('login');
});

// Restore session if already logged in
(function restoreSession() {
  const saved = localStorage.getItem('cbt_student');
  if (saved) {
    try {
      student = JSON.parse(saved);
      if (student.name && student.reg) {
        userBadge.textContent = `${student.name} (${student.reg})`;
        userBadgeWrap.classList.remove('hidden');
        renderChapters();
        showScreen('chapters');
      }
    } catch (e) { /* ignore */ }
  }
})();

// ===== Chapter Selection =====
function renderChapters() {
  const grid = document.getElementById('chapterGrid');
  grid.innerHTML = '';
  CBT_DATA.forEach((ch, idx) => {
    const card = document.createElement('div');
    card.className = 'chapter-card';
    card.innerHTML = `
      <h3>${ch.title}</h3>
      <div class="meta">Time limit: 30 minutes</div>
      <span class="qcount">${ch.questions.length} questions</span>
    `;
    card.addEventListener('click', () => startTest(idx));
    grid.appendChild(card);
  });
}

document.getElementById('backToChaptersBtn').addEventListener('click', () => {
  renderChapters();
  showScreen('chapters');
});

// ===== Test =====
function startTest(chapterIndex) {
  currentChapterIndex = chapterIndex;
  currentAnswers = {};
  testSubmitted = false;
  timeLeftSeconds = 30 * 60;

  const chapter = CBT_DATA[chapterIndex];
  document.getElementById('testChapterTitle').textContent = chapter.title;

  renderQuestions(chapter);
  renderQuestionNav(chapter);
  updateProgressText(chapter);
  startTimer();
  showScreen('test');
}

// ===== Question Navigator (answered-question tracker) =====
function renderQuestionNav(chapter) {
  const nav = document.getElementById('questionNav');
  nav.innerHTML = '';
  chapter.questions.forEach((q, i) => {
    const item = document.createElement('div');
    item.className = 'nav-item';
    item.textContent = i + 1;
    item.dataset.qid = q.id;
    item.addEventListener('click', () => {
      const target = document.querySelector(`.question-card[data-qid="${q.id}"]`);
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
    nav.appendChild(item);
  });
}

function markNavAnswered(qid) {
  const item = document.querySelector(`.nav-item[data-qid="${qid}"]`);
  if (item) item.classList.add('answered');
}

function updateProgressText(chapter) {
  const answered = Object.keys(currentAnswers).length;
  const total = chapter.questions.length;
  document.getElementById('testProgress').textContent =
    `${total} questions • ${student.name} (${student.reg}) • Answered: ${answered} / ${total}`;
}

function renderQuestions(chapter) {
  const list = document.getElementById('questionList');
  list.innerHTML = '';
  chapter.questions.forEach((q, i) => {
    const qCard = document.createElement('div');
    qCard.className = 'question-card';
    qCard.dataset.qid = q.id;

    const optionsHtml = ['A', 'B', 'C', 'D'].map(letter => {
      const optText = q.options[letter] || '';
      return `
        <label class="option-row" data-letter="${letter}">
          <input type="radio" name="q_${q.id}" value="${letter}" />
          <span>${letter}. ${escapeHtml(optText)}</span>
        </label>
      `;
    }).join('');

    qCard.innerHTML = `
      <div class="qtext"><span class="qnum-badge">Q${i + 1}</span>${escapeHtml(q.question)}</div>
      <div class="options">${optionsHtml}</div>
    `;
    list.appendChild(qCard);
  });

  // Attach change listeners
  list.querySelectorAll('input[type="radio"]').forEach(input => {
    input.addEventListener('change', (e) => {
      const qid = e.target.name.replace('q_', '');
      currentAnswers[qid] = e.target.value;
      const card = e.target.closest('.question-card');
      card.querySelectorAll('.option-row').forEach(r => r.classList.remove('selected'));
      e.target.closest('.option-row').classList.add('selected');
      markNavAnswered(qid);
      updateProgressText(CBT_DATA[currentChapterIndex]);
    });
  });
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function startTimer() {
  clearInterval(timerInterval);
  updateTimerDisplay();
  timerInterval = setInterval(() => {
    timeLeftSeconds--;
    updateTimerDisplay();
    if (timeLeftSeconds <= 0) {
      clearInterval(timerInterval);
      submitTest(true);
    }
  }, 1000);
}

function updateTimerDisplay() {
  const el = document.getElementById('timerDisplay');
  const m = Math.floor(timeLeftSeconds / 60);
  const s = timeLeftSeconds % 60;
  el.textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  el.classList.toggle('warning', timeLeftSeconds <= 60);
}

document.getElementById('submitTestBtn').addEventListener('click', () => {
  if (confirm('Submit your test now?')) {
    submitTest(false);
  }
});

function submitTest(timedOut) {
  if (testSubmitted) return;
  testSubmitted = true;
  clearInterval(timerInterval);

  const chapter = CBT_DATA[currentChapterIndex];
  let correct = 0;
  const details = [];

  chapter.questions.forEach(q => {
    const selected = currentAnswers[q.id];
    const isCorrect = selected === q.answer;
    if (isCorrect) correct++;
    details.push({ q, selected, isCorrect });
  });

  showResults(chapter, correct, details, timedOut);
}

// ===== Results =====
let lastReviewDetails = [];

function showResults(chapter, correct, details, timedOut) {
  lastReviewDetails = details;
  const total = chapter.questions.length;
  const percent = total > 0 ? Math.round((correct / total) * 100) : 0;

  document.getElementById('resultSummary').innerHTML = `
    <p>${student.name} (${student.reg})</p>
    <p>${chapter.title}</p>
    <span class="score-big">${correct} / ${total}</span>
    <p>${percent}% ${timedOut ? '(Time up — auto-submitted)' : ''}</p>
  `;

  const unanswered = total - Object.keys(details.reduce((acc, d) => {
    if (d.selected) acc[d.q.id] = true;
    return acc;
  }, {})).length;

  document.getElementById('resultBreakdown').innerHTML = `
    <p>✅ Correct: ${correct}</p>
    <p>❌ Incorrect: ${total - correct - unanswered}</p>
    <p>➖ Unanswered: ${unanswered}</p>
  `;

  document.getElementById('reviewList').classList.add('hidden');
  document.getElementById('reviewList').innerHTML = '';
  document.getElementById('reviewBtn').textContent = 'Review Answers';

  showScreen('results');
}

document.getElementById('reviewBtn').addEventListener('click', () => {
  const reviewList = document.getElementById('reviewList');
  const isHidden = reviewList.classList.contains('hidden');
  if (isHidden) {
    renderReview();
    reviewList.classList.remove('hidden');
    document.getElementById('reviewBtn').textContent = 'Hide Review';
  } else {
    reviewList.classList.add('hidden');
    document.getElementById('reviewBtn').textContent = 'Review Answers';
  }
});

function renderReview() {
  const reviewList = document.getElementById('reviewList');
  reviewList.innerHTML = '';
  lastReviewDetails.forEach((d, i) => {
    const q = d.q;
    const qCard = document.createElement('div');
    qCard.className = 'question-card';

    const optionsHtml = ['A', 'B', 'C', 'D'].map(letter => {
      const optText = q.options[letter] || '';
      let cls = 'option-row';
      if (letter === q.answer) cls += ' correct-answer';
      else if (letter === d.selected && !d.isCorrect) cls += ' wrong-answer';
      return `<div class="${cls}"><span>${letter}. ${escapeHtml(optText)}</span></div>`;
    }).join('');

    qCard.innerHTML = `
      <div class="qtext"><span class="qnum-badge">Q${i + 1}</span>${escapeHtml(q.question)}</div>
      <div class="options">${optionsHtml}</div>
      <div class="muted" style="margin-top:8px;">
        ${d.selected ? `Your answer: ${d.selected}` : 'You did not answer this question'}
        — Correct answer: ${q.answer}
      </div>
    `;
    reviewList.appendChild(qCard);
  });
}
