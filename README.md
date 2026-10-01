# Aman Mishra — Software Developer Portfolio

<p align="center">
  <a href="https://calligraphyguruji.dev/">
    <img src="https://img.shields.io/badge/🌐_Live_Portfolio-calligraphyguruji.dev-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Live Portfolio"/>
  </a>
  <a href="https://github.com/calligraphyguruji">
    <img src="https://img.shields.io/badge/GitHub-calligraphyguruji-181717?style=for-the-badge&logo=github&logoColor=white" alt="GitHub Profile"/>
  </a>
  <a href="https://www.linkedin.com/in/calligraphygurji/">
    <img src="https://img.shields.io/badge/LinkedIn-Aman_Mishra-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white" alt="LinkedIn"/>
  </a>
  <a href="https://leetcode.com/u/calligraphyguruji/">
    <img src="https://img.shields.io/badge/LeetCode-150+_Solved-FFA116?style=for-the-badge&logo=leetcode&logoColor=black" alt="LeetCode"/>
  </a>
</p>

<p align="center">
  <b>🔗 Experience the Live Application:</b> <a href="https://calligraphyguruji.dev/"><b>https://calligraphyguruji.dev</b></a>
</p>

---

## 📌 Overview

A high-performance personal developer portfolio engineered with an editorial aesthetic, modern typography contrast, fluid dark/light theming, and an interactive case study architecture. Built with **React 18**, **TypeScript**, **Tailwind CSS**, and **Vite**.

### ✨ Standout Features
- **Editorial Single-Line Typography:** Bold headline with outlined stroke (`AMAN`) and filled typography (`MISHRA`) matching minimalist editorial systems.
- **Interactive Cursor Spotlight Color Reveal:** The centerpiece portrait remains grayscale by default and dynamically reveals vibrant natural color strictly within the circular cursor spotlight on hover.
- **Dedicated Project Case Study Routing:** Clicking any project preview image seamlessly routes to a deep-dive case study page (`#/project/<id>`) detailing the problem statement, engineered solution, system architecture, key metrics, and technology stack.
- **Zero-Dependency Routing:** Powered by native browser hash routing and history APIs (following Ponytail minimal principles) for zero bundle bloat and instant page transitions.
- **Hardened Anti-Spam Contact Architecture:** Production-grade security pipeline defending against bot spam and EmailJS quota exhaustion via Cloudflare Turnstile, invisible honeypot traps, client/server sliding-window rate limiting, and serverless isolation (`/api/contact`).
- **Live Analytics:** Integrated with `@vercel/analytics` for privacy-first performance monitoring.

---

## 🛡️ Contact Form Hardening & Anti-Spam Architecture

To safeguard the free EmailJS sending quota (200 emails/month) against automated bot spam and malicious submission floods, the contact flow is decoupled from client-side direct EmailJS calls and routed through a hardened serverless pipeline:

```
[ Visitor / Client Form ]
         ↓
1. Client Honeypot Check (Silently drops bots if hidden trap field is populated)
         ↓
2. Client Cooldown (60s timer in localStorage to prevent rapid accidental clicks)
         ↓
3. Client Syntax Validation (Catches typos & malformed emails before network dispatch)
         ↓
[ POST /api/contact ] (Vercel Serverless Function)
         ↓
4. Server Honeypot Verification (Silently returns HTTP 200 without calling EmailJS)
         ↓
5. Server Input & Syntax Validation (Length limits & RFC compliance)
         ↓
6. Content Abuse Heuristics (URL flood density >3, character flood, spam patterns)
         ↓
7. Multi-Factor Rate Limiting (Max 3/hour per IP, Max 3/hour per Email, 30s burst check)
         ↓
8. Duplicate Fingerprint Check (Detects identical resubmissions within 15 minutes)
         ↓
9. Cloudflare Turnstile Cryptographic Bot Verification (Server-side siteverify)
         ↓
10. ONLY THEN: EmailJS REST API Dispatch (Isolated server credentials)
         ↓
[ Aman's Inbox ]
```

