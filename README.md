# 🍳 Roast My Landing Page AI

![Project Banner](public/og-image.png)

> "A viral app that uses Computer Vision (Gemini Pro) to critique websites in the style of Steve Jobs & Gordon Ramsay."

**Roast My Landing Page AI** leverages the power of **Google Gemini 3 Pro** and **Puppeteer** to visually analyze websites and generate comprehensive critiques. Unlike generic audit tools, this application "sees" the page like a user does, identifying design flaws, copy issues, and UX bottlenecks with human-like perception.

## ✨ Key Features

-   **Visual AI Analysis**: Uses Puppeteer to capture full-page screenshots and Google Gemini Vision to analyze the visual hierarchy, design consistency, and aesthetics.
-   **Instant "Roast" & Scoring**: Generates a 0-100 score based on First Impressions, Copywriting, Design, and UX, accompanied by a witty, "no-holds-barred" critique.
-   **Actionable Insights**: Provides specific, prioritized recommendations to fix identified issues.
-   **Real-time Interaction**: Built with Next.js App Router and Server Actions for a snappy, responsive user experience.
-   **Supabase Integration**: Persists roast history and user data securely.

## 🛠️ Tech Stack

-   **Next.js 14** (App Router, Server Actions)
-   **Google Gemini Vision API** (Multimodal AI)
-   **Puppeteer** (Serverless / Chromium)
-   **Supabase** (PostgreSQL + RLS)
-   **TypeScript** (Strict typing)
-   **Tailwind CSS** (Styling)

## 🏁 How to Run

1.  **Clone & Install**
    ```bash
    git clone https://github.com/yourusername/roast-my-landing-page-ai.git
    cd roast-my-landing-page-ai
    npm install
    ```

2.  **Set up Environment**
    Copy `.env.example` to `.env` and fill in your keys:
    ```bash
    cp .env.example .env
    ```

3.  **Run**
    ```bash
    npm run dev
    ```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
