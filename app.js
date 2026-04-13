const moodForm = document.getElementById('mood-form');

// Listen for the "Log Entry" button click
moodForm.addEventListener('submit', function(event) {
    event.preventDefault(); // Stop the page from refreshing

    // 1. Capture the user's input
    const selectedMood = document.querySelector('input[name="mood"]:checked').value;
    const moodNote = document.getElementById('mood-note').value;
    const timestamp = new Date().toLocaleDateString();

    // 2. Package it into an object
    const entry = {
        mood: selectedMood,
        note: moodNote,
        date: timestamp
    };

    // 3. Save it to LocalStorage
    saveEntry(entry);
    
    // 4. Reset the UI
    document.getElementById('mood-note').value = '';
    alert('Mood Logged! 🌿');
});

// Helper function to handle the data storage
function saveEntry(newEntry) {
    // Retrieve existing logs or create a new empty array if none exist
    let history = JSON.parse(localStorage.getItem('moodHistory')) || [];
    
    // Push the new log into our array
    history.push(newEntry);
    
    // Stringify and save back to the browser's memory
    localStorage.setItem('moodHistory', JSON.stringify(history));
    
    // Log to console so we can verify it's working in the browser tools
    console.log('Updated History:', history);
}