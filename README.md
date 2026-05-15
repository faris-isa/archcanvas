# ArchCanvas

Intent-driven data pipeline architecting tool with React Flow canvas, Gemini AI recommendations, and Firebase persistence.

Built for **#juaravibecoding**.

## 🚀 Overview

ArchCanvas is a powerful visual tool that simplifies building data pipelines using an intent-driven interface. It leverages Google's Gemini AI to assist users with node selection, parameter configurations, and architectural recommendations, while securely storing pipeline designs in Firebase.

## 🛠️ Tech Stack

**Frontend (`apps/web`):**

- React 19 & React Flow for interactive canvas
- Tailwind CSS for styling
- Zustand for state management
- Vite for fast development

**Backend (`apps/api`):**

- Hono (Node Server)
- Firebase Admin & Firestore for persistence
- Google GenAI & Vertex AI SDKs for AI recommendations

**Workspace:**

- pnpm workspaces for monorepo management
- TypeScript

## 📋 Prerequisites

Before you begin, ensure you have the following installed and configured:

1. **Node.js** (v20+ recommended)
2. **pnpm** (v11+)
3. **Google Cloud / Firebase Project**: You will need a project with Firestore enabled.
4. **Google Gemini API Key / Vertex AI Credentials**: Required for the AI recommendations feature.

## ⚙️ Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/faris-isa/archcanvas.git
cd archcanvas
```

### 2. Install Dependencies

This project uses `pnpm` as its package manager.

```bash
pnpm install
```

### 3. Environment Variables

Set up your environment variables for both the API and Web applications.
You will typically need to create `.env` files in `apps/api` and `apps/web` referencing your Firebase configuration and Gemini API credentials. (Refer to any `.env.example` files if available).

### 4. Run the Development Server

You can start up both the frontend and backend development servers concurrently from the root directory:

```bash
pnpm dev
```

- The **frontend canvas** will typically be available at `http://localhost:5173`
- The **backend API** will typically be available at `http://localhost:3000`

## 🤝 Contributing

Contributions are welcome! Please ensure you create a branch and test your changes before opening a pull request.
