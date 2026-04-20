/* ============================================================
   MindTrack Wellness — app.js  (fully revised)
   ============================================================ */

// ── Quotes ──────────────────────────────────────────────────
const quotes = [
    { text: "Love your neighbor as yourself.", author: "Mark 12:31" },
    { text: "Let your light shine before others.", author: "Matthew 5:16" },
    { text: "Faith is the substance of things hoped for, the evidence of things not seen.", author: "Hebrews 11:1" },
    { text: "Cast all your anxiety on Him because He cares for you.", author: "1 Peter 5:7" },
    { text: "For I know the plans I have for you, plans to prosper you and not to harm you.", author: "Jeremiah 29:11" },
    { text: "Come to me, all you who are weary and burdened, and I will give you rest.", author: "Matthew 11:28" },
    { text: "You are capable of amazing things.", author: "Unknown" },
    { text: "Every day is a fresh start.", author: "Unknown" },
    { text: "Your feelings are valid and important.", author: "Unknown" },
    { text: "Progress, not perfection.", author: "Unknown" },
    { text: "You are stronger than you think.", author: "Unknown" },
    { text: "Small steps lead to big changes.", author: "Unknown" },
    { text: "It's okay to not be okay.", author: "Unknown" },
    { text: "You deserve peace and happiness.", author: "Unknown" },
    { text: "One day at a time.", author: "Unknown" },
    { text: "Your mental health matters.", author: "Unknown" },
    { text: "Peace comes from within. Do not seek it without.", author: "Buddha" },
    { text: "The mind is everything. What you think you become.", author: "Buddha" },
    { text: "Every morning we are born again. What we do today matters most.", author: "Buddha" },
    { text: "If you want to go far, go together.", author: "African Proverb" },
    { text: "However long the night, the dawn will break.", author: "African Proverb" },
    { text: "Fall seven times, stand up eight.", author: "Japanese Proverb" },
    { text: "A journey of a thousand miles begins with a single step.", author: "Lao Tzu" },
    { text: "The best time to plant a tree was 20 years ago. The second best time is now.", author: "Chinese Proverb" },
    { text: "We do not inherit the earth from our ancestors; we borrow it from our children.", author: "Native American Proverb" },
    { text: "The wound is the place where the Light enters you.", author: "Rumi" },
    { text: "Let yourself be silently drawn by the strange pull of what you really love.", author: "Rumi" },
    { text: "Yesterday I was clever, so I wanted to change the world. Today I am wise, so I am changing myself.", author: "Rumi" },
    { text: "They tried to bury us. They didn't know we were seeds.", author: "Mexican Proverb" },
    { text: "In a gentle way, you can shake the world.", author: "Mahatma Gandhi" },
    { text: "Be the change you wish to see in the world.", author: "Mahatma Gandhi" },
    { text: "What lies within us is far greater than what lies behind or before us.", author: "Ralph Waldo Emerson" },
    { text: "The only way out is through.", author: "Robert Frost" },
];

// ── State ────────────────────────────────────────────────────
let currentQuoteIndex = 0;
let quoteRotationInterval = null;

let settings = {
    theme: 'dark',
    soundEnabled: false,
    ambientScene: 'rain',
    volume: 0.4,
};

let moodChart = null;
let timelineChart = null;

// ── Web Audio context (lazy) ─────────────────────────────────
let audioCtx = null;
let masterGain = null;
// Running ambient oscillators/sources for each scene
let ambientNodes = [];
let ambientRunning = false;

// ── Bootstrap ────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    loadSettings();
    initializeApp();
    renderHistory();
    updateStats();
    setRandomQuote();
    initQuoteRotation();
    initSettings();
    initDragDrop();
});

// ── Specific-Date Picker Helper ───────────────────────────────
function handleSpecificPicker(selectId, dayId, weekId, monthId, yearId) {
    const val = document.getElementById(selectId)?.value;
    const show = (id, visible) => {
        const el = document.getElementById(id);
        if (el) el.style.display = visible ? '' : 'none';
    };
    show(dayId,   val === 'specific-day');
    show(weekId,  val === 'specific-week');
    show(monthId, val === 'specific-month');
    show(yearId,  val === 'specific-year');
}

// Helper: get date range from specific picker values for a given prefix
function getSpecificRange(prefix) {
    // prefix e.g. 'timeline', 'dist', 'history' (maps to element IDs)
    const dayEl   = document.getElementById(`${prefix}-specific-day`);
    const weekEl  = document.getElementById(`${prefix}-specific-week`);
    const monthEl = document.getElementById(`${prefix}-specific-month`);
    const yearEl  = document.getElementById(`${prefix}-specific-year`);

    if (dayEl && dayEl.value) {
        const d = new Date(dayEl.value + 'T00:00:00');
        const start = new Date(d); start.setHours(0,0,0,0);
        const end   = new Date(d); end.setHours(23,59,59,999);
        return { start, end, type: 'day' };
    }
    if (weekEl && weekEl.value) {
        // value format: "2024-W22"
        const [yr, wk] = weekEl.value.split('-W').map(Number);
        const jan4 = new Date(yr, 0, 4);
        const startOfWeek1 = new Date(jan4);
        startOfWeek1.setDate(jan4.getDate() - ((jan4.getDay() + 6) % 7));
        const start = new Date(startOfWeek1);
        start.setDate(startOfWeek1.getDate() + (wk - 1) * 7);
        start.setHours(0,0,0,0);
        const end = new Date(start);
        end.setDate(start.getDate() + 6);
        end.setHours(23,59,59,999);
        return { start, end, type: 'week' };
    }
    if (monthEl && monthEl.value) {
        const [yr, mo] = monthEl.value.split('-').map(Number);
        const start = new Date(yr, mo - 1, 1, 0, 0, 0, 0);
        const end   = new Date(yr, mo, 0, 23, 59, 59, 999);
        return { start, end, type: 'month' };
    }
    if (yearEl && yearEl.value) {
        const yr = parseInt(yearEl.value);
        if (!isNaN(yr)) {
            const start = new Date(yr, 0, 1, 0, 0, 0, 0);
            const end   = new Date(yr, 11, 31, 23, 59, 59, 999);
            return { start, end, type: 'year' };
        }
    }
    return null;
}


