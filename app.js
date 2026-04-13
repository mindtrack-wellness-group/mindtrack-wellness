// Motivational Quotes - Diverse, multicultural, and faith-inspired
const quotes = [
    // Christian & Biblical Inspiration
    { text: "I can do all things through Christ who strengthens me.", author: "Philippians 4:13" },
    { text: "The Lord is my shepherd; I shall not want.", author: "Psalm 23:1" },
    { text: "Be still, and know that I am God.", author: "Psalm 46:10" },
    { text: "Cast all your anxiety on Him because He cares for you.", author: "1 Peter 5:7" },
    { text: "For I know the plans I have for you, plans to prosper you and not to harm you.", author: "Jeremiah 29:11" },
    { text: "Come to me, all you who are weary and burdened, and I will give you rest.", author: "Matthew 11:28" },
    { text: "The Lord is close to the brokenhearted and saves those who are crushed in spirit.", author: "Psalm 34:18" },
    { text: "Do not be anxious about anything, but in everything by prayer present your requests to God.", author: "Philippians 4:6" },
    { text: "Love your neighbor as yourself.", author: "Mark 12:31" },
    { text: "Let your light shine before others.", author: "Matthew 5:16" },
    { text: "Faith is the substance of things hoped for, the evidence of things not seen.", author: "Hebrews 11:1" },
    { text: "God is our refuge and strength, an ever-present help in trouble.", author: "Psalm 46:1" },
    
    // General Inspirational
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
    
    // Buddhist Wisdom
    { text: "Peace comes from within. Do not seek it without.", author: "Buddha" },
    { text: "The mind is everything. What you think you become.", author: "Buddha" },
    { text: "In the end, only three things matter: how much you loved, how gently you lived, and how gracefully you let go.", author: "Buddha" },
    { text: "Every morning we are born again. What we do today matters most.", author: "Buddha" },
    
    // African Proverbs
    { text: "If you want to go fast, go alone. If you want to go far, go together.", author: "African Proverb" },
    { text: "Smooth seas do not make skillful sailors.", author: "African Proverb" },
    { text: "However long the night, the dawn will break.", author: "African Proverb" },
    
    // Asian Wisdom
    { text: "Fall seven times, stand up eight.", author: "Japanese Proverb" },
    { text: "A journey of a thousand miles begins with a single step.", author: "Lao Tzu" },
    { text: "The best time to plant a tree was 20 years ago. The second best time is now.", author: "Chinese Proverb" },
    { text: "When the winds of change blow, some build walls, others build windmills.", author: "Chinese Proverb" },
    
    // Indigenous Wisdom
    { text: "We do not inherit the earth from our ancestors; we borrow it from our children.", author: "Native American Proverb" },
    { text: "Listen to the wind, it talks. Listen to the silence, it speaks.", author: "Native American Proverb" },
    
    // Middle Eastern Wisdom
    { text: "The wound is the place where the Light enters you.", author: "Rumi" },
    { text: "Let yourself be silently drawn by the strange pull of what you really love.", author: "Rumi" },
    { text: "Yesterday I was clever, so I wanted to change the world. Today I am wise, so I am changing myself.", author: "Rumi" },
    
    // Latin American Wisdom
    { text: "They tried to bury us. They didn't know we were seeds.", author: "Mexican Proverb" },
    
    // Modern Wisdom
    { text: "In a gentle way, you can shake the world.", author: "Mahatma Gandhi" },
    { text: "Be the change you wish to see in the world.", author: "Mahatma Gandhi" },
    { text: "What lies behind us and what lies before us are tiny matters compared to what lies within us.", author: "Ralph Waldo Emerson" },
    { text: "The only way out is through.", author: "Robert Frost" },
];

// App Settings
let currentQuoteIndex = 0;
let quoteRotationInterval = null;
let settings = {
    theme: 'dark',
    soundEnabled: true,
    autoQuoteRotation: true
};

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    loadSettings();
    initializeApp();
    renderHistory();
    updateStats();
    setRandomQuote();
    initQuoteRotation();
    initSettings();
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
    const quoteAuthor = document.getElementById('quote-author');
    const quote = quotes[currentQuoteIndex];
    quoteText.textContent = `"${quote.text}"`;
    quoteAuthor.textContent = `— ${quote.author}`;
}

