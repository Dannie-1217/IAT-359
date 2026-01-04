**SpotShare**

Mobile Computing Project (IAT 359) | SFU 

---

**Overview**

A React Native app for sharing food, scenery, and entertainment experiences via multimedia, GPS, and real-time weather data.

---

**Key Features**

Multimedia Sharing: Upload images, captions, and location tags via Google Places API.

Weather Integration: Displays current weather at the post location using OpenWeather API.

Interactive Map: View nearby posts using Google Maps with marker and list views.

Authentication: Secure login and profile management powered by Firebase.

---

**Tech Stack**

Frontend: React Native (Expo) 

Backend: Firebase Firestore & Storage 

APIs: Google Maps, Google Places, OpenWeather 

---

**Architecture & Challenges**

Data Structure: Optimized Firestore with a users collection and posts subcollection for efficient querying.

Cloud Storage: Migrated from local paths to Firebase Storage for global image accessibility.

---

**Installation:**
git clone https://github.com/Dannie-1217/IAT-359.git

npm install

Create .env with your API Keys (Google Maps, OpenWeather, Firebase).

npx expo start
