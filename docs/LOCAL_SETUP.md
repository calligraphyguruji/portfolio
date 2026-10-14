# Mantri Local Setup & Developer Guide

## Prerequisites

- **Node.js**: v22+ (v26 recommended for native `node:sqlite`).
- **Ollama**: Download and install from [ollama.com](https://ollama.com) or via Homebrew on macOS (`brew install ollama`).
- **RAM / VRAM Requirements**:
  - Entry Tier (8GB RAM): `llama3.2:3b` (~2.0 GB VRAM)
  - Standard Tier (16GB RAM): `llama3.1:8b` (~4.7 GB VRAM)
  - Embedding Model: `nomic-embed-text` (~274 MB)

---

## 1. Quick Start

### Step 1: Install Ollama & Pull Models
```bash
# Start Ollama service
ollama serve

# In another terminal, pull recommended lightweight models:
ollama pull llama3.2:3b
ollama pull nomic-embed-text
```

### Step 2: Configure Environment
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Default parameters are pre-configured:
```env
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2:3b
EMBEDDING_MODEL=nomic-embed-text
MANTRI_PORT=3001
VITE_MANTRI_API_URL=http://localhost:3001/api/chat
```

### Step 3: Start the Backend AI Engine
```bash
npm run server
```
The server will start on `http://localhost:3001` with:
- Health check: `http://localhost:3001/api/health`
- AI diagnostics: `http://localhost:3001/api/ai/status`

### Step 4: Start Frontend Development Server
In a separate terminal:
```bash
npm run dev
```
Open `http://localhost:5173` in your browser. Click the floating **Ask Mantri** button to start chatting!

---

## 2. Running Automated Tests

Run the full end-to-end test suite (76 tests covering health, providers, memory, tools, and endpoints):
```bash
npm test
```

Build production assets:
```bash
npm run build
```