function initializeApp() {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', function () {
            switchView(this.dataset.view);
            document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
            this.classList.add('active');
        });
    });

    document.querySelectorAll('.mobile-nav-item').forEach(item => {
        item.addEventListener('click', function () {
            switchView(this.dataset.view);
            document.querySelectorAll('.mobile-nav-item').forEach(n => n.classList.remove('active'));
            this.classList.add('active');
        });
    });

    const searchInput = document.getElementById('search-input');
    if (searchInput) searchInput.addEventListener('input', handleSearch);

    const filterMood   = document.getElementById('filter-mood');
    const filterPeriod = document.getElementById('filter-period');
    if (filterMood)   filterMood.addEventListener('change', renderHistory);
    if (filterPeriod) filterPeriod.addEventListener('change', () => {
        handleSpecificPicker('filter-period', 'history-specific-day', 'history-specific-week', 'history-specific-month', 'history-specific-year');
        renderHistory();
    });
    ['history-specific-day','history-specific-week','history-specific-month','history-specific-year'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('change', renderHistory);
    });

    const timelineMode = document.getElementById('timeline-mode');
    if (timelineMode) timelineMode.addEventListener('change', () => {
        handleSpecificPicker('timeline-mode', 'timeline-specific-day', 'timeline-specific-week', 'timeline-specific-month', 'timeline-specific-year');
        updateTimelineChart();
    });
    ['timeline-specific-day','timeline-specific-week','timeline-specific-month','timeline-specific-year'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('change', updateTimelineChart);
    });

    const distMode = document.getElementById('dist-mode');
    if (distMode) distMode.addEventListener('change', () => {
        handleSpecificPicker('dist-mode', 'dist-specific-day', 'dist-specific-week', 'dist-specific-month', 'dist-specific-year');
        updateChart();
    });
    ['dist-specific-day','dist-specific-week','dist-specific-month','dist-specific-year'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('change', updateChart);
    });

    // Minimize buttons
    document.querySelectorAll('.minimize-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            const card = this.closest('.trend-card');
            card.classList.toggle('minimized');
            this.textContent = card.classList.contains('minimized') ? '+' : '−';
        });
    });

    // Mood form
    const moodForm = document.getElementById('mood-form');
    if (moodForm) {
        moodForm.addEventListener('submit', handleMoodSubmit);
    }
}

function switchView(viewId) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    const target = document.getElementById(viewId);
    if (target) target.classList.add('active');

    if (viewId === 'trends-view') {
        setTimeout(() => { updateChart(); updateTimelineChart(); }, 120);
    } else if (viewId === 'history-view') {
        renderHistory();
    }
}

// ── Quotes ───────────────────────────────────────────────────
function setRandomQuote() {
    const qt = document.getElementById('quote-text');
    const qa = document.getElementById('quote-author');
    if (!qt || !qa) return;
    const q = quotes[currentQuoteIndex];
    qt.textContent = `"${q.text}"`;
    qa.textContent = `— ${q.author}`;
}
function nextQuote() { currentQuoteIndex = (currentQuoteIndex + 1) % quotes.length; setRandomQuote(); }
function prevQuote() { currentQuoteIndex = (currentQuoteIndex - 1 + quotes.length) % quotes.length; setRandomQuote(); }

function initQuoteRotation() {
    const prev = document.getElementById('prev-quote');
    const next = document.getElementById('next-quote');
    if (prev) prev.addEventListener('click', prevQuote);
    if (next) next.addEventListener('click', nextQuote);
    quoteRotationInterval = setInterval(nextQuote, 15000);
}

// ── Mood Form ────────────────────────────────────────────────
function handleMoodSubmit(event) {
    event.preventDefault();
    const selectedMood = document.querySelector('input[name="mood"]:checked');
    if (!selectedMood) return;

    const timestamp = new Date();
    const entry = {
        mood: selectedMood.value,
        note: document.getElementById('mood-note').value,
        date: timestamp.toLocaleDateString(),
        fullDate: timestamp.toISOString(),
        hour: timestamp.getHours(),
    };

    saveEntry(entry);
    playSuccessSound();

    renderHistory();
    updateStats();
    updateChart();
    updateTimelineChart();

    document.getElementById('mood-note').value = '';

    const submitBtn = event.target.querySelector('button[type="submit"]');
    const orig = submitBtn.textContent;
    submitBtn.textContent = '✓ Logged!';
    submitBtn.style.backgroundColor = '#00D9A3';
    setTimeout(() => { submitBtn.textContent = orig; submitBtn.style.backgroundColor = ''; }, 2000);

    setTimeout(() => {
        switchView('history-view');
        document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
        const hn = document.querySelector('.nav-item[data-view="history-view"]');
        if (hn) hn.classList.add('active');
        document.querySelectorAll('.mobile-nav-item').forEach(n => n.classList.remove('active'));
        const mhn = document.querySelector('.mobile-nav-item[data-view="history-view"]');
        if (mhn) mhn.classList.add('active');
    }, 2500);
}

function saveEntry(entry) {
    const history = JSON.parse(localStorage.getItem('moodHistory')) || [];
    history.push(entry);
    localStorage.setItem('moodHistory', JSON.stringify(history));
}

