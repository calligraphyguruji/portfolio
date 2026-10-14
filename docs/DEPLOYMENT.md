# Mantri Deployment & Infrastructure Modes

## Architectural Realism: Two Operating Modes

Visitors accessing the deployed website on `https://www.calligraphyguruji.dev` cannot connect directly to an Ollama daemon running on a private developer laptop (`http://localhost:11434`) unless a reachable proxy or inference server is configured.

To address this, Mantri supports two production modes:

---

## Mode A: Local Full-Stack Development
- **Frontend**: Runs locally via Vite on `http://localhost:5173`.
- **Backend Server**: Runs on `http://localhost:3001` via `npm run server`.
- **Inference Runtime**: Ollama running locally on `http://localhost:11434`.
- **Memory & Storage**: Native SQLite (`data/conversations.sqlite`) & local vector store (`data/vector_store.json`).
- **Configuration**:
  ```env
  VITE_MANTRI_API_URL=http://localhost:3001/api/chat
  OLLAMA_BASE_URL=http://localhost:11434
  ```

---

## Mode B: Public Production Deployment

In production on Vercel:
1. **Frontend Hosting**: Vercel Static Hosting (`https://www.calligraphyguruji.dev`).
2. **Serverless Edge Proxy**: `api/copilot.js` automatically handles routing:
   - If `MANTRI_BACKEND_URL` is set in Vercel environment variables (pointing to an external self-hosted VPS, RunPod, or GPU instance running `server/index.ts` and Ollama), requests are securely proxied.
   - If `MANTRI_BACKEND_URL` is NOT set or the inference server is temporarily offline:
     Mantri executes the serverless deterministic orchestrator directly in Vercel lambda functions, delivering 100% accurate identity responses, interactive resume download cards, project architecture case studies, and recruiter summaries with zero runtime crashes or external paid LLM API keys.

### Setting Up a Dedicated Inference VPS (Optional)
If deploying Mantri's full local LLM to a cloud VPS (e.g. Hetzner, DigitalOcean, RunPod, AWS EC2):
1. Provision an instance with at least 8GB–16GB RAM (or an NVIDIA GPU / Apple Silicon).
2. Install Ollama:
   ```bash
   curl -fsSL https://ollama.com/install.sh | sh
   ollama pull llama3.2:3b
   ollama pull nomic-embed-text
   ```
3. Clone repository and run the Mantri server behind Caddy or Nginx with SSL:
   ```bash
   npm install
   ADMIN_API_KEY="your-secret-token" npm run server
   ```
4. Set Vercel environment variable:
   ```env
   MANTRI_BACKEND_URL=https://ai.calligraphyguruji.dev
   ```
