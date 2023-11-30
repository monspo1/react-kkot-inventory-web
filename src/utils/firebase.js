import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, initializeAuth } from 'firebase/auth';
import  { myFirebaseConfig } from './../../credentials/credentials'

const firebaseConfig = myFirebaseConfig;

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };

/*
[
  {
    "box_creator": "J.K.",
    "box_initial": "BAB-02",
    "created": "2023-11-12T18:10:06.358Z",
    "id": "7PvmE3AntqjBpwGohx4N",
    "item_count": 11,
    "item_weight": 35.98
  }, 
  {
    "box_creator": "Hans",
    "box_initial": "HJK-001",
    "created": "2023-11-13T05:00:00.883Z",
    "id": "uSblTHjo8yHSth4BilLM", 
    "item_count": 15,
    "item_weight": 24.98
  }
]
//*/