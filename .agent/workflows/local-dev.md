---
description: How to run the Craigslist application locally for live development
---

This workflow helps you run both the frontend and backend locally to see live updates without deploying.

1. Install dependencies (if you haven't already):
```bash
npm install
```

2. Start the local development servers:
// turbo
```bash
npm run dev
```

3. Open your browser:
   - Navigate to **http://localhost:5173** to view the frontend.
   - The backend will be running on **http://localhost:3001**.

4. Live Updates:
   - **Frontend:** Any changes you make to files in the `frontend/src` directory will automatically update in the browser thanks to Vite's Hot Module Replacement (HMR).
   - **Backend:** Any changes you make in the `backend/src` directory will automatically restart the backend server thanks to `nodemon`.

5. Stopping:
   - Press `Ctrl + C` in the terminal to stop both servers.
