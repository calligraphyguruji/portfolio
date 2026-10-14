# Mantri Backend API Reference

Base URL (Local): `http://localhost:3001`  
Production Serverless: `https://www.calligraphyguruji.dev/api/copilot`

---

### 1. `GET /api/health`
Returns quick health status.
- **Status Codes**: `200 OK`
- **Response**:
```json
{
  "status": "healthy",
  "version": "2.0.0-local",
  "uptimeSeconds": 42,
  "llmConfigured": true,
  "indexedChunks": 48,
  "features": {
    "hybridRetrieval": true,
    "recruiterMode": true,
    "streaming": true,
    "antiInjection": true
  }
}
```

---

### 2. `GET /api/ai/status`
Returns deep diagnostics of Ollama connectivity, model status, and vector database stats.
- **Status Codes**: `200 OK`
- **Response**:
```json
{
  "status": "healthy",
  "ollama": {
    "available": true,
    "version": "0.5.7",
    "configuredModel": "llama3.2:3b",
    "modelInstalled": true,
    "latencyMs": 4
  },
  "vectorStore": {
    "totalChunks": 48,
    "totalDocuments": 9,
    "embeddingDimension": 768,
    "storagePath": "./data/vector_store.json"
  }
}
```

---

### 3. `GET /api/ai/models`
Lists all models currently installed in the local Ollama daemon.
- **Status Codes**: `200 OK`

---

### 4. `POST /api/chat`
Standard request-response chat endpoint.
- **Headers**: `Content-Type: application/json`
- **Request Body**:
```json
{
  "messages": [
    { "role": "user", "content": "Explain CredVidhi platform architecture." }
  ],
  "conversationId": "conv-a1b2c3d4",
  "recruiterMode": false
}
```
- **Response**:
```json
{
  "answer": "CredVidhi is an institutional loan origination and deterministic credit underwriting platform...",
  "intent": "PROJECT_ARCHITECTURE",
  "citations": [
    {
      "sourceId": "credvidhi-arch-1",
      "title": "CredVidhi System Architecture & Data Flow",
      "url": "https://www.calligraphyguruji.dev/#projects",
      "relevanceScore": 0.94
    }
  ],
  "metadata": {
    "model": "llama3.2:3b",
    "retrievalLatencyMs": 3,
    "totalLatencyMs": 142
  }
}
```

---

### 5. `POST /api/chat/stream`
Server-Sent Events (SSE) streaming endpoint.
- **Headers**: `Content-Type: application/json`
- **Output**: Stream of `data: {"token": "..."}\n\n` ending with `data: [DONE]\n\n`.

---

### 6. `GET /api/conversations`
List saved conversations.
- **Status Codes**: `200 OK`

---

### 7. `GET /api/conversations/:id`
Retrieve messages for a specific conversation session.
- **Status Codes**: `200 OK`

---

### 8. `DELETE /api/conversations/:id`
Delete conversation session and all its messages from SQLite.
- **Status Codes**: `200 OK`

---

### 9. `POST /api/knowledge/ingest` (Admin Only)
Ingest or update a document in the vector store.
- **Headers**: `Authorization: Bearer <ADMIN_API_KEY>`
- **Request Body**:
```json
{
  "id": "new-project",
  "title": "Project Title",
  "content": "Project description and architecture documentation...",
  "category": "project"
}
```

---

### 10. `POST /api/knowledge/reindex` (Admin Only)
Force full re-chunking and re-indexing of all portfolio documents.
- **Headers**: `Authorization: Bearer <ADMIN_API_KEY>`
