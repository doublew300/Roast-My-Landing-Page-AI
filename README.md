# Roast My Landing Page AI 🔥

An intelligent, AI-powered tool that analyzes landing pages and provides brutal, honest, and actionable feedback to help developers and founders improve their conversion rates.

![Project Banner](public/og-image.png)

## 🚀 Overview

**Roast My Landing Page AI** leverages the power of **Google Gemini 1.5 Pro** and **Puppeteer** to visually analyze websites and generate comprehensive critiques. Unlike generic audit tools, this application "sees" the page like a user does, identifying design flaws, copy issues, and UX bottlenecks with human-like perception.

Built with a modern stack focused on performance and scalability, this project demonstrates the integration of multimodal AI agents into a seamless full-stack web application.

## ✨ Key Features

-   **Visual AI Analysis**: Uses Puppeteer to capture full-page screenshots and Google Gemini Vision to analyze the visual hierarchy, design consistency, and aesthetics.
-   **Instant "Roast" & Scoring**: Generates a 0-100 score based on First Impressions, Copywriting, Design, and UX, accompanied by a witty, "no-holds-barred" critique.
-   **Actionable Insights**: Provides specific, prioritized recommendations to fix identified issues.
-   **Real-time Interaction**: Built with Next.js App Router and Server Actions for a snappy, responsive user experience.
-   **Supabase Integration**: Persists roast history and user data securely.

## 🛠️ Tech Stack

-   **Framework**: [Next.js 14](https://nextjs.org/) (App Router, Server Actions)
-   **AI Model**: [Google Gemini 1.5 Pro](https://ai.google.dev/) (Multimodal Vision capabilities)
-   **Database**: [Supabase](https://supabase.com/) (PostgreSQL)
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/) & [Shadcn UI](https://ui.shadcn.com/)
-   **Browser Automation**: [Puppeteer](https://pptr.dev/) (via `@sparticuz/chromium` for serverless support)
-   **Language**: TypeScript

## 🏁 Getting Started

### Prerequisites

-   Node.js 18+
-   Supabase Account
-   Google AI Studio API Key

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/roast-my-landing-page-ai.git
    cd roast-my-landing-page-ai
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Set up Environment Variables**
    Create a `.env` file in the root directory and add the following:
    ```env
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
    GEMINI_API_KEY=your_gemini_api_key
    ```

4.  **Run the development server**
    ```bash
    npm run dev
    ```

    Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
