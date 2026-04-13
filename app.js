// Motivational Quotes
const quotes = [
    "You are capable of amazing things.",
    "Every day is a fresh start.",
    "Your feelings are valid and important.",
    "Progress, not perfection.",
    "You are stronger than you think.",
    "Small steps lead to big changes.",
    "It's okay to not be okay.",
    "You deserve peace and happiness.",
    "One day at a time.",
    "Your mental health matters."
];

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    renderHistory();
    updateStats();
    setRandomQuote();
});

function initializeApp() {
    // View switching for sidebar navigation
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            switchView(this.dataset.view);
            navItems.forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // View switching for mobile navigation
    const mobileNavItems = document.querySelectorAll('.mobile-nav-item');
    mobileNavItems.forEach(item => {
        item.addEventListener('click', function() {
            switchView(this.dataset.view);
            mobileNavItems.forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // Search functionality
    const searchInput = document.getElementById('search-input');
    searchInput.addEventListener('input', handleSearch);
    
    // Filter functionality
    const filterMood = document.getElementById('filter-mood');
    const filterPeriod = document.getElementById('filter-period');
    
    if (filterMood) {
        filterMood.addEventListener('change', renderHistory);
    }
    if (filterPeriod) {
        filterPeriod.addEventListener('change', renderHistory);
    }
}

function switchView(viewId) {
    // Hide all views
    document.querySelectorAll('.view').forEach(view => {
        view.classList.remove('active');
    });
    
    // Show selected view
    const selectedView = document.getElementById(viewId);
    if (selectedView) {
        selectedView.classList.add('active');
    }
    
    // Update chart if switching to trends
    if (viewId === 'trends-view') {
        updateChart();
    }
}

function setRandomQuote() {
    const quoteText = document.getElementById('quote-text');
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    quoteText.textContent = `"${randomQuote}"`;
}

// Mood Form Submission
const moodForm = document.getElementById('mood-form');
moodForm.addEventListener('submit', function(event) {
    event.preventDefault();

    const selectedMood = document.querySelector('input[name="mood"]:checked').value;
    const moodNote = document.getElementById('mood-note').value;
    const timestamp = new Date();

    const entry = {
        mood: selectedMood,
        note: moodNote,
        date: timestamp.toLocaleDateString(),
        fullDate: timestamp.toISOString()
    };

    saveEntry(entry);
    
    // UI Updates
    renderHistory();
    updateStats();
    updateChart();
    
    // Reset form
    document.getElementById('mood-note').value = '';
    
    // Show success feedback
    const submitBtn = moodForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = '✓ Logged!';
    submitBtn.style.backgroundColor = '#00D9A3';
    
    setTimeout(() => {
        submitBtn.textContent = originalText;
        submitBtn.style.backgroundColor = '';
    }, 2000);
    
    // Switch to history view to show the new entry
    setTimeout(() => {
        switchView('history-view');
        document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
        document.querySelector('.nav-item[data-view="history-view"]').classList.add('active');
    }, 2500);
});

function saveEntry(newEntry) {
    let history = JSON.parse(localStorage.getItem('moodHistory')) || [];
    history.push(newEntry);
    localStorage.setItem('moodHistory', JSON.stringify(history));
}

function renderHistory() {
    const historyList = document.getElementById('mood-history-list');
    let history = JSON.parse(localStorage.getItem('moodHistory')) || [];
    
    // Apply filters
    const filterMood = document.getElementById('filter-mood');
    const filterPeriod = document.getElementById('filter-period');
    
    if (filterMood && filterMood.value !== 'all') {
        history = history.filter(entry => entry.mood === filterMood.value);
    }
    
    if (filterPeriod && filterPeriod.value !== 'all') {
        const now = new Date();
        history = history.filter(entry => {
            const entryDate = new Date(entry.fullDate || entry.date);
            const diffTime = now - entryDate;
            const diffDays = diffTime / (1000 * 60 * 60 * 24);
            
            switch(filterPeriod.value) {
                case 'week': return diffDays <= 7;
                case 'month': return diffDays <= 30;
                case 'year': return diffDays <= 365;
                default: return true;
            }
        });
    }

    historyList.innerHTML = '';

    if (history.length === 0) {
        historyList.innerHTML = '<p style="text-align: center; color: var(--text-dim); padding: 2rem;">No entries found. Start logging your mood!</p>';
        return;
    }

    history.slice().reverse().forEach((entry, index) => {
        const originalIndex = history.length - 1 - index;
        
        const card = document.createElement('div');
        card.className = 'mood-card';
        card.innerHTML = `
            <div class="card-header">
                <span class="card-mood">${entry.mood}</span>
                <span class="card-date">${entry.date}</span>
            </div>
            <p class="card-note" contenteditable="true" id="note-${originalIndex}">${entry.note || 'No notes added'}</p>
            <div class="card-actions">
                <button class="update-btn" onclick="focusNote(${originalIndex})">Edit</button>
                <button class="save-btn" onclick="updateNote(${originalIndex})" style="display:none;" id="save-${originalIndex}">Save Changes</button>
            </div>
        `;
        historyList.appendChild(card);
    });
}

function focusNote(index) {
    const noteField = document.getElementById(`note-${index}`);
    const saveBtn = document.getElementById(`save-${index}`);
    
    noteField.focus();
    saveBtn.style.display = 'inline-block';
}

function updateNote(index) {
    let history = JSON.parse(localStorage.getItem('moodHistory')) || [];
    const newNote = document.getElementById(`note-${index}`).innerText;
    const saveBtn = document.getElementById(`save-${index}`);
    
    history[index].note = newNote;
    localStorage.setItem('moodHistory', JSON.stringify(history));
    
    // Success feedback
    const originalText = saveBtn.innerText;
    saveBtn.innerText = "Updated! ✨";
    saveBtn.style.background = "#00D9A3";
    
    setTimeout(() => {
        saveBtn.innerText = originalText;
        saveBtn.style.background = "";
        saveBtn.style.display = 'none';
    }, 1500);
}

function handleSearch() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    const cards = document.querySelectorAll('.mood-card');
    
    cards.forEach(card => {
        const noteText = card.querySelector('.card-note').textContent.toLowerCase();
        const dateText = card.querySelector('.card-date').textContent.toLowerCase();
        
        if (noteText.includes(searchTerm) || dateText.includes(searchTerm)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

function updateStats() {
    let history = JSON.parse(localStorage.getItem('moodHistory')) || [];
    
    // Update total logs
    const totalLogs = document.getElementById('total-logs');
    if (totalLogs) {
        totalLogs.textContent = history.length;
    }
    
    // Update progress bar (milestone every 30 logs)
    const progressFill = document.getElementById('progress-fill');
    if (progressFill) {
        const progress = (history.length % 30) / 30 * 100;
        progressFill.style.width = progress + '%';
    }
    
    // Calculate streak
    updateStreak();
    
    // Calculate average mood
    updateAverageMood(history);
}

function updateStreak() {
    let history = JSON.parse(localStorage.getItem('moodHistory')) || [];
    if (history.length === 0) return;
    
    // Sort by date
    history.sort((a, b) => new Date(b.fullDate || b.date) - new Date(a.fullDate || a.date));
    
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < history.length; i++) {
        const entryDate = new Date(history[i].fullDate || history[i].date);
        entryDate.setHours(0, 0, 0, 0);
        
        const diffDays = Math.floor((today - entryDate) / (1000 * 60 * 60 * 24));
        
        if (diffDays === streak) {
            streak++;
        } else if (diffDays > streak) {
            break;
        }
    }
    
    const streakText = document.querySelector('.streak-text');
    if (streakText) {
        streakText.textContent = `${streak}-day streak`;
    }
}

function updateAverageMood(history) {
    if (history.length === 0) return;
    
    // Get last 7 days
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const recentEntries = history.filter(entry => {
        const entryDate = new Date(entry.fullDate || entry.date);
        return entryDate >= weekAgo;
    });
    
    if (recentEntries.length === 0) return;
    
    // Calculate average
    const moodValues = {
        '😔': 1,
        '😐': 2,
        '🙂': 3,
        '😀': 4,
        '🤩': 5
    };
    
    const moodEmojis = ['😔', '😐', '🙂', '😀', '🤩'];
    
    const avgValue = recentEntries.reduce((sum, entry) => sum + (moodValues[entry.mood] || 3), 0) / recentEntries.length;
    const avgIndex = Math.round(avgValue) - 1;
    
    const avgMoodEmoji = document.getElementById('avg-mood-emoji');
    if (avgMoodEmoji) {
        avgMoodEmoji.textContent = moodEmojis[avgIndex];
    }
}

// Chart
let moodChart = null;

function updateChart() {
    const history = JSON.parse(localStorage.getItem('moodHistory')) || [];
    
    if (history.length === 0) return;
    
    // Get mood distribution
    const moodCounts = {
        '😔': 0,
        '😐': 0,
        '🙂': 0,
        '😀': 0,
        '🤩': 0
    };
    
    history.forEach(entry => {
        if (moodCounts[entry.mood] !== undefined) {
            moodCounts[entry.mood]++;
        }
    });
    
    const ctx = document.getElementById('moodChart');
    if (!ctx) return;
    
    // Destroy existing chart
    if (moodChart) {
        moodChart.destroy();
    }
    
    moodChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['😔 Sad', '😐 Neutral', '🙂 Good', '😀 Happy', '🤩 Excited'],
            datasets: [{
                label: 'Mood Count',
                data: [
                    moodCounts['😔'],
                    moodCounts['😐'],
                    moodCounts['🙂'],
                    moodCounts['😀'],
                    moodCounts['🤩']
                ],
                backgroundColor: [
                    '#FF6B6B',
                    '#FFA500',
                    '#FFD93D',
                    '#00D9A3',
                    '#00FFC8'
                ],
                borderRadius: 10,
                borderSkipped: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1,
                        color: '#A0A0A0'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.05)'
                    }
                },
                x: {
                    ticks: {
                        color: '#A0A0A0'
                    },
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}
