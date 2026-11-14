# DevPilot — Your Goals. Your Code. Your Future.

> **DevPilot** is a personal developer command center designed for college students and beginner programmers to manage their daily college routine, follow a disciplined timetable, master computer science fundamentals, build real-world software, and accelerate their journey toward becoming an **AI-powered software developer**.

---

## 🌟 Key Features & Architecture

### 1. Dashboard (`/`)
- **Daily Executive Overview**: Personalized greeting, today's schedule, active daily tasks, learning streak, and overall multi-track curriculum completion percentage.
- **Dynamic Learning Track Cards**: Real-time progress bars for Python Mastery, C++ & DSA, Web Development, System Design, AI/ML Development, and College C Programming.
- **Weekly Study Chart**: Interactive SVG bar chart showing daily study hours.
- **Smart "Continue Learning" Recommender**: Automatically highlights the next incomplete topic across all your active learning tracks.
- **Academic Alerts & Deadlines**: Imminent college assignment deadlines and upcoming exams with countdown badges.

### 2. My Timetable (`/timetable`)
- **Strict Schedule Enforcement**: Reflects your real college and personal routine:
  - `5:00 – 5:45 AM`: Wake up, get ready & breakfast
  - `6:00 AM – 2:00 PM`: College
  - `2:00 – 3:00 PM`: Lunch & rest
  - `3:00 – 4:00 PM`: College academics, revision & assignments
  - `4:00 – 5:00 PM`: Python learning & practice
  - `5:00 – 7:00 PM`: Free Time & Personal Break *(customizable — shift to 2–4 PM or convert to study anytime)*
  - `7:00 – 8:00 PM`: C++ and DSA practice
  - `8:00 – 8:30 PM`: Dinner & break
  - `8:30 – 9:15 PM`: Web Development / System Design
  - `9:15 – 9:30 PM`: Revision & tomorrow's planning
  - `9:30 PM`: Sleep
- **Full Customization & In-Place Editing**: Edit any slot's time range, activity description, category, or break status; add custom time blocks; delete slots; or reset to defaults.
- **Completion Tracking**: Mark items as Completed, Skipped, Rescheduled, or Pending.
- **Calendar & Navigation**: Day-by-day navigation with completion percentages and weekly overview calendar.

### 3. Weekly Study Planner (`/weekly-planner`)
- **8:30–9:15 PM Evening Rotation**:
  - *Monday*: Web Development
  - *Tuesday*: System Design
  - *Wednesday*: Web Development
  - *Thursday*: System Design
  - *Friday*: Python Practice
  - *Saturday*: Web Development Project
  - *Sunday*: Weekly Revision and Project Work
- **Editable Slots**: Customize any day's focus topic with full persistence.
- **Task Management**: Prioritized tasks (Urgent, High, Medium, Low) with deadlines and single-click rescheduling.

### 4. Multi-Track Learning Roadmaps
Every topic includes beginner-friendly descriptions, practical exercises, curated free learning resources, a 4-state status selector (`Not Started`, `Learning`, `Practising`, `Completed`), and personal note-taking with automatic persistence.

- **Track A: C Programming (`/roadmap`)**
  - Covers your college curriculum: Syntax, Loops, Functions, Arrays, Strings, Pointers, Structures, Dynamic Memory Allocation (`malloc`/`free`), and File Handling.
- **Track B: Python Mastery (`/python`)**
  - Divided into 3 levels: **Beginner** (topics 1–14), **Intermediate** (topics 15–27: OOP, generators, decorators, APIs), and **Advanced & Practical** (topics 28–37: Type hints, Async, FastAPI, REST, AI apps).
- **Track C: C++ and DSA (`/cpp-dsa`)**
  - **C++ Fundamentals**: Syntax, STL (Vectors, Maps, Sets, Stacks, Queues, Priority Queues).
  - **DSA Roadmap**: Complexity analysis, Two Pointers, Sliding Window, Trees, Heaps, Graphs, and Dynamic Programming.
  - **Integrated DSA Problem Tracker**: Log problems from LeetCode, GeeksforGeeks, and Codeforces with time taken, attempts, clickable URLs, solution notes, and revision flags.
