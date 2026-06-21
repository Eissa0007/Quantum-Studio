---
title: Quantum Studio
emoji: 🌌
colorFrom: purple
colorTo: indigo
sdk: docker
app_port: 7860
pinned: false
---

# Quantum Studio v7.0 "Collective"

Quantum Studio is a cloud-based collaborative design engine for spatial and vector graphics. 

This repository is configured specifically for **Hugging Face Spaces** Docker deployment. It runs an internal backend node providing CRDT mesh networks via WebSockets and Nginx handling the static frontend and acting as a reverse-proxy—all mapped strictly to port `7860`.

## Architecture Details for Hugging Face

To comply with Hugging Face Space security protocols:
- **Port Compliance**: Only port `7860` is exposed. 
- **Server Internalization**: The Express/Hocuspocus backend is strictly bound to `127.0.0.1:3001` to prevent unauthorized side-channel requests. Nginx intercepts traffic on `7860` and proxies the `/collab` path internally to `3001`.
- **Gzip & Caching**: Pre-configured in `nginx.conf` for optimized multi-asset delivery.

## Local Development
If running locally:
1. `npm install`
2. Run backend manually, or `npm run dev` for frontend. Note that local dev server proxy points `/collab` to port `7860`, so Nginx would need to be running, or update `vite.config.ts` dev server proxy to target the backend directly.

## Environment Variables
The following secrets should be placed in your Space settings:

| Variable | Description |
| --- | --- |
| `GEMINI_API_KEY` | Key for GenAI suggestions and predictive layouts |
| `SUPABASE_URL` | Application configuration data store |
| `SUPABASE_KEY` | Service access key |

## License
MIT
