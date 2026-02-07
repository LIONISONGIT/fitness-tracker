# 🦁 FACON - Next Gen Fitness Command Center

![Status](https://img.shields.io/badge/Status-Operational-green)
![Tech](https://img.shields.io/badge/Tech-React%20%7C%20Node%20%7C%20AI-blue)
![Theme](https://img.shields.io/badge/Theme-Light%20%26%20Dark-orange)

Welcome to **FACON**, your personal AI-powered fitness command center. 

Designed for high achievers who demand precision and aesthetics, FACON combines advanced tracking capabilities with a futuristic interface to help you dominate your health goals.

## ✨ Key Features

*   **🎨 Dynamic Theming**: Switch seamlessly between a sleek **Dark Mode** (Default) and a vibrant **Light Mode** ("Facon Green").
*   **🤖 AI Food Logger**: Just type what you ate (e.g., "2 eggs and toast"), and our integrated AI (Mistral/Gemini) will instantly calculate calories and macros.
*   **📊 Interactive Dashboard**: Visualize your progress with real-time charts for calorie intake, macro distribution, and weight trends.
*   **🧮 Smart Tools**:
    *   **Calorie Calculator**: Determine your BMR and TDEE with precision.
    *   **Time Estimator**: Predict exactly when you'll reach your weight goals based on your deficit.
    *   **Journey Tracker**: Log your weight history and see your transformation over time.
*   **💬 AI Coach**: Chat with your personal fitness assistant for advice, motivation, and quick tips.

## 🛠️ Tech Stack

*   **Frontend**: React, Vite, Tailwind CSS, Recharts
*   **Backend**: Node.js, Express
*   **Database**: PostgreSQL
*   **AI**: Google Gemini Pro (via API)

## 🚀 Getting Started

### Prerequisites

*   Node.js (v18+)
*   PostgreSQL (Local or Cloud)
*   Google Gemini API Key

### Installation

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/yourusername/facon.git
    cd facon
    ```

2.  **Install Dependencies**:
    ```bash
    # Install server dependencies
    cd server
    npm install

    # Install client dependencies
    cd ../client
    npm install
    ```

3.  **Environment Setup**:
    *   Create a `.env` file in `server/` with:
        ```env
        PORT=3000
        DATABASE_URL=postgres://user:password@localhost:5432/facon
        GEMINI_API_KEY=your_api_key_here
        ```

4.  **Run the App**:
    ```bash
    # Terminal 1 (Server)
    cd server
    npm run dev

    # Terminal 2 (Client)
    cd client
    npm run dev
    ```

5.  **Access**: Open `http://localhost:5173` in your browser.

## 🔐 Credentials (Demo)

*   **Username**: `lion`
*   **Password**: `lion36`

---

*Verified and Deployed by Nabhya Singh.*
