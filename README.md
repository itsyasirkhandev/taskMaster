# TaskMaster - A Next.js & Firebase Task Management App

TaskMaster is a modern, responsive task management application built with Next.js, Firebase, and ShadCN UI. It allows users to manage their daily tasks using the Eisenhower Matrix methodology, categorizing them into four quadrants to help prioritize what's most important.

## Live Demo

**[🚀 View Live Demo](https://basic-taskmanagment.netlify.app/)**

## Screenshots

**Main Dashboard**
![TaskMaster Dashboard](https://i.postimg.cc/hGwjfvMz/Screenshot-3-10-2025-101157-basic-taskmanagment-netlify-app.jpg)

**Authentication Page**
![Task Creation](https://i.postimg.cc/yN5dkxn1/Screenshot-3-10-2025-101517-basic-taskmanagment-netlify-app.jpg)


## Features

-   **Secure Google Authentication**: Easy and secure user sign-in/sign-up with Firebase Authentication.
-   **Real-time Task Management**: Create, edit, and delete tasks with changes reflected instantly thanks to Firestore's real-time database.
-   **Eisenhower Matrix Prioritization**: Organize tasks into four categories:
    -   Urgent & Important
    -   Not Urgent & Important
    -   Urgent & Not Important
    -   Not Urgent & Not Important
-   **Responsive Design**: A clean and intuitive interface that works seamlessly on desktop and mobile devices.
-   **Protected Routes**: User-specific data is protected, and only authenticated users can access the main application.
-   **Toast Notifications**: User-friendly feedback for actions like adding, updating, or deleting tasks.


## Tech Stack

-   **Framework**: [Next.js](https://nextjs.org/) (App Router)
-   **Backend**: [Firebase](https://firebase.google.com/) (Authentication & Firestore)
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
-   **UI Components**: [ShadCN UI](https://ui.shadcn.com/)
-   **State Management**: React Hooks & Context API
-   **Form Handling**: [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/) for validation


## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

-   Node.js (v18 or higher)
-   npm, yarn, or pnpm

### Installation

1.  **Clone the repository:**
    ```sh
    git clone <your-repo-url>
    ```

2.  **Install dependencies:**
    ```sh
    npm install
    ```

3.  **Set up environment variables:**
    Create a `.env.local` file in the root of your project and add your Firebase project configuration:
    ```
    NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
    NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
    ```

4.  **Run the development server:**
    ```sh
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.


## Author

This project was created by **Yasir Khan**.

-   **Portfolio**: [yasir.qzz.io](https://yasir.qzz.io)
-   **GitHub**: [@yasir-kh](https://github.com/yasir-kh)
