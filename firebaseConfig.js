
import { initializeApp } from "firebase/app";
import { getAuth, initializeAuth,connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";

// import { getFirestore } from "firebase/firestore";
import { getStorage,connectStorageEmulator } from "firebase/storage";
import AsyncStorage from "@react-native-async-storage/async-storage";  // AsyncStorage for persisting the login state
import { getReactNativePersistence } from "firebase/auth";  // Persistence for React Native

// Replace `apiKey` with a secure runtime value (env/config) before running.
const firebaseConfig = {
  apiKey: "YOUR_FIREBASE_API_KEY",
  authDomain: "iat359-finalproject-1cfda.firebaseapp.com",
  projectId: "iat359-finalproject-1cfda",
  // use for firebase emulator.
  // storageBucket: "iat359-finalproject-1cfda.appspot.com",
  storageBucket: "iat359-finalproject-1cfda.firebasestorage.app",
  messagingSenderId: "163112521983",
  appId: "1:163112521983:web:dbaa8b48f1186c0ffdfcca",
};

const clearAsyncStorage = async () => {
  try {
    await AsyncStorage.clear(); 
    console.log('AsyncStorage cleared successfully');
  } catch (error) {
    console.error('Error clearing AsyncStorage:', error);
  }
};


const app = initializeApp(firebaseConfig);

const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage), 
});

const db = getFirestore(app);
const storage = getStorage(app);

// clearAsyncStorage();

// if (__DEV__) { 
//   connectFirestoreEmulator(db, "10.0.2.2", 8081);
//   console.log("Connected to Firestore Emulator");
// }

// if (__DEV__) {
//   connectAuthEmulator(auth, "http://10.0.2.2:9099");
//   console.log("Connected to Firebase Auth Emulator");
// }

// if (__DEV__) {
//   connectStorageEmulator(storage, "10.0.2.2", 9199);
//   console.log("Connected to Firebase Storage Emulator");
// }



export { auth, db, storage };
