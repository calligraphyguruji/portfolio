# Mantri Troubleshooting Guide

### 1. "Ollama connection refused" or "Failed to connect to localhost:11434"
- **Cause**: Ollama daemon is not running on your machine.
- **Fix**: Run `ollama serve` in a terminal window, or start the Ollama desktop app.
- **Verification**: Run `curl http://localhost:11434/api/version`. It should return `{"version":"..."}`.

### 2. "Model 'llama3.2:3b' not found"
- **Cause**: Model hasn't been pulled into local Ollama storage.
- **Fix**: Run `ollama pull llama3.2:3b`.
- **Alternative**: Change `OLLAMA_MODEL` in `.env` to any model you already have (e.g. `phi3:mini`, `mistral:7b`).

### 3. Out of Memory / System Thrashing during Generation
- **Cause**: The selected model is too large for your system's unified memory / RAM.
- **Fix**: Switch to a smaller quantized model:
  - For 8GB RAM machines: use `llama3.2:3b` or `phi3:mini`.
  - Avoid 13B+ models without dedicated GPU VRAM.

### 4. Admin Endpoints Return HTTP 401 Unauthorized
- **Cause**: `ADMIN_API_KEY` header is missing or does not match `.env`.
- **Fix**: Pass `Authorization: Bearer <your-key>` in your curl request.

### 5. Fallback Responses When Ollama is Offline
- When Ollama is not running, Mantri will automatically engage its deterministic local engine instead of throwing an unhandled connection error.
- All core identity questions, resume delivery requests, CredVidhi architecture queries, and recruiter evaluations continue to work seamlessly.
