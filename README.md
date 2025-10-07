# NextStep

NextStep is a modern, personal job application tracker designed to help you manage your job search efficiently. Keep all your application details, timelines, and important dates in one organized place.

## ✨ Features

- **Dashboard Overview**: Get a quick overview of your job search with key metrics like total applications, offers received, average response time, and active applications.
- **Detailed Application Tracking**: Log and manage all your job applications, including details like job title, company, source, status, salary, and location.
- **Interactive Charts**: Visualize your progress with charts for applications per week, applications by source, and a complete hiring funnel from application to offer.
- **Application Timeline**: Each application has a detailed chronological timeline, allowing you to track every event, from initial application to final offer or rejection.
- **Calendar View**: See all your scheduled interviews, online assessments, and follow-ups in a clean, agenda-style calendar.
- **Google Calendar Integration**: Add any scheduled event to your Google Calendar with a single click.
- **User Profile Management**: Update your display name and manage your account settings.
- **Secure Authentication**: User authentication is handled securely via Firebase Authentication with Google Sign-In.

## 🚀 Tech Stack

This application is built with a modern, robust, and scalable tech stack:

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **UI Library**: [React](https://react.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [ShadCN UI](https://ui.shadcn.com/)
- **Database**: [Cloud Firestore](https://firebase.google.com/docs/firestore)
- **Authentication**: [Firebase Authentication](https://firebase.google.com/docs/auth)
- **AI**: [Genkit](https://firebase.google.com/docs/genkit)
- **Charting**: [Recharts](https://recharts.org/)
- **Forms**: [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/)

## 🛠️ Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm or yarn

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd <repository-directory>
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up Firebase:**
    - Create a Firebase project in the [Firebase Console](https://console.firebase.google.com/).
    - Enable **Firestore** and **Firebase Authentication** (with the Google provider).
    - In your project settings, add a new Web App.
    - Copy the Firebase configuration object and paste it into `src/lib/firebase.ts`.

4.  **Set up Environment Variables:**
    - Create a `.env` file in the root of the project. If you are using Genkit with Google AI, you will need to add your API key:
      ```
      GEMINI_API_KEY=your_google_ai_api_key
      ```

### Running the Development Server

To run the application in development mode, use the following command:

```bash
npm run dev
```

This will start the Next.js development server, typically on [http://localhost:3000](http://localhost:3000).

## 📄 Scripts

- `npm run dev`: Starts the Next.js development server.
- `npm run build`: Creates a production-ready build of the application.
- `npm run start`: Starts the production server.
- `npm run lint`: Lints the codebase for errors.