// ── History ──────────────────────────────────────────────────
function renderHistory() {
    const historyList = document.getElementById('mood-history-list');
    if (!historyList) return;

    let history = JSON.parse(localStorage.getItem('moodHistory')) || [];
    const filterMood   = document.getElementById('filter-mood');
    const filterPeriod = document.getElementById('filter-period');

    if (filterMood && filterMood.value !== 'all') {
        history = history.filter(e => e.mood === filterMood.value);
    }
    if (filterPeriod && filterPeriod.value !== 'all') {
        const now = new Date();
        const pval = filterPeriod.value;
        if (pval.startsWith('specific-')) {
            const range = getSpecificRange('history');
            if (range) {
                history = history.filter(e => {
                    const d = new Date(e.fullDate || e.date);
                    return d >= range.start && d <= range.end;
                });
            }
        } else {
            history = history.filter(e => {
                const d = new Date(e.fullDate || e.date);
                const diffH = (now - d) / 36e5;
                const diffD = diffH / 24;
                switch (pval) {
                    case 'hour':  return diffH <= 1;
                    case 'week':  return diffD <= 7;
                    case 'month': return diffD <= 30;
                    case 'year':  return diffD <= 365;
                    default:      return true;
                }
            });
        }
    }

    historyList.innerHTML = '';
    if (history.length === 0) {
        historyList.innerHTML = '<p style="text-align:center;color:var(--text-dim);padding:2rem;">No entries found. Start logging your mood!</p>';
        generateWellnessTips([]);
        return;
    }

    const fullHistory = JSON.parse(localStorage.getItem('moodHistory')) || [];

    history.slice().reverse().forEach(entry => {
        const origIdx = fullHistory.findIndex(e =>
            e.fullDate === entry.fullDate && e.mood === entry.mood && e.note === entry.note
        );
        const card = document.createElement('div');
        card.className = 'mood-card';
        card.innerHTML = `
            <div class="card-header">
                <span class="card-mood">${entry.mood}</span>
                <span class="card-date">${entry.date}</span>
            </div>
            <p class="card-note" contenteditable="true" id="note-${origIdx}">${entry.note || 'No notes added'}</p>
            <div class="card-actions">
                <button class="update-btn" onclick="focusNote(${origIdx})">Edit</button>
                <button class="save-btn" onclick="updateNote(${origIdx})" style="display:none;" id="save-${origIdx}">Save Changes</button>
            </div>
        `;
        historyList.appendChild(card);
    });

    generateWellnessTips(history);
}

function focusNote(index) {
    const note = document.getElementById(`note-${index}`);
    const save = document.getElementById(`save-${index}`);
    if (note && save) { note.focus(); save.style.display = 'inline-block'; }
}

function updateNote(index) {
    const history = JSON.parse(localStorage.getItem('moodHistory')) || [];
    const note = document.getElementById(`note-${index}`);
    const save = document.getElementById(`save-${index}`);
    if (!note || !save) return;
    history[index].note = note.innerText;
    localStorage.setItem('moodHistory', JSON.stringify(history));
    const orig = save.innerText;
    save.innerText = 'Updated! ✨';
    save.style.background = '#00D9A3';
    setTimeout(() => { save.innerText = orig; save.style.background = ''; save.style.display = 'none'; }, 1500);
}

function handleSearch() {
    const term = (document.getElementById('search-input').value || '').toLowerCase();
    document.querySelectorAll('.mood-card').forEach(card => {
        const note = card.querySelector('.card-note').textContent.toLowerCase();
        const date = card.querySelector('.card-date').textContent.toLowerCase();
        card.style.display = (note.includes(term) || date.includes(term)) ? '' : 'none';
    });
}

// ── Stats ────────────────────────────────────────────────────
function updateStats() {
    const history = JSON.parse(localStorage.getItem('moodHistory')) || [];
    const totalEl = document.getElementById('total-logs');
    if (totalEl) totalEl.textContent = history.length;
    const pf = document.getElementById('progress-fill');
    if (pf) pf.style.width = ((history.length % 30) / 30 * 100) + '%';
    updateStreak(history);
    updateAverageMood(history);
}

function updateStreak(history) {
    if (!history || history.length === 0) return;
    history.sort((a, b) => new Date(b.fullDate || b.date) - new Date(a.fullDate || a.date));
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const uniqueDates = new Set(history.map(e => {
        const d = new Date(e.fullDate || e.date); d.setHours(0,0,0,0); return d.getTime();
    }));
    const sorted = Array.from(uniqueDates).sort((a, b) => b - a);
    let streak = 0;
    for (const dt of sorted) {
        if (Math.floor((today - dt) / 864e5) === streak) streak++; else break;
    }
    const el = document.querySelector('.streak-text');
    if (el) el.textContent = `${streak}-day streak`;
}

function updateAverageMood(history) {
    if (!history || history.length === 0) return;
    const now = new Date();
    const recent = history.filter(e => new Date(e.fullDate || e.date) >= new Date(now - 7 * 864e5));
    if (recent.length === 0) return;
    const vals = { '😔':1, '😐':2, '🙂':3, '😀':4, '🤩':5 };
    const emojis = ['😔','😐','🙂','😀','🤩'];
    const avg = recent.reduce((s, e) => s + (vals[e.mood] || 3), 0) / recent.length;
    const el = document.getElementById('avg-mood-emoji');
    if (el) el.textContent = emojis[Math.round(avg) - 1];
}

// ── Charts ───────────────────────────────────────────────────
function isDark() { return !document.body.classList.contains('light-mode'); }
function chartTextColor() { return isDark() ? '#8899BB' : '#5060A0'; }
function chartGridColor() { return isDark() ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)'; }

