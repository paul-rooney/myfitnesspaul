import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: 'AIzaSyD-h-ziP-jxYNsyvbI0Dkch4QtkPhAQx3o',
    authDomain: 'nutrition-pr.firebaseapp.com',
    projectId: 'nutrition-pr',
    storageBucket: 'nutrition-pr.appspot.com',
    messagingSenderId: '316567518942',
    appId: '1:316567518942:web:7adddbc62c34fc56550c4f',
    measurementId: 'G-Y16EF2X9FR',
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default db;