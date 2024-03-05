import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from 'firebase/auth';

//######################################################################
//## Local credentials & for firebase DEPLOY (아래 상태 그대로 firebase deploy해)
//######################################################################
import  { myFirebaseConfig } from './../../credentials/credentials'
const firebaseConfig = myFirebaseConfig;

//######################################################################
//## GitHub Actions workflow (firebase deploy할 때 이거 필요 없음. github에 push할 때만)
//######################################################################
// const firebaseConfig = {
//   apiKey: process.env.FIREBASE_API_KEY,
//   authDomain: process.env.FIREBASE_AUTH_DOMAIN,
//   projectId: process.env.FIREBASE_PROJECT_ID,
//   storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
//   messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
//   appId: process.env.FIREBASE_APP_ID,
//   measurementId: process.env.FIREBASE_MEASUREMENT_ID
// };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };