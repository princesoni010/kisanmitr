# Kisanमित्र (KisanMitr) 🌾

**Smart India Hackathon (SIH) 2026**

Kisanमित्र is a next-generation, AI-powered agricultural policy and subsidy portal designed specifically for Indian farmers. It simplifies the complex world of government schemes, offering personalized scheme matching, real-time voice assistance, and AI-driven fraud protection.

---

## 🌟 Key Features

### 1. 🎙️ AI Voice & Chat Assistant (Multilingual)
- Conversational AI assistant that understands both **Hindi** and **English**.
- Powered by LLMs to answer questions about farming, subsidies, and crop advisories.
- **Voice-to-Text** capabilities allow farmers to speak naturally instead of typing.
- Real-time **Streaming Responses** with a WhatsApp-style typing indicator for a natural chat experience.

### 2. 📄 Smart Document → Scheme Matcher
- Upload documents like **Aadhaar, Land Records (Bhu-naksha), or Income Certificates**.
- Uses **NVIDIA Vision AI** to visually extract key data (e.g., land size, income).
- Automatically cross-references extracted data with a database of 12+ government schemes.
- Provides a personalized list of eligible schemes with detailed AI reasoning.

### 3. 🛡️ AI Fraud Shield
- Protects farmers from malicious scams (e.g., fake PM-KISAN fee requests, OTP scams).
- Paste suspicious SMS texts or upload screenshots of WhatsApp messages.
- AI instantly analyzes the text/image and flags the risk level (High/Medium/Low) with clear safety advice.

### 4. 🌍 Seamless Bilingual Experience
- Global context architecture allows instantaneous switching between **Hindi** and **English** across the entire app.
- Persists user preferences locally.

---

## 🛠️ Tech Stack

### Frontend
- **React.js** (Vite)
- **TypeScript**
- **Tailwind CSS** (for responsive, modern UI)
- **Lucide React** (Icons)
- **React Router** (Navigation)

### Backend
- **FastAPI** (Python)
- **NVIDIA Llama 3.2 Vision-Instruct** (LLM & Vision API)
- **Uvicorn** (ASGI server)

---

## 🚀 Local Setup & Installation

### Prerequisites
- Node.js (v18+)
- Python (3.10+)

### 1. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: .\venv\Scripts\activate
pip install -r requirements.txt
python main.py
```
*The backend will run on `http://localhost:8000`*

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
*The frontend will run on `http://localhost:5173`*

---

## 💡 Why Kisanमित्र?
Government schemes often go underutilized due to complex documentation, language barriers, and lack of awareness. Kisanमित्र bridges this gap by acting as a digital, personalized, and safe companion for every farmer, empowering them to claim what is rightfully theirs.
