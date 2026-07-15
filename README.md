# Job Application Form (Firebase + Cloudinary)

Is form main:
- **Firebase Firestore** — sab applications ka data ek central database main save hota hai (koi bhi browser/phone se apply kare, admin ko sab dikhega)
- **Cloudinary** — candidate apni photo upload kar sakta hai
- **Real-time Admin Panel** — naya application aate hi turant list main dikh jata hai, koi refresh ki zaroorat nahi

---

## Step 1: Firebase Setup (Database ke liye)

1. Jayein: https://console.firebase.google.com
2. **"Add project"** par click karein, project ka naam dein (e.g. "job-portal"), aage barhte jayein.
3. Project bann jaane ke baad, left menu se **Build > Firestore Database** par jayein.
4. **"Create database"** click karein.
   - Location select karein (koi bhi qareeb wala, e.g. `asia-south1`)
   - **"Start in test mode"** select karein (development ke liye) — is se koi bhi read/write kar sakega abhi ke liye.
5. Ab left menu se **Project Settings** (gear icon) > neeche scroll karein **"Your apps"** section tak.
6. **"</>"  (Web)** icon par click karein, app ka nickname dein (e.g. "job-form"), **"Register app"** karein.
7. Aap ko ek code milega jisme `firebaseConfig` object hoga — jaisay:
   ```js
   const firebaseConfig = {
     apiKey: "AIzaSy...",
     authDomain: "job-portal-xxxx.firebaseapp.com",
     projectId: "job-portal-xxxx",
     storageBucket: "job-portal-xxxx.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abcdef"
   };
   ```
8. Ye poora object copy karein aur `config.js` file main paste kar dein (jahan `YOUR_API_KEY` waghera likha hai, wahan apni values dalein).

### ⚠️ Important — Security Rules (baad main zaroor set karein)
Test mode 30 din baad expire ho jata hai aur database publicly open rehta hai. Production ke liye Firestore Rules ko update karein:
- Firestore Database > Rules tab main jayein
- Rules ko is tarah update karein (sirf add karne ki ijazat, edit sirf apne se):
  ```
  rules_version = '2';
  service cloud.firestore {
    match /databases/{database}/documents {
      match /applications/{appId} {
        allow create: if true;
        allow read, update: if true; // Agar chahen to admin login lagayen
      }
    }
  }
  ```

---

## Step 2: Cloudinary Setup (Photo upload ke liye)

1. Jayein: https://cloudinary.com aur free account banayein.
2. Dashboard par login karne ke baad, upar **"Cloud Name"** likha hoga — ye copy kar lein.
3. Left menu se **Settings (gear icon) > Upload** tab par jayein.
4. **"Upload presets"** section main **"Add upload preset"** par click karein.
5. **Signing Mode** ko **"Unsigned"** par set karein (zaroori hai, warna upload fail hoga).
6. Preset ka naam dein (ya jo default mile wo use karein), **Save** karein.
7. `config.js` file main:
   - `CLOUDINARY_CLOUD_NAME` = aap ka Cloud Name
   - `CLOUDINARY_UPLOAD_PRESET` = aap ka preset ka naam

---

## Step 3: Chalayein

1. VS Code main **Live Server** extension install karein (agar nahi hai).
2. `index.html` par right-click > **"Open with Live Server"**.
3. Form fill kar ke submit karein — Firebase Console > Firestore Database main jaake check karein, application wahan save hui hogi.
4. "Admin Panel" tab par jaake applications dekhein aur Hire/Reject/Pending karein.

---

## Files

- `index.html` — form aur admin panel structure
- `style.css` — styling
- `config.js` — **isme apni Firebase aur Cloudinary details dalni hain**
- `script.js` — poora logic (submit, upload, real-time listener)

---

## Common Errors

| Error | Wajah | Hal |
|---|---|---|
| `Firebase: Error (auth/...)` | Config galat hai | `config.js` dobara check karein |
| `Missing or insufficient permissions` | Firestore Rules restrict kar rahe hain | Test mode use karein ya Rules update karein |
| Cloudinary upload fail | Upload preset "Signed" hai | Preset ko "Unsigned" par set karein |
| Admin panel khali hai | Abhi tak koi submission nahi hui | Pehle form se ek test application submit karein |
