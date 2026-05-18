# Medora Frontend — AI-Powered Healthcare Platform 🩺

This directory contains the standalone React + Vite frontend for **Medora**. It is fully powered by AI (Groq Llama 3.3 70B) with zero backend or database dependencies required!

---

## ⚙️ Installation & Setup (Step-by-Step Guide)

We have designed Medora to be incredibly simple to clone and run.

### Prerequisites
- **Node.js**: v16 or higher installed on your machine.
- **Groq API Key**: Get a free API key instantly at [console.groq.com/keys](https://console.groq.com/keys).

### Step-by-Step Setup

```bash
# 1. Clone the repository (if you haven't already)
git clone https://github.com/Apurvk28/medora.git

# 2. Navigate into the frontend directory
cd medora/frontend

# 3. Install all required dependencies
npm install

# 4. Set up your Environment Variables
# Copy the provided example environment file to create your own .env file
cp .env.example .env

# 5. Open the newly created .env file in your editor and paste your Groq API key:
# VITE_HEALTH_PREDICT_API_KEY=gsk_your_actual_key_here
# VITE_FIND_DOCTOR_API_KEY=gsk_your_actual_key_here

# 6. Start the development server
npm run dev
```

Once running, open your browser and navigate to **[http://localhost:5173](http://localhost:5173)**.

---

## 🔐 Environment Variables Explained

Medora uses Vite environment variables. We have provided a ready-to-use `.env.example` file.

When you copy `.env.example` to `.env`, you will see the following structure:

```env
# 1. GROQ AI API KEYS (REQUIRED)
VITE_HEALTH_PREDICT_API_KEY=gsk_your_groq_api_key_here
VITE_FIND_DOCTOR_API_KEY=gsk_your_groq_api_key_here

# Groq API Endpoint & Model (Defaults are already configured in code, but can be overridden here)
VITE_GROQ_API_URL=https://api.groq.com/openai/v1/chat/completions
VITE_GROQ_MODEL=llama-3.3-70b-versatile

# 2. CLOUDINARY CONFIGURATION (OPTIONAL)
# Required only if you want to enable profile image uploads. Otherwise, a local fallback works automatically!
VITE_CLOUD_NAME=your_cloudinary_cloud_name
VITE_UPLOAD_PRESET=your_cloudinary_upload_preset
```

### 💡 Why Medora is Foolproof:
- **Zero-Config Defaults**: The codebase (`src/configs/apiKeys.js`) automatically falls back to the correct Groq API endpoints and Llama 3.3 model if you don't specify them in `.env`. You literally only need to supply your API keys!
- **Optional Cloudinary**: If you don't configure Cloudinary keys, `uploadCloudinary.js` gracefully falls back to generating local mock URLs so you can still test uploading profile pictures without errors.
- **Secure**: Your `.env` file is safely ignored in `.gitignore`, preventing accidental commits of your private keys.
