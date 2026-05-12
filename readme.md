# Medora — AI-Powered Healthcare Platform 🩺

Medora is a modern, patient-centric AI healthcare application designed to make medical guidance and doctor discovery intelligent, fast, and accessible. Built with React and powered by the Groq Llama 3 AI, Medora eliminates the complexity of traditional health platforms by providing direct, plain-English symptom analysis and localized doctor search.

## 🚀 Key Features

- **Healthcare Predict**: Describe your symptoms in plain, natural English. Our Groq-powered AI (Llama-3.3-70b) generates a comprehensive, structured health report instantly.
- **AI Health Reports**: Get detailed information on possible conditions, symptom analysis, risks, immediate steps, precautions, and dietary advice.
- **PDF Generation**: Download your AI-generated health reports as professional PDFs to share with your family or doctor.
- **Find a Doctor**: Search for the top 10 doctors and multi-specialty hospitals in any city (e.g., Pune, Mumbai, Delhi). Get ratings, specializations, and contact details in seconds.
- **Patient-Only Authentication**: Simplified, secure authentication for patients with local session management (no heavy database dependency).
- **Responsive & Premium Design**: A stunning, modern UI with smooth animations, marquee testimonials, and a clean healthcare aesthetic.

## 🛠️ Technology Stack

- **Frontend**: React.js, Tailwind CSS
- **AI Engine**: Groq API (Meta Llama 3.3 70B)
- **PDF Engine**: jsPDF, html2canvas
- **Routing**: React Router v6
- **State Management**: React Context API (AuthContext)
- **Icons**: React Icons (Hi, Bs, Ai)

## 📦 Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- Groq API Key

### Steps

1. **Clone the repository**:
   ```bash
   git clone https://github.com/patilkaustubh439-ops/medora.git
   ```

2. **Navigate to the frontend directory**:
   ```bash
   cd medora/frontend
   ```

3. **Install dependencies**:
   ```bash
   npm install
   ```

4. **Configure API Keys**:
   Update `src/configs/apiKeys.js` with your Groq API keys.

5. **Run the application**:
   ```bash
   npm run dev
   ```

## 📄 License
This project is licensed under the MIT License.

---
*Created by Kaustubh Patil — Empowering healthcare through AI.*