function nextQuote() {
    currentQuoteIndex = (currentQuoteIndex + 1) % quotes.length;
    setRandomQuote();
}

function prevQuote() {
    currentQuoteIndex = (currentQuoteIndex - 1 + quotes.length) % quotes.length;
    setRandomQuote();
}

function initQuoteRotation() {
    // Quote navigation buttons
    const prevBtn = document.getElementById('prev-quote');
    const nextBtn = document.getElementById('next-quote');
    
    if (prevBtn) prevBtn.addEventListener('click', prevQuote);
    if (nextBtn) nextBtn.addEventListener('click', nextQuote);
    
    // Auto-rotation
    if (settings.autoQuoteRotation) {
        startQuoteRotation();
    }
}

function startQuoteRotation() {
    if (quoteRotationInterval) {
        clearInterval(quoteRotationInterval);
    }
    quoteRotationInterval = setInterval(() => {
        nextQuote();
    }, 15000); // Every 15 seconds
}

function stopQuoteRotation() {
    if (quoteRotationInterval) {
        clearInterval(quoteRotationInterval);
        quoteRotationInterval = null;
    }
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
    
    // Play sound effect if enabled
    if (settings.soundEnabled) {
        playSuccessSound();
    }
    
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

function playSuccessSound() {
    // Create a simple success sound using Web Audio API
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 600;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
}

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

// Settings Functions
function loadSettings() {
    const savedSettings = localStorage.getItem('appSettings');
    if (savedSettings) {
        settings = JSON.parse(savedSettings);
    }
    
    // Apply theme
    if (settings.theme === 'light') {
        document.body.classList.add('light-mode');
    }
}

function saveSettings() {
    localStorage.setItem('appSettings', JSON.stringify(settings));
}

function initSettings() {
    const settingsBtn = document.getElementById('settings-btn');
    const settingsModal = document.getElementById('settings-modal');
    const closeSettings = document.getElementById('close-settings');
    
    // Open settings
    settingsBtn.addEventListener('click', () => {
        settingsModal.classList.add('active');
        syncSettingsUI();
    });
    
    // Close settings
    closeSettings.addEventListener('click', () => {
        settingsModal.classList.remove('active');
    });
    
    // Close on outside click
    settingsModal.addEventListener('click', (e) => {
        if (e.target === settingsModal) {
            settingsModal.classList.remove('active');
        }
    });
    
    // Theme toggle
    const themeToggle = document.getElementById('theme-toggle');
    themeToggle.addEventListener('change', () => {
        settings.theme = themeToggle.checked ? 'light' : 'dark';
        document.body.classList.toggle('light-mode', themeToggle.checked);
        saveSettings();
    });
    
    // Sound toggle
    const soundToggle = document.getElementById('sound-toggle');
    soundToggle.addEventListener('change', () => {
        settings.soundEnabled = soundToggle.checked;
        saveSettings();
    });
    
    // Auto-quote rotation toggle
    const autoQuoteToggle = document.getElementById('auto-quote-toggle');
    autoQuoteToggle.addEventListener('change', () => {
        settings.autoQuoteRotation = autoQuoteToggle.checked;
        saveSettings();
        
        if (settings.autoQuoteRotation) {
            startQuoteRotation();
        } else {
            stopQuoteRotation();
        }
    });
    
    // Reset data
    const resetBtn = document.getElementById('reset-data-btn');
    resetBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to delete all your mood entries? This cannot be undone.')) {
            if (confirm('This will permanently delete all your data. Are you absolutely sure?')) {
                localStorage.removeItem('moodHistory');
                renderHistory();
                updateStats();
                updateChart();
                settingsModal.classList.remove('active');
                alert('All data has been reset.');
            }
        }
    });
    
    // Export data
    const exportBtn = document.getElementById('export-data-btn');
    exportBtn.addEventListener('click', () => {
        const history = localStorage.getItem('moodHistory') || '[]';
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(history);
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", "mindtrack-data.json");
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
    });
}

function syncSettingsUI() {
    // Sync toggles with current settings
    document.getElementById('theme-toggle').checked = settings.theme === 'light';
    document.getElementById('sound-toggle').checked = settings.soundEnabled;
    document.getElementById('auto-quote-toggle').checked = settings.autoQuoteRotation;
}
