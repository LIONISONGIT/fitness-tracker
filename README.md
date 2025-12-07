# Fitness Tracker - Vercel Deployment Ready

This project is structured as a Monorepo with a React Frontend (`client`) and an Express Backend (`server`) configured for Vercel Serverless Functions.

## 📁 Structure

-   `client/`: React + Vite application (Frontend).
-   `server/`: Express application (Backend API).
-   `vercel.json`: Configuration mapping `/api/*` to the server and `/*` to the client.

## 🚀 How to Deploy on Vercel

1.  **Push to GitHub**: Commit and push this updated code to your repository.
2.  **Import to Vercel**:
    -   Go to [Vercel](https://vercel.com/new).
    -   Import your repository.
    -   **Root Directory**: Leave as `./`.
    -   **Framework Preset**: Vercel should detect `Vite` or `Other`. If asked for `client` build settings, ensure it runs `npm run build` inside `client`. *Note: The `vercel.json` usually handles the routing.*
    
3.  **Database Setup (Postgres)**:
    -   In the Vercel Project Dashboard, go to **Storage**.
    -   Click **Create Database** -> **Postgres**.
    -   Follow steps to create it and click **Connect**.
    -   This will automatically add `POSTGRES_URL`, `POSTGRES_USER`, etc., to your Environment Variables.

4.  **AI Setup (Gemini)**:
    -   Get a free API Key from [Google AI Studio](https://aistudio.google.com/app/apikey).
    -   In Vercel Project Dashboard, go to **Settings** > **Environment Variables**.
    -   Add a new variable:
        -   **Key**: `GEMINI_API_KEY`
        -   **Value**: *your_api_key_here*

5.  **Deploy**: Vercel might trigger a deployment automatically. If not, trigger one.
    -   Once deployed, the `initDb` function in the server will run on the first request and create the `logs` table.

## 🛠 Local Development

To run locally, you need to run both client and server.

1.  **Server**:
    ```bash
    cd server
    npm install
    cp .env.example .env
    # Edit .env to add your GEMINI_API_KEY and a local POSTGRES_URL (or the Vercel one)
    npm run dev
    ```
    *Server runs on localhost:3000*

2.  **Client**:
    ```bash
    cd client
    npm install
    npm run dev
    ```
    *Client runs on localhost:5173 (proxies /api to 3000)*