function updateChart() {
    const history = JSON.parse(localStorage.getItem('moodHistory')) || [];
    const ctx = document.getElementById('moodChart');
    if (!ctx) return;

    const distMode = document.getElementById('dist-mode');
    const period = distMode ? distMode.value : 'all';
    const now = new Date();

    let filtered;

    if (period.startsWith('specific-')) {
        const range = getSpecificRange('dist');
        if (range) {
            filtered = history.filter(e => {
                const d = new Date(e.fullDate || e.date);
                return d >= range.start && d <= range.end;
            });
        } else {
            filtered = history; // no picker value set yet
        }
    } else {
        filtered = history.filter(e => {
            const d = new Date(e.fullDate || e.date);
            const diffD = (now - d) / 864e5;
            if (period === 'hourly') return (now - d) / 36e5 <= 24;
            if (period === 'week')   return diffD <= 7;
            if (period === 'month')  return diffD <= getDaysInCurrentMonth();
            if (period === 'year')   return d.getFullYear() === now.getFullYear();
            return true;
        });
    }

    const counts = { '😔':0, '😐':0, '🙂':0, '😀':0, '🤩':0 };
    filtered.forEach(e => { if (counts[e.mood] !== undefined) counts[e.mood]++; });

    if (moodChart) moodChart.destroy();

    moodChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['😔 Sad','😐 Neutral','🙂 Good','😀 Happy','🤩 Excited'],
            datasets: [{
                label: 'Mood Count',
                data: [counts['😔'], counts['😐'], counts['🙂'], counts['😀'], counts['🤩']],
                backgroundColor: ['#FF6B6B','#FFA500','#FFD93D','#00D9A3','#00FFC8'],
                borderRadius: 10,
                borderSkipped: false,
            }],
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, ticks: { stepSize: 1, color: chartTextColor() }, grid: { color: chartGridColor() } },
                x: { ticks: { color: chartTextColor() }, grid: { display: false } },
            },
        },
    });
}

// Real-time days-in-month helper
function getDaysInCurrentMonth() {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
}

function updateTimelineChart() {
    const history = JSON.parse(localStorage.getItem('moodHistory')) || [];
    const ctx = document.getElementById('timelineChart');
    if (!ctx) return;

    const modeSelect = document.getElementById('timeline-mode');
    const mode = modeSelect ? modeSelect.value : 'daily';
    const vals = { '😔':1, '😐':2, '🙂':3, '😀':4, '🤩':5 };

    let labels = [], data = [];
    const now = new Date();

    // Handle specific-date picker modes
    if (mode.startsWith('specific-')) {
        const range = getSpecificRange('timeline');
        if (!range) { if (timelineChart) timelineChart.destroy(); timelineChart = null; return; }
        const filtered = history.filter(e => {
            const d = new Date(e.fullDate || e.date);
            return d >= range.start && d <= range.end;
        });
        if (range.type === 'day') {
            // hourly breakdown for the selected day
            const sums = new Array(24).fill(0), cnts = new Array(24).fill(0);
            filtered.forEach(e => {
                const d = new Date(e.fullDate || e.date);
                sums[d.getHours()] += vals[e.mood] || 3;
                cnts[d.getHours()]++;
            });
            labels = Array.from({length:24}, (_, i) => { const h = i%12||12; return `${h}${i<12?'am':'pm'}`; });
            data = sums.map((s,i) => cnts[i] > 0 ? +(s/cnts[i]).toFixed(2) : null);
        } else if (range.type === 'week') {
            // daily breakdown for the selected week
            const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
            const sums = new Array(7).fill(0), cnts = new Array(7).fill(0);
            filtered.forEach(e => {
                const d = new Date(e.fullDate || e.date);
                sums[d.getDay()] += vals[e.mood] || 3;
                cnts[d.getDay()]++;
            });
            labels = days;
            data = sums.map((s,i) => cnts[i] > 0 ? +(s/cnts[i]).toFixed(2) : null);
        } else if (range.type === 'month') {
            // daily breakdown for selected month
            const daysInMonth = new Date(range.start.getFullYear(), range.start.getMonth()+1, 0).getDate();
            const sums = new Array(daysInMonth).fill(0), cnts = new Array(daysInMonth).fill(0);
            filtered.forEach(e => {
                const d = new Date(e.fullDate || e.date);
                const day = d.getDate() - 1;
                sums[day] += vals[e.mood] || 3;
                cnts[day]++;
            });
            labels = Array.from({length:daysInMonth}, (_, i) => String(i+1));
            data = sums.map((s,i) => cnts[i] > 0 ? +(s/cnts[i]).toFixed(2) : null);
        } else if (range.type === 'year') {
            // monthly breakdown for selected year
            const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
            const sums = new Array(12).fill(0), cnts = new Array(12).fill(0);
            filtered.forEach(e => {
                const d = new Date(e.fullDate || e.date);
                sums[d.getMonth()] += vals[e.mood] || 3;
                cnts[d.getMonth()]++;
            });
            labels = months;
            data = sums.map((s,i) => cnts[i] > 0 ? +(s/cnts[i]).toFixed(2) : null);
        }
    } else if (mode === 'hourly') {
        // Last 24 hours — x-axis: 12am–11pm
        const sums  = new Array(24).fill(0);
        const cnts  = new Array(24).fill(0);
        const cutoff = new Date(now - 24 * 36e5);
        history.forEach(e => {
            const d = new Date(e.fullDate || e.date);
            if (d >= cutoff) { sums[d.getHours()] += vals[e.mood] || 3; cnts[d.getHours()]++; }
        });
        labels = Array.from({ length:24 }, (_, i) => {
            const h = i % 12 || 12;
            return `${h}${i < 12 ? 'am' : 'pm'}`;
        });
        data = sums.map((s, i) => cnts[i] > 0 ? +(s / cnts[i]).toFixed(2) : null);

    } else if (mode === 'daily') {
        // This week — x-axis: Sun–Sat
        const sums = new Array(7).fill(0), cnts = new Array(7).fill(0);
        const weekAgo = new Date(now - 7 * 864e5);
        history.forEach(e => {
            const d = new Date(e.fullDate || e.date);
            if (d >= weekAgo) { sums[d.getDay()] += vals[e.mood] || 3; cnts[d.getDay()]++; }
        });
        labels = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
        data = sums.map((s, i) => cnts[i] > 0 ? +(s / cnts[i]).toFixed(2) : null);

    } else if (mode === 'weekly') {
        // Last 4 weeks
        const sums = new Array(4).fill(0), cnts = new Array(4).fill(0);
        history.forEach(e => {
            const d = new Date(e.fullDate || e.date);
            const wk = Math.floor((now - d) / (7 * 864e5));
            if (wk >= 0 && wk < 4) { sums[wk] += vals[e.mood] || 3; cnts[wk]++; }
        });
        labels = ['This Week','1 Wk Ago','2 Wks Ago','3 Wks Ago'];
        data = sums.map((s, i) => cnts[i] > 0 ? +(s / cnts[i]).toFixed(2) : null);

    } else if (mode === 'monthly') {
        // This calendar year — x-axis: Jan–Dec
        const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        const sums = new Array(12).fill(0), cnts = new Array(12).fill(0);
        history.forEach(e => {
            const d = new Date(e.fullDate || e.date);
            if (d.getFullYear() === now.getFullYear()) {
                sums[d.getMonth()] += vals[e.mood] || 3;
                cnts[d.getMonth()]++;
            }
        });
        labels = months;
        data = sums.map((s, i) => cnts[i] > 0 ? +(s / cnts[i]).toFixed(2) : null);

    } else if (mode === 'yearly') {
        // All years present in data
        const yearMap = {};
        history.forEach(e => {
            const yr = new Date(e.fullDate || e.date).getFullYear();
            if (!yearMap[yr]) yearMap[yr] = { sum: 0, cnt: 0 };
            yearMap[yr].sum += vals[e.mood] || 3;
            yearMap[yr].cnt++;
        });
        const sortedYears = Object.keys(yearMap).sort();
        labels = sortedYears;
        data = sortedYears.map(yr => +(yearMap[yr].sum / yearMap[yr].cnt).toFixed(2));
    }

    if (timelineChart) timelineChart.destroy();

    const accentColor = isDark() ? '#00FFC8' : '#0066FF';
    const fillColor   = isDark() ? 'rgba(0,255,200,0.12)' : 'rgba(0,102,255,0.1)';

    timelineChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [{
                label: 'Avg Mood',
                data,
                borderColor: accentColor,
                backgroundColor: fillColor,
                borderWidth: 2.5,
                pointBackgroundColor: accentColor,
                pointRadius: 5,
                pointHoverRadius: 7,
                tension: 0.4,
                fill: true,
                spanGaps: true,
            }],
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: ctx => {
                            const v = ctx.parsed.y;
                            const emojis = ['','😔','😐','🙂','😀','🤩'];
                            return ` Avg: ${v} ${emojis[Math.round(v)] || ''}`;
                        },
                    },
                },
            },
            scales: {
                y: {
                    min: 1, max: 5,
                    ticks: {
                        stepSize: 1,
                        color: chartTextColor(),
                        callback: v => ['','😔','😐','🙂','😀','🤩'][v] || v,
                    },
                    grid: { color: chartGridColor() },
                },
                x: {
                    ticks: { color: chartTextColor() },
                    grid:  { color: chartGridColor() },
                },
            },
        },
    });
}

