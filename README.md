# Agents App

A minimal React Native web application styled with NativeWind and powered by a Node.js backend. It is ready to deploy to Firebase Hosting and AWS Lambda.

## Architecture

- **Frontend**: React Native via Expo with NativeWind (Tailwind CSS). Renders on web using Expo Web. Firebase Authentication and Firestore can be added via the `firebase` library.
- **Backend**: Express.js server for local development and an AWS Lambda function for serverless deployments.
- **Database**: Designed for Firebase Firestore but can be swapped with DynamoDB.

## Local Development

### Frontend
```bash
cd frontend
npm install # install dependencies
npm run web # start Expo in web mode
```

### Backend
```bash
cd backend
npm install
npm start
```

### Tests
```bash
cd frontend
npm test
```

## Deployment

### Firebase
1. Install the Firebase CLI and run `firebase init` in the `frontend` directory.
2. Choose **Hosting** and configure as a single-page app.
3. Build the Expo web output (`npx expo export:web`).
4. Deploy with `firebase deploy`.

### AWS Lambda
1. Package the contents of `backend/lambda` and deploy via AWS Console or CLI.
2. Connect through API Gateway to expose HTTP endpoints.

### CI/CD
Set up GitHub Actions to run tests and deploy to Firebase/AWS on push to `main`.

## Screenshots
This repository contains minimal UI components (Hero, About). Customize them to match your product style.
