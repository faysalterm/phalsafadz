// topic.js — منطق صفحة الموضوع

let DATA = null;
let quizState = { current: 0, score: 0, answered: false };

// ─── تحميل البيانات ──────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const id = sessionStorage.getItem('topicId');
  const meta = TOPICS_META.find(t => t.id === id);
  const data = TOPICS_DATA[id];

  if (!meta || !data) { window.location.href = 'index.html'; return; }

  DATA = { ...meta, ...data };

  document.title = meta.title;
  document.getElementById('headerTitle').textContent = meta.title;

  renderOverview(DATA);
  renderChapters(DATA);
  renderPhilosophers(DATA);
  renderConcepts(DATA);
  renderQuiz(DATA);
});

// ─── تبديل التبويبات ─────────────────────────────────────────────
function switchTab(name, btn) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('pane-' + name).classList.add('active');
}

// ─── نظرة عامة ───────────────────────────────────────────────────
function renderOverview(d) {
  document.getElementById('pane-overview').innerHTML = `
    <div class="overview-hero">
      <div class="ov-icon">${d.icon}</div>
      <div class="ov-title">${d.title}</div>
      <div class="ov-subtitle">${d.subtitle}</div>
      <div class="ov-desc">${d.description}</div>
      <div class="ov-stats">
        <div class="ov-stat"><span class="ov-stat-num">${d.stats.lessons}</span><div class="ov-stat-label">درساً</div></div>
        <div class="ov-stat"><span class="ov-stat-num">${d.stats.philosophers}</span><div class="ov-stat-label">فيلسوف</div></div>
        <div class="ov-stat"><span class="ov-stat-num">${d.stats.duration_hours}h</span><div class="ov-stat-label">مدة</div></div>
        <div class="ov-stat"><span class="ov-stat-num">${d.stats.difficulty}</span><div class="ov-stat-label">مستوى</div></div>
      </div>
    </div>
    <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:14px;padding:16px;">
      <div style="font-size:11px;color:var(--gold);font-weight:700;letter-spacing:1.2px;text-transform:uppercase;margin-bottom:12px;">📋 الفصول</div>
      ${d.chapters.map(ch => `
        <div style="display:flex;align-items:center;gap:10px;padding:9px 0;border-bottom:1px solid var(--border);cursor:pointer;"
             onclick="switchTab('chapters',document.querySelectorAll('.tab')[1])">
          <span style="font-size:18px;">${ch.icon}</span>
          <span style="font-size:13px;flex:1;">${ch.title}</span>
          <span style="font-size:10px;color:var(--muted);">${ch.lessons.length} دروس</span>
        </div>`).join('')}
    </div>`;
}

// ─── الفصول ──────────────────────────────────────────────────────
function renderChapters(d) {
  document.getElementById('pane-chapters').innerHTML = d.chapters.map(ch => `
    <div class="chapter-block" id="ch-${ch.id}">
      <div class="chapter-header" onclick="toggleChapter('${ch.id}')">
        <div class="ch-icon">${ch.icon}</div>
        <div class="ch-info">
          <div class="ch-title">${ch.title}</div>
          <div class="ch-desc">${ch.description}</div>
        </div>
        <span class="ch-count">${ch.lessons.length}</span>
        <span class="ch-toggle">▼</span>
      </div>
      <div class="lessons-list" style="display:none">
        ${ch.lessons.map((l, i) => `
          <div class="lesson-item" onclick='openLesson(${JSON.stringify(l)})'>
            <div class="lesson-dot">${i + 1}</div>
            <div class="lesson-info">
              <div class="lesson-title">${l.title}</div>
              <div class="lesson-dur">⏱ ${l.duration_min} دقيقة</div>
            </div>
            <span class="lesson-arrow">◀</span>
          </div>`).join('')}
      </div>
    </div>`).join('');
}

function toggleChapter(id) {
  const block = document.getElementById('ch-' + id);
  const list = block.querySelector('.lessons-list');
  const isOpen = block.classList.toggle('open');
  list.style.display = isOpen ? 'block' : 'none';
}