// ── Wellness Tips ─────────────────────────────────────────────
const wellnessTipLibrary = {
    low: [
        { icon:'🧘', title:'Try a 5-minute breathing exercise', text:'Box breathing (inhale 4s, hold 4s, exhale 4s, hold 4s) activates your parasympathetic nervous system and can quickly reduce feelings of stress or sadness.', category:'Mindfulness' },
        { icon:'🚶', title:'Take a gentle walk outside', text:'Even 10 minutes of walking in natural light boosts serotonin, improves mood, and breaks the cycle of rumination.', category:'Movement' },
        { icon:'📓', title:'Journal your feelings', text:'Writing three things you are grateful for, however small, redirects attention toward positive experiences and builds emotional resilience over time.', category:'Reflection' },
        { icon:'💧', title:'Hydrate and nourish yourself', text:'Low mood can sometimes be amplified by dehydration or low blood sugar. Drink a glass of water and have a healthy snack.', category:'Self-care' },
        { icon:'📱', title:'Reach out to someone you trust', text:'Connection is one of the most powerful mood regulators. Send a short message to a friend or family member — even just to say hello.', category:'Connection' },
    ],
    neutral: [
        { icon:'🎯', title:'Set a micro-goal for today', text:'Choose one small, achievable task and complete it. The dopamine hit from finishing something — even minor — lifts your sense of agency and motivation.', category:'Productivity' },
        { icon:'🎵', title:'Try music therapy', text:'Curate a playlist matched to the mood you want to cultivate. Upbeat tempo (120+ BPM) activates the brain\'s reward system and increases energy.', category:'Creativity' },
        { icon:'🌿', title:'Spend 15 minutes in nature', text:'Research shows that "green time" lowers cortisol levels and improves attention. A park bench counts.', category:'Mindfulness' },
        { icon:'📚', title:'Read something inspiring', text:'Even 6 minutes of reading reduces muscle tension and heart rate by up to 68%, according to stress research.', category:'Learning' },
    ],
    high: [
        { icon:'⚡', title:'Ride the wave — channel this energy', text:'High-energy moods are ideal for tackling creative projects, having meaningful conversations, or starting something you\'ve been putting off.', category:'Productivity' },
        { icon:'🏃', title:'Exercise to amplify and sustain', text:'Physical activity when you\'re already feeling great builds on positive neurochemistry and helps maintain elevated mood for longer.', category:'Movement' },
        { icon:'🙏', title:'Practice gratitude out loud', text:'Verbalizing or writing what you appreciate at peak moments strengthens positive neural pathways and makes it easier to recall good feelings later.', category:'Reflection' },
        { icon:'🤝', title:'Lift someone else up', text:'Acts of kindness at high-mood moments create a "helper\'s high" and reinforce a virtuous cycle of wellbeing for you and others.', category:'Connection' },
        { icon:'🧠', title:'Lock in a healthy habit today', text:'You\'re in the optimal neurological state for habit formation. Pick one positive behaviour to repeat consistently — the habit circuit is most receptive now.', category:'Growth' },
    ],
    general: [
        { icon:'😴', title:'Prioritize sleep hygiene', text:'7–9 hours of quality sleep is the single most impactful factor in emotional regulation. Keep a consistent bedtime even on weekends.', category:'Self-care' },
        { icon:'📵', title:'Schedule a screen break', text:'Digital fatigue depletes emotional resources. Try a 20-minute no-screen window each afternoon to reset attention and reduce irritability.', category:'Balance' },
        { icon:'🍃', title:'Practice mindful breathing', text:'The 4-7-8 technique (inhale 4s, hold 7s, exhale 8s) has been shown to lower anxiety and improve focus within minutes.', category:'Mindfulness' },
    ],
};

