# Installation & Setup

## Prerequisites

*   **Node.js**: v18+
*   **MongoDB**: Local instance or Atlas URI
*   **Python**: v3.9+ (For ML Microservice)

## 1. Clone Repository

```bash
git clone https://github.com/Jalpan04/fsd-project.git
cd fsd-project
```

## 2. Server Setup

Navigate to the server directory:

```bash
cd server
npm install
```

Create a `.env` file in `server/`:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/MainBranch
JWT_SECRET=your_jwt_secret
```

Run the server:

```bash
npm run dev
```

## 3. Client Setup

Navigate to the client directory:

```bash
cd client
npm install
```

Create a `.env.local` file in `client/`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

Run the client:

```bash
npm run dev
```

Visit `http://localhost:3000` to view the app.

## 4. ML Service (Start Only if Needed)

Navigate to the root directory (or where `service.py` is located):

```bash
# Install dependencies
pip install fastapi uvicorn firebase-admin google-cloud-firestore python-multipart

# Run Service
uvicorn service:app --reload --port 8000
```
