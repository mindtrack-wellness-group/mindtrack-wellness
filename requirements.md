
### **Vision**
MindTrack is a minimalist wellness journal designed to lower the barrier to mental health tracking through a simple, "one-click" mood logger. By providing automated visualization, it solves the paint point of "journaling fatigue" and empowers users to identify emotional patterns through clear, data-driven self-reflection.

### **Scope (In/Out)**

#### **✅ IN SCOPE (MVP)**
* **Daily Mood Logger:** 1–5 scale using emojis and a short text input.
* **Trend Visualization:** A responsive 7-day line chart rendered using **Chart.js**.
* **Streak Tracking:** A dynamic "5-day streak" counter to encourage consistent usage.
* **Persistence:** All logs are saved locally using the **Web Storage API (LocalStorage)**.
* **Accessibility-First:** High-contrast color palette optimized for a 100% Lighthouse score.

#### **❌ OUT OF SCOPE (MVP)**
* **Medical Advice:** The application is a tracking tool and does not provide clinical diagnoses or recommendations.
* **Cloud Sync:** To ensure privacy, no data is stored on an external server; all data stays private on the user’s specific device.

---

### **Functional Requirements**

1.  **Mood Selection:** The application must allow the user to select their mood from a defined 1 to 5 range.
2.  **Note Entry:** The user must be able to input a short text reflection for each daily entry.
3.  **Visual Analytics:** The system must process historical data and render a weekly trend graph.
4.  **Streak Calculation:** The application must determine and display the number of consecutive days logged.

### **Stretch Goals (Post-MVP)**
* **Tagging System:** Ability to #tag entries (e.g., #work, #social) to categorize reflections.
* **Password Lock:** An entry screen to protect private logs on a shared device.
* **Data Export:** Functionality to download logs as a CSV file.
