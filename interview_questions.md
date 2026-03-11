# MainBranch Intern Interview Questions

Welcome to the MainBranch engineering interview! Today, we'll dive into the architecture and underlying technologies of our platform. Our application is a unified developer profile aggregator and social platform built using the MERN stack with Next.js 16 and WebSockets.

Here are a series of technical questions directly related to our tech stack and architecture.

---

### Question 1: Optimizing Third-Party External API Calls
**Question:** 
MainBranch aggregates coding activity from several platforms at once: GitHub, LeetCode, Kaggle, and HuggingFace. If a user loads their unified profile, we need to fetch data from all these sources. How would you design this data aggregation on the backend to ensure the page loads quickly, while also preventing us from hitting API rate limits?

**Answer:**
To optimize data fetching, I would execute the API requests concurrently using `Promise.all()` (or `Promise.allSettled()`) in Node.js instead of awaiting them sequentially. This ensures the longest API call determines the total wait time, rather than the sum of all durations.
To address rate limiting and repeated hits, I would implement a caching layer (e.g., Redis). When a user profile is requested, the server first checks the cache. If fresh data exists, it is returned instantly. If not, the server fetches the data from the external APIs, sends the response to the client, and updates the cache with a defined Time-To-Live (TTL). Additionally, we can schedule background jobs to periodically refresh the data for active users rather than doing it strictly on-demand.

---

### Question 2: Real-time Communication Architecture
**Question:** 
Our project features a secure real-time messaging system with typing indicators powered by Socket.io. Could you explain the difference between a traditional HTTP request and a WebSocket connection? Why is WebSocket/Socket.io the preferred choice for these specific chat features?

**Answer:**
A traditional HTTP connection is stateless and unidirectional: the client requests data, the server responds, and the connection typically closes. For real-time updates using HTTP, the client would have to constantly "poll" the server, which is inefficient and generates high overhead.
A WebSocket, which Socket.io utilizes under the hood, provides a persistent, full-duplex (bi-directional) communication channel over a single TCP connection. Once the handshake is complete, both the server and the client can freely push messages to each other at any time with minimal overhead. This is perfect for our chat system and typing indicators, as the server can instantly push a "new message" or "user is typing" event to the client without waiting for the client to ask for it.

---

### Question 3: Next.js App Router and Rendering
**Question:** 
We built the frontend for MainBranch using Next.js 16 (App Router). Can you explain the concept of React Server Components (RSCs) and elaborate on what benefits they bring to a social networking application like ours?

**Answer:**
React Server Components (RSCs) allow developers to render components entirely on the server, sending only the resulting static HTML and lightweight UI representation to the client without the accompanying JavaScript bundle. 
In a social app like MainBranch, this is highly beneficial because:
1. **Performance/Bundle Size:** The JavaScript required for heavy dependencies (like markdown parsing or date formatting for posts) remains on the server, significantly reducing the client bundle size and improving the initial page load speed.
2. **Direct Backend Access:** Next.js Server Components can read directly from our local databases or internal APIs seamlessly without exposing those endpoints or credentials to the browser.
3. **SEO:** For public profiles and project showcases, server-rendered content allows search engine web crawlers to instantly parse the HTML without needing to execute JavaScript first.

---

### Question 4: Authentication Security
**Question:** 
The backend handles authentication via JSON Web Tokens (JWT). Briefly explain how a JWT works. Furthermore, what strategies would you use to securely store the JWT on the client side (React) to protect our users against attacks like Cross-Site Scripting (XSS)?

**Answer:**
A JWT is a compact, URL-safe token that consists of three parts: a header, a payload (containing claims like the user ID), and a signature configured using our `JWT_SECRET`. Once a user logs in, the server generates this signed token and sends it back. For every subsequent request, the client includes the JWT to prove its identity; the server verifies the signature without needing to do a database lookup for session data.
To securely store a JWT and protect against XSS attacks, the token should **not** be stored in `localStorage` or `sessionStorage`, as those are easily accessible by any malicious JavaScript running on the page. Instead, the JWT should be stored in an **`HttpOnly` cookie**. This prevents client-side JavaScript from accessing it entirely, heavily mitigating XSS risks. To protect against Cross-Site Request Forgery (CSRF), `SameSite=Strict` (or `Lax`) attributes must also be configured on the cookie.

---

### Question 5: MongoDB Schema Design - Social Feed
**Question:** 
MainBranch has a social feed feature where developers can post content and comment. When designing the database schemas in MongoDB using Mongoose, you have the option to embed comments directly inside the `Post` document as an array or reference them in a separate `Comment` collection. What are the trade-offs, and which approach do you think fits our platform best?

**Answer:**
Embedding comments as an array of objects inside the `Post` document provides fast read performance, as retrieving the post instantly retrieves all comments in a single query. However, MongoDB has a strict 16MB document size limit. If a post goes viral and accumulates thousands of comments, the document could exceed this limit. Also, performance degrades when constantly rewriting giant documents just to add one comment.
Referencing comments in a separate `Comment` collection prevents the document size limit issue and scales infinitely. However, it requires an extra query (or `$lookup`/`.populate()`) to fully load a post and its comments.
For a social platform, **referencing is the better approach**. While early platforms might embed to save queries, an unbounded list (like comments on a viral post) is a textbook anti-pattern for embedding in MongoDB. I would store comments in a separate collection with a `postId` reference, and paginate the comments query for optimal performance.

---

### Question 6: File Storage and Profile Optimization
**Question:** 
Our app uses Multer for local file storage (e.g., uploading profile pictures and project assets). As an intern seeking to improve the app, what are the potential scalability issues with storing files locally on the backend server, and how would you propose fixing them?

**Answer:**
Storing files locally on the NodeJS server directory creates several immediate scalability problems:
1. **Server Storage Limits:** Eventually, user uploads will consume all available disk space on our host server, causing a crash.
2. **Horizontal Scaling Issues:** If we deploy multiple instances of our backend behind a load balancer to handle increased traffic, an image uploaded to Server A will be completely missing and return a 404 when requested from Server B. 
**Proposed Fix:** I would migrate the file storage to a dedicated cloud object storage service like AWS S3, Google Cloud Storage, or Cloudinary. The backend would use Multer temporarily to capture the file stream and upload it directly to the S3 bucket, subsequently saving the returned public URL image string to the user's MongoDB document. This decouples our storage from our compute, allowing the app to scale horizontally without issue.
