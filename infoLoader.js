import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyB08j9kdl0uchftriN7Rp7C6Inp6wT3Mn4",
  authDomain: "github-portfolio-page-487021.firebaseapp.com",
  projectId: "github-portfolio-page-487021",
  storageBucket: "github-portfolio-page-487021.firebasestorage.app",
  messagingSenderId: "261669428246",
  appId: "1:261669428246:web:c04f003d791040d9202937",
  measurementId: "G-LQ0J1ND3Y9"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function loadInfo() {
    console.log("loadInfo running");

    try {
        const ref = doc(db, "portfolio website info", "About Me");
        const snap = await getDoc(ref);

        console.log("exists?", snap.exists());

        if (!snap.exists()) {
            console.log("No data found.");
            return;
        }

        const data = snap.data();
        console.log("data:", data);

    } catch (err) {
        console.error("Firestore error:", err);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadInfo();
});
