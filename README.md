# D's Focus — Personal Productivity & Schedule Management Platform
> *"Discipline Today, Brighter Tomorrow"*

A modern, production-ready productivity and schedule management web application built with **React**, **TypeScript**, **Tailwind CSS**, and **Supabase Cloud**.

---

## 🚀 Key Features

### 1. Supabase Cloud Authentication & PostgreSQL
- **Mobile Number Authentication**: Supports international country codes (default `+91` India).
- **6-Box OTP Verification**: Auto-advancing inputs with paste support, countdown timer, and invalid/expired states.
- **Strict Row Level Security (RLS)**: Users can only view, create, edit, and delete their own profiles, schedules, and activities.
- **Dual Engine**: Works seamlessly in **Live Supabase Cloud Mode** or **Instant Sandbox Mode** (using test OTP `123456`) for zero-friction local testing.

### 2. Dashboard 1 — Today's Focus
- **Dynamic Header**: Time-aware greeting (*"Good Morning / Afternoon / Evening, [Name] 👋"*), live digital clock, and calendar date.
- **Smart Focus Banner**: Prominently highlights the **CURRENTLY** scheduled routine with real-time percentage progress bar and indicates the **NEXT** upcoming routine.
- **Interactive Check-In Engine**:
  - Click **[Check In]** to record start time and trigger a live stopwatch ticker (`02:34 elapsed`).
  - Click **[Complete Activity]** to log actual focus duration and optional notes, triggering audio fanfares and confetti celebrations!
  - Ability to **[Skip]** with optional reason.
- **Productivity Score**: Dynamic composite score (0–100) combining routine completion rate, focus minutes, and daily streak.

### 3. Dashboard 2 — Manage Schedule
- Complete schedule management: Add, Edit, Duplicate, Toggle Active/Inactive, and Delete (with confirmation).
- Recurrence days picker with quick presets (*Every Day*, *Weekdays*, *Weekends*).
- **1-Click Master Routine Import**: Pre-populates the complete 18-step proven high-performance routine (*Wake Up, DSA / Coding Practice, Aptitude, College, Project Development, SQL / Interview Prep, etc.*).

### 4. Dashboard 3 — Interactive Analytics
- **Top KPI Cards**: Today's completion %, weekly completion %, current streak 🔥, and total focused minutes.
- **Date Filters**: *Today*, *7 Days*, *30 Days*, *This Month*.
- **5 Dynamic Visual Charts**:
  1. *Weekly Completion Rate* (Smooth Line Chart)
  2. *Daily Completed Activities* (Bar Chart)
  3. *Time Spent by Category* (Donut / Pie Chart)
  4. *Productivity Timeline* (Glowing Area Chart)
  5. *Schedule Performance* (Stacked Completed vs Skipped vs Pending Comparison)

### 5. Dashboard 4 — Activity History
- Complete chronological audit log of all completed and skipped activities.
- Search by keyword or notes, filter by Category, filter by Status.
- Sorting (Newest, Oldest, Longest Duration, Title).
- Responsive table with mobile card fallback and pagination.
- **Export to CSV**: 1-click export of historical data.

### 6. Productivity Extras
- **Focus Timer (Pomodoro)**: 25 min, 50 min, and Custom focus sessions with circular countdown, Web Audio synthesizer chime, and auto-logging to database.
- **Streak Counter**: Consecutive days tracker with active flame badges.
- **Theme Switcher**: Dark, Light, and System modes.

---

## 🛠️ Supabase Cloud Setup Guide

1. Go to [Supabase](https://supabase.com) and create a new project.
2. Navigate to the **SQL Editor** in your Supabase project dashboard.
3. Open `supabase/schema.sql` from this repository, paste the entire contents into the SQL Editor, and click **Run**.
4. In your Supabase Project Settings -> **API**, copy:
   - **Project URL**
   - **anon / public key**
5. Create a `.env` file in the project root:
   ```env
   VITE_SUPABASE_URL=https://your-project-ref.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
6. Alternatively, click the **Database Config** button inside the app settings to configure credentials directly from the user interface.

---

## 💻 Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```
