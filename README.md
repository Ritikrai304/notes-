# AI-Enabled Notes Organizer

A modern, full-stack notes organizer powered by AI for automatic summarization and tagging.

## Features
- **Smart Notes**: Create, edit, and delete notes with ease.
- **AI Enhancement**: Automatically generate summaries and relevant tags for your notes using Google Gemini AI.
- **Instant Search**: Find any note by its title, content, or tags.
- **Local Storage**: Your notes stay on your device.
- **Beautiful UI**: Modern design with dark mode support.

## Tech Stack
- **Framework**: [Next.js](https://nextjs.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **AI SDK**: [Google Generative AI](https://ai.google.dev/)

## Getting Started

1. Clone the project.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up your environment variables:
   - Copy `.env.local.example` to `.env.local`.
   - Add your `GEMINI_API_KEY` from [Google AI Studio](https://aistudio.google.com/).
4. Run the development server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) in your browser.