### Security Guarantees:
- **Zero Exposed EmailJS Credentials:** `EMAILJS_SERVICE_ID`, `EMAILJS_TEMPLATE_ID`, `EMAILJS_PUBLIC_KEY`, and `EMAILJS_PRIVATE_KEY` remain strictly server-side in Vercel environment variables.
- **Quota Shielding:** A request NEVER reaches EmailJS until honeypot, syntax, content abuse, rate limits, duplicate checks, and Turnstile bot verification have ALL succeeded.
- **Stealth Honeypot:** Bots filling invisible fields receive a simulated HTTP 200, believing they succeeded, while 0 emails and 0 quota are consumed.

---

## 🛠️ Core Tech Stack & Tools

| Domain | Technologies |
| :--- | :--- |
| **Programming Languages** | `C++`, `C`, `Java`, `Python`, `JavaScript (ES6+)` |
| **Frontend Frameworks & UI** | `React 18`, `Vite`, `Redux`, `Tailwind CSS`, `HTML5`, `CSS3` |
| **Backend & REST APIs** | `FastAPI`, `Node.js`, `Express.js`, `SQLAlchemy`, `RESTful APIs` |
| **Databases & In-Memory** | `PostgreSQL`, `MongoDB`, `Redis`, `MySQL`, `SQLite` |
| **AI / ML & Data Science** | `Google Gemini AI`, `Machine Learning`, `Scikit-Learn`, `NumPy`, `Pandas`, `OpenCV` |
| **DevOps & Platforms** | `Docker`, `Git`, `GitHub`, `Postman`, `Linux`, `Vercel` |

---

## 📂 Featured Projects & Case Studies

Each project includes interactive case study documentation accessible directly by clicking the project preview cards on the live portfolio:

