// app.js — منطق الصفحة الرئيسية

document.addEventListener('DOMContentLoaded', () => {
  renderCards();
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });
});

// ─── رسم البطاقات ────────────────────────────────────────────────
function renderCards() {
  const container = document.getElementById('topicCards');
  container.innerHTML = TOPICS_META.map(t => {
    const hasData = !!TOPICS_DATA[t.id];
    const badge =
      t.badge === 'new'  ? `<span class="card-badge badge-new">جديد</span>` :
      t.badge === 'hot'  ? `<span class="card-badge badge-hot">شائع</span>` :
      t.badge === 'soon' ? `<span class="card-badge badge-soon">قريباً</span>` : '';
    return `
      <div class="topic-card ${hasData ? '' : 'locked'}"
           onclick="${hasData ? `openTopic('${t.id}')` : ''}">
        <div class="card-icon icon-${t.color}">${t.icon}</div>
        <div class="card-body">
          <div class="card-title">${t.title}</div>
          <div class="card-desc">${t.subtitle}</div>
        </div>
        <div class="card-right">
          ${badge}
          <span class="card-arrow">${hasData ? '◀' : '🔒'}</span>
        </div>
      </div>`;
  }).join('');
}

// ─── فتح موضوع ───────────────────────────────────────────────────
function openTopic(id) {
  sessionStorage.setItem('topicId', id);
  window.location.href = 'topic.html';
}

// ─── البحث ───────────────────────────────────────────────────────
function openSearch() {
  document.getElementById('searchOverlay').classList.add('open');
  setTimeout(() => document.getElementById('searchInput').focus(), 100);
}
function overlayClick(e) {
  if (e.target === document.getElementById('searchOverlay')) closeSearch();
}
function closeSearch() {
  document.getElementById('searchOverlay').classList.remove('open');
  document.getElementById('searchInput').value = '';
  document.getElementById('searchResults').innerHTML = '';
}
function doSearch(q) {
  const results = document.getElementById('searchResults');
  if (!q.trim()) { results.innerHTML = ''; return; }
  const found = TOPICS_META.filter(t => t.title.includes(q) || t.subtitle.includes(q));
  results.innerHTML = found.length
    ? found.map(t => {
        const hasData = !!TOPICS_DATA[t.id];
        return `<div class="search-result-item" onclick="${hasData ? `closeSearch();openTopic('${t.id}')` : ''}">
          <span>${t.icon}</span><span style="flex:1">${t.title}</span>
          ${!hasData ? '<span style="color:var(--muted);font-size:11px">قريباً</span>' : ''}
        </div>`;
      }).join('')
    : `<div style="text-align:center;color:var(--muted);padding:20px;font-size:13px">لا نتائج</div>`;
}
document.addEventListener('keydown', e => { if(e.key==='Escape') closeSearch(); });