// ─── درس (Modal) ─────────────────────────────────────────────────
function openLesson(lesson) {
  document.getElementById('modalHeaderTitle').textContent = lesson.title;
  let html = `
    <div class="modal-title">${lesson.title}</div>
    <div class="modal-meta">⏱ ${lesson.duration_min} دقيقة قراءة</div>
    <div class="modal-body">${lesson.content}</div>`;

  if (lesson.quote) html += `
    <div class="quote-block">
      <div class="quote-text">"${lesson.quote.text}"</div>
      <div class="quote-author">— ${lesson.quote.author}</div>
    </div>`;

  if (lesson.example) html += `
    <div class="example-block">
      <div class="example-label">💡 مثال توضيحي</div>
      <div class="example-text"><strong>${lesson.example.title}:</strong> ${lesson.example.body}</div>
    </div>`;

  if (lesson.key_terms?.length) html += `
    <div class="terms-block">
      <div class="terms-title">🔑 مصطلحات مفتاحية</div>
      ${lesson.key_terms.map(t => `<span class="term-chip">${t}</span>`).join('')}
    </div>`;

  document.getElementById('lessonContent').innerHTML = html;
  document.getElementById('lessonModal').classList.add('open');
  document.getElementById('lessonModal').scrollTop = 0;
}

function closeLesson() {
  document.getElementById('lessonModal').classList.remove('open');
}

// ─── الفلاسفة ─────────────────────────────────────────────────────
function renderPhilosophers(d) {
  document.getElementById('pane-philosophers').innerHTML = d.key_philosophers.map(p => `
    <div class="phil-card">
      <div class="phil-avatar">${p.icon}</div>
      <div style="flex:1">
        <div class="phil-name">${p.name}</div>
        <div class="phil-dates">${p.birth < 0 ? Math.abs(p.birth)+'ق.م' : p.birth} — ${p.death < 0 ? Math.abs(p.death)+'ق.م' : p.death}</div>
        <div class="phil-contrib">${p.contribution}</div>
        <span class="phil-nation">🌍 ${p.nationality}</span>
      </div>
    </div>`).join('');
}

// ─── المفاهيم ─────────────────────────────────────────────────────
function renderConcepts(d) {
  document.getElementById('pane-concepts').innerHTML = d.key_concepts.map(c => `
    <div class="concept-card">
      <div class="concept-term">${c.term}</div>
      <div class="concept-def">${c.definition}</div>
    </div>`).join('');
}

// ─── الاختبار ─────────────────────────────────────────────────────
function renderQuiz(d) {
  quizState = { current: 0, score: 0, answered: false };
  showQuestion(d.quiz, 0);
}

function showQuestion(quiz, idx) {
  if (idx >= quiz.length) {
    document.getElementById('pane-quiz').innerHTML = `
      <div class="quiz-done">
        <div class="quiz-score">${quizState.score}/${quiz.length}</div>
        <div class="quiz-score-label">إجاباتك الصحيحة</div>
        <div style="font-size:36px;margin:16px 0">${quizState.score===quiz.length?'🏆':quizState.score>=quiz.length/2?'👍':'📖'}</div>
        <div style="font-size:13px;color:var(--text2)">${quizState.score===quiz.length?'ممتاز! أتقنت الموضوع':'استمر في الدراسة!'}</div>
        <button class="retry-btn" onclick="renderQuiz(DATA)">🔄 إعادة الاختبار</button>
      </div>`;
    return;
  }

  const q = quiz[idx];
  const pct = (idx / quiz.length * 100).toFixed(0);
  document.getElementById('pane-quiz').innerHTML = `
    <div class="quiz-header">
      <div class="quiz-title">اختبر معلوماتك</div>
      <div class="quiz-sub">سؤال ${idx+1} من ${quiz.length}</div>
    </div>
    <div class="quiz-progress"><div class="quiz-progress-fill" style="width:${pct}%"></div></div>
    <div class="question-block">
      <div class="q-num">سؤال ${idx+1}</div>
      <div class="q-text">${q.question}</div>
      <div class="options">
        ${q.options.map((opt,i) => `<button class="option" onclick="answerQ(${i},${q.correct},'${q.id}')">${opt}</button>`).join('')}
      </div>
      <div class="explanation" id="exp-${q.id}">💡 ${q.explanation}</div>
      <button class="next-btn" id="nextBtn" onclick="nextQuestion()">
        ${idx+1 < quiz.length ? 'السؤال التالي ◀' : 'انتهى الاختبار 🏁'}
      </button>
    </div>`;
  quizState.answered = false;
}

function answerQ(chosen, correct, qid) {
  if (quizState.answered) return;
  quizState.answered = true;
  if (chosen === correct) quizState.score++;
  document.querySelectorAll('.option').forEach((btn, i) => {
    btn.classList.add('disabled');
    if (i === correct) btn.classList.add('correct');
    else if (i === chosen) btn.classList.add('wrong');
  });
  document.getElementById('exp-' + qid).classList.add('show');
  document.getElementById('nextBtn').classList.add('show');
}

function nextQuestion() {
  quizState.current++;
  showQuestion(DATA.quiz, quizState.current);
}
