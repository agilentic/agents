# Greg Isenberg Style Web App Monorepo

This repository contains a full-stack web application inspired by the design style of Greg Isenberg. It includes a React Native frontend (Expo) and an Express.js backend deployed to AWS Lambda, with Firebase Hosting for the frontend.

## Project Structure

```
/project-root
├── frontend/            # Expo React Native app with web build
├── backend/             # Express.js API for AWS Lambda
├── deployment/          # Firebase and GitHub Actions configs
└── README.md
```

## Getting Started

1. Install dependencies for both frontend and backend:
   ```bash
   cd frontend && npm install
   cd ../backend && npm install
   ```
2. Copy environment variables:
   ```bash
   cp backend/.env.example backend/.env
   ```
3. Start the Expo app:
   ```bash
   cd ../frontend && npm start
   ```
4. Deploy frontend to Firebase Hosting:
   ```bash
   expo export:web -o web-build && firebase deploy
   ```
5. Deploy backend with Serverless Framework:
   ```bash
   cd ../backend && npx serverless deploy
   ```

## Testing

Run Jest tests in the frontend:

```bash
cd frontend && npm test
```

## Sample Data

Sample feature, testimonial, and blog data are located in `frontend/data/`.