function generateWellnessTips(filteredHistory) {
    const container = document.getElementById('wellness-tips-container');
    if (!container) return;

    const allHistory = JSON.parse(localStorage.getItem('moodHistory')) || [];
    const data = (filteredHistory && filteredHistory.length) ? filteredHistory : allHistory;

    const vals = { '😔':1, '😐':2, '🙂':3, '😀':4, '🤩':5 };
    const avg = data.length
        ? data.reduce((s, e) => s + (vals[e.mood] || 3), 0) / data.length
        : 3;

    let pool;
    if (avg < 2.5)      pool = [...wellnessTipLibrary.low,  ...wellnessTipLibrary.general];
    else if (avg < 3.5) pool = [...wellnessTipLibrary.neutral, ...wellnessTipLibrary.general];
    else                pool = [...wellnessTipLibrary.high, ...wellnessTipLibrary.general];

    // Shuffle and take 3
    const tips = pool.sort(() => Math.random() - 0.5).slice(0, 3);

    container.innerHTML = tips.map(tip => `
        <div class="wellness-tip">
            <h4>${tip.icon} ${tip.title}</h4>
            <p>${tip.text}</p>
            <span class="tip-category">${tip.category}</span>
        </div>
    `).join('');

    // Update subtitle with context
    const subtitle = document.querySelector('.tips-subtitle');
    if (subtitle) {
        if (data.length === 0) {
            subtitle.textContent = 'Log some moods to get personalized tips!';
        } else if (avg < 2.5) {
            subtitle.textContent = `Your recent mood average is lower than usual — here are some supportive suggestions:`;
        } else if (avg >= 3.5) {
            subtitle.textContent = `You've been doing great! Here's how to sustain and build on that positive momentum:`;
        } else {
            subtitle.textContent = `Based on your mood patterns, here are some suggestions for you:`;
        }
    }
}

// ── Drag & Drop (SortableJS) ─────────────────────────────────
function initDragDrop() {
    const grid = document.getElementById('trends-grid');
    if (!grid || typeof Sortable === 'undefined') return;
    Sortable.create(grid, {
        animation: 180,
        ghostClass: 'ghost',
        chosenClass: 'dragging',
        handle: '.card-header-controls',
        delay: 80,
        delayOnTouchOnly: true,
    });
}

// ── Settings ─────────────────────────────────────────────────
function initSettings() {
    // Open / close
    const settingsBtn   = document.getElementById('settings-btn');
    const settingsModal = document.getElementById('settings-modal');
    const closeSettings = document.getElementById('close-settings');
    if (settingsBtn)   settingsBtn.addEventListener('click', () => settingsModal.classList.add('active'));
    if (closeSettings) closeSettings.addEventListener('click', () => settingsModal.classList.remove('active'));
    if (settingsModal) settingsModal.addEventListener('click', e => { if (e.target === settingsModal) settingsModal.classList.remove('active'); });

    // Theme toggle
    const themeToggle = document.getElementById('theme-toggle');
    const themeState  = document.getElementById('theme-state');
    if (themeToggle) {
        themeToggle.checked = settings.theme === 'light';
        if (settings.theme === 'light') document.body.classList.add('light-mode');
        themeToggle.addEventListener('change', () => {
            if (themeToggle.checked) {
                document.body.classList.add('light-mode');
                settings.theme = 'light';
                if (themeState) themeState.textContent = 'Light';
            } else {
                document.body.classList.remove('light-mode');
                settings.theme = 'dark';
                if (themeState) themeState.textContent = 'Dark';
            }
            saveSettings();
            // Refresh charts for new color scheme
            updateChart();
            updateTimelineChart();
        });
    }

    // Sound toggle
    const soundToggle = document.getElementById('sound-toggle');
    const soundState  = document.getElementById('sound-state');
    const soundRow    = document.getElementById('sound-picker-row');
    const volumeRow   = document.getElementById('volume-row');

    function refreshSoundUI() {
        if (!soundToggle) return;
        const on = soundToggle.checked;
        if (soundState) soundState.textContent = on ? 'On' : 'Off';
        if (soundRow)   soundRow.classList.toggle('visible', on);
        if (volumeRow)  volumeRow.classList.toggle('visible', on);
        if (on) startAmbient(); else stopAmbient();
    }

    if (soundToggle) {
        soundToggle.checked = settings.soundEnabled;
        refreshSoundUI();
        soundToggle.addEventListener('change', () => {
            settings.soundEnabled = soundToggle.checked;
            saveSettings();
            refreshSoundUI();
        });
    }

    // Sound picker
    const soundPicker = document.getElementById('sound-picker');
    if (soundPicker) {
        soundPicker.value = settings.ambientScene;
        soundPicker.addEventListener('change', () => {
            settings.ambientScene = soundPicker.value;
            saveSettings();
            if (settings.soundEnabled) { stopAmbient(); startAmbient(); }
        });
    }

    // Volume slider
    const volSlider = document.getElementById('volume-slider');
    if (volSlider) {
        volSlider.value = settings.volume;
        volSlider.addEventListener('input', () => {
            settings.volume = parseFloat(volSlider.value);
            if (masterGain) masterGain.gain.setTargetAtTime(settings.volume, audioCtx.currentTime, 0.1);
            saveSettings();
        });
    }

    // Reset data
    const resetBtn    = document.getElementById('reset-data-btn');
    const confirmModal = document.getElementById('confirm-modal');
    const confirmCancel = document.getElementById('confirm-cancel');
    const confirmReset  = document.getElementById('confirm-reset');

    if (resetBtn)    resetBtn.addEventListener('click', () => confirmModal.classList.add('active'));
    if (confirmCancel) confirmCancel.addEventListener('click', () => confirmModal.classList.remove('active'));
    if (confirmReset) {
        confirmReset.addEventListener('click', () => {
            localStorage.removeItem('moodHistory');
            confirmModal.classList.remove('active');
            settingsModal.classList.remove('active');
            renderHistory();
            updateStats();
            updateChart();
            updateTimelineChart();
        });
    }
}