### 1. 💼 [KaushalNexus](https://calligraphyguruji.dev/#/project/kaushal-nexus) — Employment & Skilling Outcomes Platform
* **Badge:** `SIH 2026 FLAGSHIP`
* **Overview:** A national-scale skilling intelligence platform engineered for Smart India Hackathon 2026 (Problem Statement 135). Features longitudinal learner tracking, AI skill gap diagnostics via Google Gemini, district analytics, and ML job matching.
* **Tech Stack:** `React 19`, `FastAPI`, `PostgreSQL`, `Redis`, `Gemini AI`, `Tailwind CSS`, `TypeScript`
* **Live App:** [kaushal-nexus.vercel.app](https://kaushal-nexus.vercel.app/)
* **Repository:** [github.com/calligraphyguruji/Kaushal-Nexus](https://github.com/calligraphyguruji/Kaushal-Nexus)
* **Interactive Case Study:** [View on Portfolio](https://calligraphyguruji.dev/#/project/kaushal-nexus)

### 2. 💳 [CredVidhi](https://calligraphyguruji.dev/#/project/credvidhi) — Enterprise Loan Processing & Deterministic Underwriting Platform
* **Badge:** `LIVE ON VERCEL`
* **Overview:** An institutional digital loan processing and deterministic credit underwriting platform featuring automated KYC verification, mathematical DTI calculations, a 6-stage finite state machine, and immutable audit compliance.
* **Tech Stack:** `React 19`, `TypeScript`, `FastAPI`, `Python 3.11`, `PostgreSQL 16`, `Redis`, `Tailwind CSS`, `Framer Motion`, `Gemini AI`
* **Live App:** [credvidhi.vercel.app](https://credvidhi.vercel.app/)
* **Repository:** [github.com/calligraphyguruji/CredVidhi](https://github.com/calligraphyguruji/CredVidhi)
* **Interactive Case Study:** [View on Portfolio](https://calligraphyguruji.dev/#/project/credvidhi)

### 3. 🛒 [Amazon E-Commerce Clone](https://calligraphyguruji.dev/#/project/amazon-clone) — Multi-Page Architecture
* **Badge:** `LIVE ON VERCEL`
* **Overview:** A multi-page responsive e-commerce application inspired by Amazon, implementing dynamic catalog rendering, live cart state updates, checkout summary, order history, and package tracking in pure vanilla JavaScript and modular CSS.
* **Tech Stack:** `JavaScript (ES6+)`, `HTML5`, `CSS3 Grid & Flexbox`, `DOM APIs`, `Vercel`
* **Live Demo:** [myecommerce-project-clone.vercel.app](https://myecommerce-project-clone.vercel.app/)
* **Repository:** [github.com/calligraphyguruji/amazon-clone](https://github.com/calligraphyguruji/amazon-clone)
* **Interactive Case Study:** [View on Portfolio](https://calligraphyguruji.dev/#/project/amazon-clone)

### 4. 🎮 [Rock Paper Scissors Game](https://calligraphyguruji.dev/#/project/rock-paper-scissors) — Interactive State Engine
* **Badge:** `LIVE ON VERCEL`
* **Overview:** A classic browser game with player vs computer mechanics, randomized decision engine, instant win/loss/draw detection, dynamic score tracking, and clean tactile animations.
* **Tech Stack:** `JavaScript`, `HTML5`, `CSS3`, `DOM Events`, `Vercel`
* **Live Demo:** [rock-paper-scissors-game-seven-tawny.vercel.app](https://rock-paper-scissors-game-seven-tawny.vercel.app/)
* **Repository:** [github.com/calligraphyguruji/rock-paper-scissors-game](https://github.com/calligraphyguruji/rock-paper-scissors-game)
* **Interactive Case Study:** [View on Portfolio](https://calligraphyguruji.dev/#/project/rock-paper-scissors)

### 5. 🧩 [LeetCode Problem Solutions](https://calligraphyguruji.dev/#/project/leetcode-solutions) — 150+ C++ Solutions
* **Badge:** `150+ PROBLEMS SOLVED`
* **Overview:** A structured repository of 150+ optimized algorithmic solutions across core Data Structures & Algorithms (Trees, Graphs, DP, Linked Lists, Heaps) with Big-O time and space complexity breakdowns.
* **Tech Stack:** `C++`, `STL`, `Data Structures`, `Algorithms`, `Competitive Programming`
* **LeetCode Profile:** [leetcode.com/u/calligraphyguruji](https://leetcode.com/u/calligraphyguruji/)
* **Repository:** [github.com/calligraphyguruji/LeetCode-Questions](https://github.com/calligraphyguruji/LeetCode-Questions)
* **Interactive Case Study:** [View on Portfolio](https://calligraphyguruji.dev/#/project/leetcode-solutions)

### 6. 📺 [YouTube Web Clone](https://calligraphyguruji.dev/#/project/youtube-clone) — High-Fidelity UI
* **Badge:** `RESPONSIVE UI`
* **Overview:** A modern video streaming web application recreating YouTube's core interface patterns: category pill navigation, fluid video listing grid, responsive playback view, and channel metadata sidebar.
* **Tech Stack:** `HTML5`, `CSS3`, `JavaScript`, `Responsive Grid`
* **Repository:** [github.com/calligraphyguruji/YouTube-Clone](https://github.com/calligraphyguruji/YouTube-Clone)
* **Interactive Case Study:** [View on Portfolio](https://calligraphyguruji.dev/#/project/youtube-clone)

---

## 💻 Local Development Setup

Clone the repository and run locally:

```bash
# 1. Clone repository
git clone https://github.com/calligraphyguruji/portfolio.git
cd portfolio

# 2. Install dependencies
npm install

# 3. Configure environment variables (.env)
cp .env.example .env
# Set VITE_TURNSTILE_SITE_KEY, TURNSTILE_SECRET_KEY, and EMAILJS_* credentials

# 4. Run automated anti-spam & API tests
npm test

# 5. Start local development server
npm run dev

# 6. Create production build
npm run build

# 7. Preview production build locally
npm run preview
```

---

## 📬 Contact & Connect

- **Live Website:** [calligraphyguruji.dev](https://calligraphyguruji.dev/)
- **Email:** [amanmishra7774@gmail.com](mailto:amanmishra7774@gmail.com)
- **LinkedIn:** [linkedin.com/in/calligraphygurji](https://www.linkedin.com/in/calligraphygurji/)
- **GitHub:** [github.com/calligraphyguruji](https://github.com/calligraphyguruji)
- **LeetCode:** [leetcode.com/u/calligraphyguruji](https://leetcode.com/u/calligraphyguruji/)

---

## 📄 License

MIT License © [Aman Mishra](https://github.com/calligraphyguruji)
