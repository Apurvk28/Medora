# Medora — AI-Powered Healthcare Platform 🩺

> *Making healthcare intelligent, accessible, and personal — powered by AI.*

[![React](https://img.shields.io/badge/React-18.x-blue?logo=react)](https://reactjs.org/)
[![Groq AI](https://img.shields.io/badge/Groq-Llama%203.3%2070B-orange)](https://console.groq.com/)
[![Vite](https://img.shields.io/badge/Vite-4.x-purple?logo=vite)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.x-teal?logo=tailwindcss)](https://tailwindcss.com/)

---

## 📌 Problem Statement

In today's healthcare landscape, millions of patients face critical challenges:

- **Lack of Access**: Many people — especially in Tier 2 and Tier 3 cities — cannot easily consult doctors due to distance, cost, or availability.
- **Health Anxiety & Misinformation**: People search generic symptoms on the internet and get overwhelmed with inaccurate, fear-inducing results.
- **No Centralized Patient Tool**: Existing healthcare platforms are either too complex (requiring lab reports, doctor logins, prescriptions) or too basic (only appointment booking).
- **Delayed Medical Action**: Patients often delay visiting a doctor because they don't understand the severity of their symptoms.
- **Fragmented Information**: Finding the right specialist, understanding symptoms, and managing health records are all disconnected experiences.

**Medora solves these problems** by combining AI-driven symptom analysis, comprehensive report generation, and instant city-based doctor discovery — all in one simple, patient-facing application with zero backend complexity.

---

## 💡 Solution

Medora is a **frontend-only, AI-powered healthcare companion** that:
1. Accepts plain English symptom descriptions from patients
2. Uses **Groq's Llama 3.3 70B** model to analyze symptoms and generate structured health reports
3. Allows patients to **download professional PDF reports** to share with doctors
4. Provides **city-based search** to instantly find the top 10 doctors and hospitals near them

---

## 🚀 Key Features

| Feature | Description |
|---|---|
| 🩺 **Healthcare Predict** | Type symptoms in plain English and get a full AI-generated health report |
| 📄 **PDF Health Reports** | Download detailed reports covering conditions, risks, medications, diet, and lifestyle |
| 🏥 **Find a Doctor** | Search any Indian city and get top 10 doctors/hospitals with ratings, timings and contact |
| 🔐 **Patient Auth** | Simple sign up & login with session stored in `localStorage` — no database needed |
| 📜 **Marquee Testimonials** | Auto-scrolling patient reviews from real use-case scenarios |
| 📱 **Fully Responsive** | Works seamlessly across desktop, tablet, and mobile |

---

## 🏗️ System Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                        MEDORA FRONTEND                        │
│                      (React + Vite + TailwindCSS)            │
│                                                              │
│  ┌────────────┐    ┌─────────────────┐    ┌──────────────┐  │
│  │  Auth      │    │ Healthcare       │    │  Find a      │  │
│  │  Context   │    │ Predict Page    │    │  Doctor Page │  │
│  │ (localStorage) │    │ (Symptomchk.jsx)│    │(FindDoctor.jsx)│  │
│  └────────────┘    └────────┬────────┘    └──────┬───────┘  │
│                             │                     │          │
│                    ┌────────▼─────────────────────▼───────┐  │
│                    │           apiKeys.js (ENV Config)    │  │
│                    │  HEALTH_PREDICT_API_KEY               │  │
│                    │  FIND_DOCTOR_API_KEY                  │  │
│                    └────────────────────┬────────────────┘  │
│                                         │                    │
└─────────────────────────────────────────┼────────────────────┘
                                          │ HTTPS REST API
                                          │
                          ┌───────────────▼──────────────────┐
                          │          GROQ CLOUD API           │
                          │   Model: llama-3.3-70b-versatile  │
                          │   Endpoint: /openai/v1/chat/      │
                          │            completions            │
                          └──────────────────────────────────┘
```

---

## 🗺️ System Diagram

```
Patient Opens Medora
        │
        ▼
┌───────────────┐
│  Home Page    │──── Marquee Testimonials, Feature Cards, FAQ
└───────┬───────┘
        │
   ┌────┴────┐
   │  Login  │ ──► LocalStorage Session (name, email, role)
   │ /Signup │
   └────┬────┘
        │
   ┌────▼──────────────────────────────────┐
   │              NAVIGATION               │
   │  Healthcare Predict | Find Dr | Contact│
   └──────┬─────────────────┬──────────────┘
          │                 │
   ┌──────▼──────┐   ┌──────▼──────────┐
   │  Symptom    │   │  Find a Doctor  │
   │  Input Box  │   │  City Search    │
   └──────┬──────┘   └──────┬──────────┘
          │                 │
   ┌──────▼──────┐   ┌──────▼──────────┐
   │ Groq API    │   │ Groq API        │
   │ (Health Key)│   │ (Doctor Key)    │
   └──────┬──────┘   └──────┬──────────┘
          │                 │
   ┌──────▼──────┐   ┌──────▼──────────┐
   │ AI Report   │   │ Doctor Cards    │
   │ (JSON)      │   │ (JSON Array)    │
   └──────┬──────┘   └─────────────────┘
          │
   ┌──────▼──────┐
   │ PDF Download│
   │ (jsPDF +    │
   │  html2canvas)│
   └─────────────┘
```

---

## 🔄 Application Workflow

### 1. Patient Onboarding
```
Visit Medora → Sign Up (name, email, password, gender)
→ LocalStorage saves session → Login → Header shows username
```

### 2. Healthcare Predict Flow
```
Patient types symptoms in plain English
    │
    ▼
Groq API (llama-3.3-70b-versatile) processes prompt
    │
    ▼
AI generates structured JSON report:
  • Possible Conditions
  • Symptom Analysis
  • Risks If Ignored
  • Immediate Steps
  • Precautions
  • Medications & Remedies
  • Dietary Advice
  • Lifestyle Recommendations
  • When to See a Doctor
  • Medical Disclaimer
    │
    ▼
Report rendered on screen in color-coded sections
    │
    ▼
Patient clicks "Download PDF" → jsPDF + html2canvas generates PDF
```

### 3. Find a Doctor Flow
```
Patient enters city name (e.g. "Pune")
    │
    ▼
Groq API generates realistic list of top 10:
  • Multi-specialty hospitals
  • Specialist doctors (Cardio, Ortho, Neuro, etc.)
    │
    ▼
Each card shows:
  • Name, Type, Specialization
  • Address, Phone, Timings
  • Star Rating
  • Available services (Consultation, Emergency, Lab Tests)
    │
    ▼
"Book Appointment" button on each card
```

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend Framework** | React 18 + Vite | UI rendering and build tooling |
| **Styling** | Tailwind CSS 3 | Utility-first responsive design |
| **Routing** | React Router v6 | Client-side page navigation |
| **State Management** | React Context API | Global auth state |
| **Session Storage** | `localStorage` | Persist user login without a database |
| **AI Engine** | Groq API (Llama 3.3 70B) | Health analysis and doctor search |
| **PDF Generation** | jsPDF + html2canvas | Convert report to downloadable PDF |
| **UI Components** | React Icons, React Spinners, React Toastify | Icons, loaders, and toast notifications |
| **Scroll Animations** | CSS `@keyframes` marquee | Testimonial auto-scroll |

---

## 📁 Project Structure

```
medora/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   │   ├── data/         # FAQs, services data
│   │   │   └── images/       # Static assets
│   │   ├── components/
│   │   │   ├── About/
│   │   │   ├── Faq/
│   │   │   ├── Footer/
│   │   │   ├── Header/
│   │   │   └── Testimonial/  # Marquee reviews
│   │   ├── configs/
│   │   │   └── apiKeys.js    # Groq API config (via .env)
│   │   ├── context/
│   │   │   └── AuthContext.jsx  # Global auth state
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Signup.jsx
│   │   │   ├── Contact.jsx
│   │   │   ├── Symptomchk.jsx   # Healthcare Predict
│   │   │   └── Doctors/
│   │   │       ├── FindDoctor.jsx  # AI Doctor Search
│   │   │       └── Doctors.jsx
│   │   ├── routes/
│   │   │   └── Routers.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── .env                  # API Keys (not pushed to git)
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
├── .gitignore
├── readme.md
└── run commands.txt
```

---

## ⚙️ Installation & Setup

### Prerequisites
- Node.js v16 or higher
- A Groq API Key (free at [console.groq.com](https://console.groq.com/))

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/Apurvk28/medora.git
cd medora/frontend

# 2. Install dependencies
npm install

# 3. Create environment file
cp .env.example .env
# OR manually create frontend/.env with:
VITE_HEALTH_PREDICT_API_KEY=your_groq_key_1
VITE_FIND_DOCTOR_API_KEY=your_groq_key_2
VITE_GROQ_API_URL=https://api.groq.com/openai/v1/chat/completions
VITE_GROQ_MODEL=llama-3.3-70b-versatile

# 4. Start development server
npm run dev
```

Open **[http://localhost:5173](http://localhost:5173)** in your browser.

---

## 🔐 Environment Variables

Create a `.env` file inside the `frontend/` directory:

```env
VITE_HEALTH_PREDICT_API_KEY=gsk_your_health_api_key_here
VITE_FIND_DOCTOR_API_KEY=gsk_your_doctor_api_key_here
VITE_GROQ_API_URL=https://api.groq.com/openai/v1/chat/completions
VITE_GROQ_MODEL=llama-3.3-70b-versatile
```

> ⚠️ **Never push your `.env` file to GitHub.** It is already listed in `.gitignore`.

---

## 🎯 Use Cases

1. **A college student** experiencing fatigue and headaches types their symptoms → Gets a detailed PDF report → Shows it to the campus doctor.
2. **A working professional** in a new city needs a cardiologist → Searches "Mumbai" in Find a Doctor → Gets top-rated specialists instantly.
3. **A parent** worried about their child's recurring fever → Uses Healthcare Predict → Gets dietary advice and clear guidance on when to visit the ER.
4. **A senior citizen** wants to understand their symptoms without complex medical jargon → Gets plain-English explanations with actionable steps.

---

## 🧪 API Details

### Healthcare Predict
- **Endpoint**: `POST https://api.groq.com/openai/v1/chat/completions`
- **Model**: `llama-3.3-70b-versatile`
- **Input**: Plain English symptom description
- **Output**: Structured JSON with 10 health report sections

### Find a Doctor
- **Endpoint**: `POST https://api.groq.com/openai/v1/chat/completions`
- **Model**: `llama-3.3-70b-versatile`
- **Input**: City name
- **Output**: Array of 10 doctor/hospital objects with full details

---

## 📄 License

This project is licensed under the MIT License.

---

## 👨‍💻 Author

**Apurv Khairnar**  
GitHub: [@Apurvk28](https://github.com/Apurvk28)

**Kaustubh Patil**  
GitHub: [@patilkaustubh439-ops](https://github.com/patilkaustubh439-ops)

---

*Medora — Empowering patients with AI-driven healthcare intelligence.* 🩺