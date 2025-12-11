# ForgeIQ Deployment Guide

This guide details how to deploy ForgeIQ to **Google Cloud Run** and **Vercel** (via GitHub).

## Option 1: Vercel (Recommended for GitHub)

Vercel is the industry standard for deploying frontend applications like this directly from GitHub.

1.  **Push to GitHub**
    *   Create a repository on GitHub.
    *   Push your code:
        ```bash
        git init
        git add .
        git commit -m "Initial commit"
        git branch -M main
        git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
        git push -u origin main
        ```

2.  **Deploy on Vercel**
    *   Go to [vercel.com](https://vercel.com) and log in.
    *   Click **"Add New..."** → **"Project"**.
    *   Import your GitHub repository.
    *   Vercel will auto-detect **Vite**.

3.  **Environment Variables (Important)**
    *   In the project configuration screen, find **Environment Variables**.
    *   Add:
        *   **Key**: `API_KEY`
        *   **Value**: `[Your Gemini API Key]`
    *   Click **Deploy**.

---

## Option 2: Google Cloud Run

We use the included `Dockerfile` to build a production image served by Nginx.

### Prerequisites
*   [Google Cloud CLI](https://cloud.google.com/sdk/docs/install) installed.
*   A Google Cloud Project with billing enabled.

### Deployment Steps

1.  **Authenticate & Config**
    ```bash
    gcloud auth login
    gcloud config set project [YOUR_PROJECT_ID]
    ```

2.  **Enable APIs**
    ```bash
    gcloud services enable cloudbuild.googleapis.com run.googleapis.com
    ```

3.  **Build Container**
    *Note: Vite requires the API key at build time to bake it into the frontend code.*
    
    ```bash
    gcloud builds submit --tag gcr.io/[YOUR_PROJECT_ID]/forge-iq \
      --build-arg API_KEY=[YOUR_GEMINI_API_KEY] .
    ```

4.  **Deploy Service**
    ```bash
    gcloud run deploy forge-iq \
      --image gcr.io/[YOUR_PROJECT_ID]/forge-iq \
      --platform managed \
      --region us-central1 \
      --allow-unauthenticated
    ```

5.  **Access**
    *   Click the Service URL provided in the terminal (e.g., `https://forge-iq-xyz.a.run.app`).

### Troubleshooting Cloud Run
*   **Port Issues**: The `Dockerfile` is configured to expose port `8080`, which is the Cloud Run default.
*   **Routing Issues**: The custom Nginx config in the `Dockerfile` handles client-side routing (SPA fallback).
