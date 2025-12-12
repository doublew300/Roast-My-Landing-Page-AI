# Roast My Landing Page AI 🔥

**The Ultimate AI-Powered Landing Page Critic**

> *Will your site survive? Get an instant, brutal AI audit of your UX/UI.*

![Project Banner](public/og-image.png)

## 🚀 Project Overview

**Roast My Landing Page AI** is a cutting-edge web application designed to help developers and founders improve their conversion rates through brutal, honest feedback. By combining computer vision with large language models, it "sees" your website exactly as a user does, identifying design flaws, copy issues, and UX bottlenecks with human-like perception.

Built with a focus on **performance**, **scalability**, and **viral potential**, this project demonstrates the power of multimodal AI agents in solving real-world design challenges.

## ✨ Key Features

- **🤖 Visual AI Analysis**: Integrated with **Google Gemini 1.5 Pro** via the **Google AI SDK** to analyze visual hierarchy, design consistency, and aesthetics.
- **🎭 Multiple Personas**: Get roasted by AI versions of **Gordon Ramsay**, **Steve Jobs**, a **VC Bro**, or a **Gen Z Zoomer**.
- **⚡ Real-time Interaction**: Instant feedback and scoring using **Next.js Server Actions**.
- **📊 Smart Scoring**: Generates a 0-100 score based on First Impressions, Copywriting, Design, and UX.
- **💾 Secure Storage**: Roast history and screenshots are securely persisted using **Supabase**.
- **📱 Fully Responsive**: A sleek, dark-mode interface optimized for all devices.

## 🛠️ Tech Stack

This project leverages the latest and most efficient technologies in the ecosystem:

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router) - For server-side rendering and static generation.
- **Language**: [TypeScript](https://www.typescriptlang.org/) - For type-safe, maintainable code.
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) & [Shadcn UI](https://ui.shadcn.com/) - For rapid, utility-first design.
- **Backend & Database**: [Supabase](https://supabase.com/) - For PostgreSQL database and Storage.
- **AI Integration**: [Google Gemini](https://deepmind.google/technologies/gemini/) - For multimodal generative AI features.
- **Browser Automation**: [Puppeteer](https://pptr.dev/) - For capturing high-fidelity website screenshots (Serverless compatible).
- **Icons**: [Lucide React](https://lucide.dev/) - For beautiful, consistent iconography.
- **Caching**: [Upstash Redis](https://upstash.com/) - For high-performance API response caching.
- **PWA**: Progressive Web App capabilities for installability and offline support.

## 🏗️ System Architecture

The application follows a modern, scalable architecture:

-   **Frontend**: Next.js 14 (App Router) for optimized client-side navigation and UI.
-   **Backend**: Next.js API Routes handling the orchestration between Puppeteer and Gemini.
-   **AI Layer**: Google Gemini 1.5 Pro Vision model processes screenshots and generates critiques based on the selected persona.
-   **Storage**: Supabase Storage for saving roast screenshots and Postgres for metadata.

## 📂 Project Structure

The codebase is organized to promote separation of concerns and scalability:

```
src/
├── app/              # Next.js App Router pages and API endpoints
│   ├── api/          # Backend logic (roast generation, voting)
│   ├── gallery/      # Public gallery of roasts
│   └── page.tsx      # Main landing page
├── components/       # Reusable UI components
├── lib/              # Core utilities and business logic
│   ├── gemini.ts     # AI model configuration and prompting
│   ├── screenshot.ts # Puppeteer screenshot logic
│   ├── supabase.ts   # Database client configuration
│   └── types.ts      # TypeScript interfaces
└── public/           # Static assets
```

## 🔐 Environment Variables

To run this project, you will need to add the following environment variables to your .env file. See `.env.example` for a template.

| Variable | Description |
| :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anonymous public key |
| `GOOGLE_API_KEY` | API Key for Google Gemini AI |

## 🚀 Getting Started

### Prerequisites

-   Node.js (v18 or higher)
-   npm or yarn

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/doublew300/roast-my-landing-page-ai.git
    cd roast-my-landing-page-ai
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Environment Setup:**
    Copy the example environment file and fill in your credentials:
    ```bash
    cp .env.example .env
    ```

4.  **Run the development server:**
    ```bash
    npm run dev
    ```

5.  **Open the app:**
    Visit [http://localhost:3000](http://localhost:3000) in your browser.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 👨‍💻 Developer

**Developed with ❤️ by [doublew300](https://github.com/doublew300)**

I am a passionate Full Stack Developer focused on building high-impact web applications with modern technologies. I specialize in creating intuitive user experiences backed by robust architecture.

---

*Note: This project is a portfolio piece demonstrating proficiency in Next.js, AI Integration, and Cloud Services.*