// ── Persist Settings ─────────────────────────────────────────
function saveSettings() {
    localStorage.setItem('mtSettings', JSON.stringify(settings));
}
function loadSettings() {
    const saved = localStorage.getItem('mtSettings');
    if (saved) {
        try { Object.assign(settings, JSON.parse(saved)); } catch {}
    }
    if (settings.theme === 'light') document.body.classList.add('light-mode');
}

// ── Ambient Music (Web Audio API) ────────────────────────────
// Each scene is a procedurally generated lo-fi soundscape.
// No external audio files needed — everything synthesised in-browser.

function getAudioCtx() {
    if (!audioCtx) {
        audioCtx  = new (window.AudioContext || window.webkitAudioContext)();
        masterGain = audioCtx.createGain();
        masterGain.gain.value = settings.volume;
        masterGain.connect(audioCtx.destination);
    }
    if (audioCtx.state === 'suspended') audioCtx.resume();
    return audioCtx;
}

function stopAmbient() {
    ambientRunning = false;
    ambientNodes.forEach(n => { try { n.stop ? n.stop() : n.disconnect(); } catch {} });
    ambientNodes = [];
}

function startAmbient() {
    stopAmbient();
    ambientRunning = true;
    const ctx = getAudioCtx();
    const scene = settings.ambientScene || 'rain';
    switch (scene) {
        case 'rain':    buildRain(ctx); break;
        case 'forest':  buildForest(ctx); break;
        case 'ocean':   buildOcean(ctx); break;
        case 'cafe':    buildCafe(ctx); break;
        case 'fire':    buildFire(ctx); break;
        case 'tibetan': buildTibetanBowl(ctx); break;
        default:        buildRain(ctx);
    }
}

// ─ White/pink noise helpers ───────────────────────────────────
function makeNoiseBuffer(ctx, seconds = 4, type = 'white') {
    const sr     = ctx.sampleRate;
    const frames = sr * seconds;
    const buffer = ctx.createBuffer(1, frames, sr);
    const data   = buffer.getChannelData(0);
    let b0=0,b1=0,b2=0,b3=0,b4=0,b5=0,b6=0;
    for (let i = 0; i < frames; i++) {
        const white = Math.random() * 2 - 1;
        if (type === 'pink') {
            // Paul Kellet's pink noise filter
            b0=0.99886*b0+white*0.0555179; b1=0.99332*b1+white*0.0750759;
            b2=0.96900*b2+white*0.1538520; b3=0.86650*b3+white*0.3104856;
            b4=0.55000*b4+white*0.5329522; b5=-0.7616*b5-white*0.0168980;
            data[i]=(b0+b1+b2+b3+b4+b5+b6+white*0.5362)*0.11;
            b6=white*0.115926;
        } else {
            data[i] = white;
        }
    }
    return buffer;
}

function loopNoise(ctx, buffer, filterFreq, filterType, gainVal) {
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    src.loop   = true;

    const filter = ctx.createBiquadFilter();
    filter.type            = filterType || 'lowpass';
    filter.frequency.value = filterFreq || 2000;

    const g = ctx.createGain();
    g.gain.value = gainVal || 0.6;

    src.connect(filter);
    filter.connect(g);
    g.connect(masterGain);
    src.start();
    ambientNodes.push(src, filter, g);
    return { src, filter, gain: g };
}

// ─ Scene: Gentle Rain ────────────────────────────────────────
function buildRain(ctx) {
    const buf = makeNoiseBuffer(ctx, 6, 'white');
    loopNoise(ctx, buf, 3500, 'bandpass', 0.55);  // high rain hiss
    loopNoise(ctx, buf, 800,  'lowpass',  0.25);  // low rumble
    // Occasional droplet pings
    schedulePings(ctx, [1200, 1800, 2400], 0.08, 0.6, 1.8);
}

// ─ Scene: Forest ─────────────────────────────────────────────
function buildForest(ctx) {
    const buf = makeNoiseBuffer(ctx, 6, 'pink');
    loopNoise(ctx, buf, 1200, 'lowpass', 0.3);  // wind through leaves
    // Bird-like chirps
    schedulePings(ctx, [2000, 2700, 3400, 1700], 0.07, 2.5, 6.0);
    // Low drone
    buildDrone(ctx, 60, 0.08);
}

