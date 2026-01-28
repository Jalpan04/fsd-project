# System Architecture

## Overview

MainBranch is a "Tech-Native" social platform for developers, integrating their digital footprint (GitHub, LeetCode, Kaggle, HuggingFace) into a single dynamic profile.

## Tech Stack

### Frontend (Client)
*   **Framework**: Next.js 14 (App Router)
*   **Language**: TypeScript
*   **Styling**: TailwindCSS + Custom "Tech-Native" Design System
*   **State Management**: React Context (Auth, Socket)
*   **Real-time**: Socket.IO Client

### Backend (Server)
*   **Runtime**: Node.js
*   **Framework**: Express.js
*   **Database**: MongoDB (Mongoose ODM)
*   **Real-time**: Socket.IO Server
*   **Auth**: JWT (JSON Web Tokens)

### Microservice (ML/Resume)
*   **Framework**: FastAPI (Python)
*   **Purpose**: AI-powered resume generation and PDF rendering.

## Directory Structure

```
/
├── client/                 # Next.js Frontend
│   ├── src/app/            # App Router Pages
│   ├── src/components/     # Reusable UI Components
│   └── src/lib/            # Utilities (API, Utils)
├── server/                 # Express Backend
│   ├── models/             # Mongoose Schemas
│   ├── routes/             # API Routes
│   └── controllers/        # Business Logic
└── docs/                   # Project Documentation
```

## Key Features

1.  **Unified Profile**: Aggregates stats from 4+ platforms.
2.  **Activity Heatmap**: GitHub-style contribution graph for *all* dev activity.
3.  **Real-time Chat**: Instant messaging with image support.
4.  **Project Showcase**: Rich portfolio display with image galleries.