- **Track D: Web Development (`/webdev`)**
  - **Frontend**: HTML5, Semantic Web, Modern CSS (Flexbox, Grid), JavaScript (ES6+, DOM, Async/Await), React, TypeScript.
  - **Backend**: Client-Server architecture, HTTP/HTTPS, REST APIs, FastAPI, Node.js/Express, PostgreSQL, and Database Design.
- **Track E: System Design (`/system-design`)**
  - **Fundamentals & Intermediate**: DNS, Caching, Load Balancing, Horizontal Scaling, Microservices, Message Queues (Kafka/RabbitMQ), Rate Limiting, and CAP Theorem.
  - **6 Complete Architectural Blueprints**: URL Shortener, Real-time Chat App, Distributed File Storage (S3), Multi-channel Notification System, Social Media Feed, and Production AI Chatbot.
- **Track F: AI-Powered Software Development (`/ai-ml`)**
  - Practical focus on building software powered by AI: LLM APIs, Prompt Engineering, Structured JSON Outputs, Embeddings, Vector Databases, RAG (Retrieval-Augmented Generation), PDF Q&A, and Autonomous AI Agents.

### 5. College Academics (`/academics`)
- **Semester Management**: Track enrolled subjects (C Programming, Engineering Mathematics, Digital Logic, etc.).
- **Units & Chapters**: Add chapters, list subtopics, and monitor completion percentages.
- **Assignments Tracker**: Due dates, pending status badges, scored marks, and max marks.
- **Exam Countdown**: Track upcoming theory and practical exam dates with days-left countdowns.
- **Practical Lab Records**: Log lab experiments, viva readiness, and manual records.

### 6. Developer Projects (`/projects`)
- Track projects across 4 lifecycle stages: `Idea` ➔ `Planning` ➔ `In Progress` ➔ `Completed`.
- Record project descriptions, tech stack tags, GitHub repositories, live demo URLs, dates, and engineering lessons learned.
- Includes 10 curriculum-aligned starter project ideas with 1-click adoption.

### 7. Public Developer Portfolio (`/portfolio`)
- Clean showcase page presenting genuine, verified progress.
- Real-time skills calculated directly from database track completion.
- Projects filtered specifically by your explicit `showInPortfolio` preference.
- Clearly flags unedited example text as placeholder content to ensure authenticity.

### 8. Goals & Analytics (`/goals`)
- Multi-horizon goal setting: Daily, Weekly, Monthly, Quarterly, and Yearly.
- Focuses on real developer milestones (topics mastered, problems solved, projects shipped) rather than passive hours.

### 9. Sunday Weekly Review & ChatGPT Sharing (`/weekly-review`)
- Structured review of study hours, topics covered, DSA problems solved, blockers, and weekly wins.
- **Share My Progress with ChatGPT**:
  - Generates a markdown report tailored for ChatGPT review.
  - 1-click **Copy Report**, **Export Markdown**, and **Export JSON**.
  - Optional field to paste ChatGPT's critique and save the next week's plan.
  - Strict privacy: No automated transmission without explicit user export.

### 10. DevPilot AI Assistant (Floating Tutor)
- Available everywhere via the bottom-right floating pill.
- Patient programming tutor capable of line-by-line code explanation, progressive DSA hints, and curriculum recommendations.
- **Zero-Key Offline Mode**: Built-in tutor engine with instant guidance.
- **Live Gemini API Support**: Optionally enter a free Google Gemini API key (stored securely only in local browser storage).

### 11. Settings & Local Persistence (`/settings`)
- Light Mode / Dark Mode toggle with deep charcoal/slate developer styling.
- Local data export (full JSON backup) and restore.
- Safe data reset with confirmation safeguard.

---

## 🛠️ Technology Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Vite 8
- **Icons**: Lucide React + Custom SVG Brand Icons
- **Data Persistence**: IndexedDB via Dexie.js (with `dexie-react-hooks` for live reactivity) + LocalStorage for profile and settings
- **Charts**: Custom lightweight SVG Bar Charts (zero external bundle bloat)
- **Routing**: React Router DOM v7

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18 or higher recommended)
- npm or pnpm

### 2. Installation
Open your terminal in the project directory:

```bash
cd DevPilot
npm install
```

### 3. Run Development Server
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:5173`.

### 4. Production Build
```bash
npm run build
npm run preview
```
