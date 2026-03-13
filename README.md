# MainBranch

![Next JS](https://img.shields.io/badge/Next.js-000000?style=flat&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat&logo=mongodb&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
![Cloudinary](https://img.shields.io/badge/Cloudinary-3448C5?style=flat&logo=cloudinary&logoColor=white)

## The Professional Identity for Developers

MainBranch is a comprehensive social platform and portfolio builder designed specifically for software engineers. It aggregates coding activity from across the web (GitHub, LeetCode, Kaggle, HuggingFace) into a single, dynamic profile, allowing developers to showcase their true impact.

## Key Features

### Unified Developer Profile
- **Activity Heatmap**: Visualize coding streaks and activity across multiple platforms.
- **Tech Stack**: Display professional skills and preferred technologies.
- **Stats Integration**: Automatic synchronization of statistics from GitHub, LeetCode, Kaggle, and Hugging Face.
- **Pinned Showcase**: Highlight up to 3 top projects or achievements directly on the profile.

### Social Feed
- **Content Sharing**: Share updates, build-in-public moments, and technical insights.
- **User Mentions**: Tag other developers in posts using @username syntax. Mentions are clickable and navigate to the tagged user's profile.
- **Notifications**: Real-time notifications for mentions, likes, comments, and follows.

### Real-Time Communication
- **Secure Chat**: Direct messaging system powered by Socket.io.
- **Rich Media**: Dedicated support for image sharing with an optimized viewing experience.
- **Interactive Links**: URLs shared in chat are automatically detected and converted into secure, clickable links.
- **Typing Indicators**: Real-time feedback when other connected users are typing.

### Project Showcase
- **Detailed Cards**: Create project-specific cards with rich descriptions and technology tags.
- **Portfolio Management**: Add, edit, and curate a professional portfolio visible to the community.

### Interactive Design
- **Tech-Native UI**: Built from the ground up with a custom dark mode design system.
- **Responsive Layout**: Optimized for various screen sizes, from mobile devices to large desktop monitors.

## Technology Stack

### Frontend
- **Framework**: Next.js 16 (App Router)
- **Library**: React 19
- **Styling**: TailwindCSS with Custom CSS Variables
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **State Management**: React Context, Custom Hooks

### Backend
- **Runtime**: Node.js and Express.js
- **Database**: MongoDB with Mongoose ODM
- **Real-Time Engine**: Socket.io
- **Authentication**: JSON Web Tokens (JWT)
- **File Storage**: Cloudinary integration for persistent, cloud-based image hosting (formerly utilizing local storage).

## Getting Started

### Prerequisites
- Node.js (version 18 or higher)
- MongoDB (Local instance or MongoDB Atlas cluster)
- Cloudinary Account (required for image processing and storage)

### Installation Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/ayoitssmit/MainBranch.git
   cd fsd-project
   ```

2. **Setup the Backend Server**
   Navigate to the server directory and install the required dependencies:
   ```bash
   cd server
   npm install
   ```

   Create a `.env` file in the `server` directory and configure the following required environment variables:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   CLIENT_URL=http://localhost:3000
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   ```

   Start the development server:
   ```bash
   npm run dev
   ```

3. **Setup the Frontend Client**
   Open a secondary terminal window, navigate to the client directory, and install the dependencies:
   ```bash
   cd client
   npm install
   ```

   Create a `.env.local` file in the `client` directory and configure the endpoints:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
   ```

   Start the client application:
   ```bash
   npm run dev
   ```

4. **Access the Application**
   Open `http://localhost:3000` in your web browser. The backend API is hosted concurrently on `http://localhost:5000`.

## API Documentation

The backend API is accessible via the `/api` endpoints. The primary routing structures include:

- `/api/auth`: User authentication, login, and registration.
- `/api/users`: Profile data, portfolio items, and platform statistics.
- `/api/posts`: Social feed management, posts creation, likes, and comments.
- `/api/chat`: Real-time secure messaging and history fetching.
- `/api/notifications`: System alerts and interaction notifications.
- `/api/upload`: Endpoints handling direct image uploads via Cloudinary.

## Contributing

Contributions to MainBranch are actively welcomed. To contribute respectfully, please follow these steps:

1. Fork the project repository.
2. Create your feature branch (`git checkout -b feature/NewFeatureName`).
3. Commit your changes (`git commit -m 'Add NewFeatureName'`).
4. Push to the branch (`git push origin feature/NewFeatureName`).
5. Open a Pull Request for review and integration.

## License

This project is licensed under the MIT License. Please refer to the LICENSE file for exact details.