// ─ Scene: Ocean Waves ────────────────────────────────────────
function buildOcean(ctx) {
    const buf = makeNoiseBuffer(ctx, 8, 'pink');
    // Slow LFO on gain for wave swell
    const g = ctx.createGain();
    g.gain.value = 0.5;
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.12;      // ~8-sec wave cycle
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 0.35;
    lfo.connect(lfoGain);
    lfoGain.connect(g.gain);
    lfo.start();
    ambientNodes.push(lfo, lfoGain, g);

    const src = ctx.createBufferSource();
    src.buffer = buf; src.loop = true;
    const f = ctx.createBiquadFilter();
    f.type = 'lowpass'; f.frequency.value = 1800;
    src.connect(f); f.connect(g); g.connect(masterGain);
    src.start();
    ambientNodes.push(src, f);
}

// ─ Scene: Café Murmur ────────────────────────────────────────
function buildCafe(ctx) {
    const buf = makeNoiseBuffer(ctx, 6, 'pink');
    loopNoise(ctx, buf, 600, 'lowpass', 0.22);   // muffled crowd murmur
    loopNoise(ctx, buf, 3000, 'bandpass', 0.08); // cup clinks & light hiss
    schedulePings(ctx, [900, 1100, 1400], 0.06, 3.0, 10.0);
    // Lo-fi pad chord
    buildChordPad(ctx, [130, 165, 196], 0.04);
}

// ─ Scene: Crackling Fire ─────────────────────────────────────
function buildFire(ctx) {
    const buf = makeNoiseBuffer(ctx, 5, 'white');
    loopNoise(ctx, buf, 900,  'bandpass', 0.45);  // crackle
    loopNoise(ctx, buf, 300,  'lowpass',  0.3);   // low rumble
    loopNoise(ctx, buf, 4000, 'highpass', 0.12);  // sharp pops
    // Random micro-pops
    schedulePings(ctx, [700, 1100], 0.12, 0.4, 1.5);
}

// ─ Scene: Tibetan Bowl ───────────────────────────────────────
function buildTibetanBowl(ctx) {
    // A Tibetan singing bowl creates a sustained fundamental (~220 Hz for an A3)
    // with strong partials at ~2.75× and ~5.2× (inharmonic series)
    const fundamentals = [220, 330];     // two bowls at A3 and E4
    const partialRatios = [1, 2.756, 5.18, 8.92]; // realistic singing bowl partials

    fundamentals.forEach((f0, bIdx) => {
        const delay = bIdx * 4; // stagger bowls
        partialRatios.forEach((ratio, pIdx) => {
            const freq  = f0 * ratio;
            const decay = 8 - pIdx * 1.2;  // higher partials decay faster
            const amp   = 0.18 / (pIdx + 1);
            scheduleBowlStrike(ctx, freq, amp, decay, delay);
        });
    });

    // Re-strike bowls periodically
    const strikeInterval = 12000; // ms
    function scheduleNextStrike() {
        if (!ambientRunning) return;
        fundamentals.forEach((f0, bIdx) => {
            partialRatios.forEach((ratio, pIdx) => {
                const freq  = f0 * ratio;
                const decay = 8 - pIdx * 1.2;
                const amp   = 0.18 / (pIdx + 1);
                scheduleBowlStrike(ctx, freq, amp, decay, 0);
            });
        });
        setTimeout(scheduleNextStrike, strikeInterval);
    }
    setTimeout(scheduleNextStrike, strikeInterval);

    // Soft pink noise bed (room ambience)
    const buf = makeNoiseBuffer(ctx, 6, 'pink');
    loopNoise(ctx, buf, 400, 'lowpass', 0.04);
}

function scheduleBowlStrike(ctx, freq, amp, decaySec, delayAtStart) {
    if (!ambientRunning) return;
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    osc.connect(gain);
    gain.connect(masterGain);
    const t0 = ctx.currentTime + delayAtStart;
    gain.gain.setValueAtTime(0, t0);
    gain.gain.linearRampToValueAtTime(amp, t0 + 0.02);   // sharp attack
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + decaySec);
    osc.start(t0);
    osc.stop(t0 + decaySec + 0.1);
    ambientNodes.push(osc, gain);
}

// ─ Shared helpers ─────────────────────────────────────────────
function schedulePings(ctx, freqs, amp, minGap, maxGap) {
    if (!ambientRunning) return;
    const freq = freqs[Math.floor(Math.random() * freqs.length)];
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    osc.connect(gain); gain.connect(masterGain);
    const now = ctx.currentTime;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(amp, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);
    osc.start(now); osc.stop(now + 0.6);
    ambientNodes.push(osc, gain);
    const next = (minGap + Math.random() * (maxGap - minGap)) * 1000;
    setTimeout(() => { if (ambientRunning) schedulePings(ctx, freqs, amp, minGap, maxGap); }, next);
}

function buildDrone(ctx, freq, amp) {
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    gain.gain.value = amp;
    osc.connect(gain); gain.connect(masterGain);
    osc.start();
    ambientNodes.push(osc, gain);
}

function buildChordPad(ctx, freqs, amp) {
    freqs.forEach(f => {
        const osc   = ctx.createOscillator();
        const gain  = ctx.createGain();
        const lfo   = ctx.createOscillator();
        const lgain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.value = f;
        lfo.frequency.value = 0.4;
        lgain.gain.value    = 0.006;
        lfo.connect(lgain); lgain.connect(osc.frequency);
        gain.gain.value = amp;
        osc.connect(gain); gain.connect(masterGain);
        osc.start(); lfo.start();
        ambientNodes.push(osc, gain, lfo, lgain);
    });
}

// ── Success chime ─────────────────────────────────────────────
function playSuccessSound() {
    if (!settings.soundEnabled) return;
    const ctx = getAudioCtx();
    [[523.25, 0], [659.25, 0.12], [783.99, 0.22]].forEach(([freq, offset]) => {
        const osc  = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        osc.connect(gain); gain.connect(ctx.destination);
        const t = ctx.currentTime + offset;
        gain.gain.setValueAtTime(0.18, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
        osc.start(t); osc.stop(t + 0.4);
    });
}
