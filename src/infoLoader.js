import { initializeApp } from "firebase/app";
import {
  getFirestore,
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove
} from "firebase/firestore";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  signOut
} from "firebase/auth";
import { 
  FIREBASE_API_KEY,
  FIREBASE_AUTH_DOMAIN,
  FIREBASE_PROJECT_ID,
  FIREBASE_STORAGE_BUCKET,
  FIREBASE_MESSAGING_SENDER_ID,
  FIREBASE_APP_ID,
  FIREBASE_MEASUREMENT_ID,
  YOUTUBE_API_KEY
} from "../config.js";

/* =========================
   Firebase config
   ========================= */
const firebaseConfig = {
  apiKey: FIREBASE_API_KEY,
  authDomain: FIREBASE_AUTH_DOMAIN,
  projectId: FIREBASE_PROJECT_ID,
  storageBucket: FIREBASE_STORAGE_BUCKET,
  messagingSenderId: FIREBASE_MESSAGING_SENDER_ID,
  appId: FIREBASE_APP_ID,
  measurementId: FIREBASE_MEASUREMENT_ID
};

/* =========================
   INIT
   ========================= */
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const auth = getAuth(app);
const provider = new GoogleAuthProvider();

let currUser = null; // updated via onAuthStateChanged()

/* =========================
   Constants
   ========================= */
const ADMIN_EMAIL = "oneshatteredguy@gmail.com";

const pageToDocMap = {
  "aboutme.html": "About Me",
  "gamedev.html": "Game Dev",
  "programming.html": "Programming",
  "writing.html": "Writing",
  "youtube.html": "Youtube",
  "contactme.html": "Contact Me"
};

/* =========================
   Small DOM helpers
   ========================= */
function el(tag, { className, text, attrs } = {}) {
  const e = document.createElement(tag);
  if (className) e.className = className;
  if (text !== undefined) e.textContent = text;
  if (attrs) {
    for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
  }
  return e;
}

function append(parent, ...children) {
  children.forEach(c => parent.appendChild(c));
  return parent;
}

function showToast(msg, duration = 2500) {
  const t = el("div", { className: "toast", text: msg });
  Object.assign(t.style, {
    position: "fixed",
    bottom: "24px",
    left: "50%",
    transform: "translateX(-50%)",
    background: "rgba(0,0,0,0.8)",
    color: "white",
    padding: "8px 14px",
    borderRadius: "8px",
    zIndex: 99999
  });
  document.body.appendChild(t);
  setTimeout(() => t.remove(), duration);
}

/* =========================
   Auth helpers
   ========================= */
async function login() {
  try {
    await signInWithPopup(auth, provider);
  } catch (e) {
    console.error("Login failed:", e);
    showToast("Login failed");
  }
}

function logout() {
  signOut(auth);
}

/* auth state handler */
onAuthStateChanged(auth, user => {
  if (user) {
    currUser = user;
    console.log("Logged in as:", user.email);
    // load admin DMs if on contact page
    if (getCurrentPageName() === "contactme.html") loadDMsIfAdmin();
  } else {
    currUser = null;
    console.log("Not logged in");
  }
});

/* =========================
   Firestore (DM) operations
   ========================= */
function messagesDocRef() {
  return doc(db, "Messages", "DMs");
}

async function sendDM(name, title, content) {
  const ref = messagesDocRef();
  const message = {
    id: Date.now().toString(), // simple id for matching; you used timestamp before
    name: name || "Anonymous",
    title,
    content,
    timestamp: Date.now(),
    starred: false
  };

  try {
    await updateDoc(ref, {
      messages: arrayUnion(message)
    });
    return message;
  } catch (err) {
    // If doc missing or rule error, bubble up
    console.error("sendDM error", err);
    throw err;
  }
}

async function removeMessage(message) {
  const ref = messagesDocRef();
  await updateDoc(ref, {
    messages: arrayRemove(message)
  });
}

async function replaceMessage(oldMessage, newMessage) {
  const ref = messagesDocRef();
  // remove + add pattern (your current model)
  await updateDoc(ref, { messages: arrayRemove(oldMessage) });
  await updateDoc(ref, { messages: arrayUnion(newMessage) });
}

/* =========================
   YouTube helpers
   ========================= */
async function fetchChannelVideos(YOUTUBE_API_KEY, CHANNEL_ID) {
  const res = await fetch(
    `https://www.googleapis.com/youtube/v3/search?key=${YOUTUBE_API_KEY}&channelId=${CHANNEL_ID}&part=snippet,id&order=date&maxResults=20`
  );
  const data = await res.json();
  if (!data.items) return [];
  return data.items
    .filter(i => i.id && i.id.videoId)
    .map(i => ({
      videoId: i.id.videoId,
      title: i.snippet.title,
      thumbnail:
        i.snippet.thumbnails?.high?.url ||
        i.snippet.thumbnails?.medium?.url ||
        i.snippet.thumbnails?.default?.url ||
        "",
      publishedAt: i.snippet.publishedAt
    }));
}

async function fetchVideoStats(YOUTUBE_API_KEY, videoIds) {
  if (!videoIds.length) return {};
  const res = await fetch(
    `https://www.googleapis.com/youtube/v3/videos?key=${YOUTUBE_API_KEY}&id=${videoIds.join(
      ","
    )}&part=statistics`
  );
  const data = await res.json();
  const statsMap = {};
  (data.items || []).forEach(v => {
    statsMap[v.id] = v.statistics || {};
  });
  return statsMap;
}

/* create youtube card (keeps same visual as other cards) */
function createVideoCard(container, label, video) {
  const cardDiv = el("div", { className: "card" });

  const title = el("h2", { text: video.title });
  const category = el("p", { text: label });
  const img = el("img", { attrs: { src: video.thumbnail } });
  const stats = el("p", {
    text: `${video.stats?.viewCount ?? "?"} views | ${video.stats?.commentCount ??
      0} comments`
  });

  append(cardDiv, title, category, img, stats);

  const link = el("a", { attrs: { href: `https://www.youtube.com/watch?v=${video.videoId}`, target: "_blank" } });
  link.classList.add("linked");
  link.appendChild(cardDiv);

  container.appendChild(link);
}

/* =========================
   DM UI builders
   ========================= */

/* build a single DM admin card and wire delete/star */
function buildDMCard(message) {
  const dmCard = el("div", { className: "card dm" });
  if (message.starred) dmCard.classList.add("starred");
  dmCard.messageData = message;

  // Title
  const titleRow = el("div", { className: "row" });
  append(titleRow, el("div", { text: "Title: " }), el("div", { text: message.title || "No subject" }));

  // Name
  const nameRow = el("div", { className: "row" });
  append(nameRow, el("div", { text: "Name: " }), el("div", { text: message.name || "Anonymous" }));

  // Content
  const contentP = el("p", { text: message.content || "" });

  // Buttons
  const buttonRow = el("div", { className: "row" });
  const deleteBtn = el("button", { text: "Delete" });
  const starBtn = el("button", { text: message.starred ? "Unstar" : "Star" });
  append(buttonRow, deleteBtn, starBtn);

  append(dmCard, titleRow, nameRow, contentP, buttonRow);

  // Delete handler
  deleteBtn.addEventListener("click", async () => {
    if (!confirm("Delete this message?")) return;
    try {
      await removeMessage(message);
      showToast("Deleted");
      // refresh list
      await loadDMsIfAdmin();
    } catch (err) {
      console.error(err);
      showToast("Delete failed");
    }
  });

  // Star handler
  starBtn.addEventListener("click", async () => {
    try {
      const updated = { ...message, starred: !message.starred };
      await replaceMessage(message, updated);
      showToast(updated.starred ? "Starred" : "Unstarred");
      await loadDMsIfAdmin();
    } catch (err) {
      console.error(err);
      showToast("Star toggle failed");
    }
  });

  return dmCard;
}

/* =========================
   Basic Card Builder
   ========================= */

function renderGenericCard(container, card, index) {
  const cardDiv = el("div", { className: "card" });
  cardDiv.id = `genericCard-${index}`;
  cardDiv._info = card;
  
  //Title
  append(cardDiv, el("h2", { text: card.title || "" }));
  
  
  //Description
  append(cardDiv, el("p", {text: card.content || ""}));
  
  //Image
  if (card.image) {
    append(cardDiv, el("img", { attrs: { src: card.image, alt: card.title || "Card image" } }));
  }
  
  //Log Doc
  if (card.logDoc) {
    const logDocContainer = el("div", { className: "logDocCont" });
    logDocContainer._displayedLogs = 1;
    
    append(logDocContainer, el("h3", { text: "Activity Log"}));
    
    for (let i = 0; i < card.logDoc.length; i++) {
      const log = card.logDoc[i];
      
      const docRow = el("div", { className: "row" });
      let dateText = '';
      if (log.date) {
        const jsDate = log.date.toDate ? log.date.toDate() : new Date(log.date); 
        dateText = jsDate.toLocaleDateString(undefined, {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        });
      }
      append(docRow, el("p", { text: dateText || 'dateError' }));
      append(docRow, el("p", { text: " : "}));
      append(docRow, el("p", { text: log.info || 'logError'}));
      
      docRow.style.display = i < logDocContainer._displayedLogs ? "flex" : "none";
      
      append(logDocContainer, docRow);
    }
    
    logDocContainer.addEventListener('click', () => {
      logDocContainer._displayedLogs += 10;
      
      Array.from(logDocContainer.children).forEach((child, i) => {
        if (i <= logDocContainer._displayedLogs) child.style.display = "flex";
      });
    });
    
    append(cardDiv, logDocContainer);
  }
  
  if (card.link) {
    const linkedCard = el("a", { attrs: { href: card.link || "" }, className: "linked"});
    append(linkedCard, cardDiv);
    
    container.appendChild(linkedCard);
    return linkedCard;
  }
  
  container.appendChild(cardDiv);
  return cardDiv;
}


/* =========================
   Page loaders
   ========================= */

/* Get current page filename */
function getCurrentPageName() {
  const path = window.location.pathname;
  return path.substring(path.lastIndexOf("/") + 1);
}

/* Load content cards (About / Programming / etc.)
   If on contact page, build contact form and return the login button element.
*/
async function loadContentCards() {
  const pageName = getCurrentPageName();
  const docInfo = pageToDocMap[pageName];
  const container = document.querySelector("main");
  container.innerHTML = "";

  if (!docInfo) {
    console.warn(`No Firestore mapping found for ${pageName}`);
    return null;
  }

  // Load shared content from Firestore
  const docRef = doc(db, "website content", docInfo);
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) {
    console.error("Document not found:", docInfo);
    return null;
  }

  const data = snapshot.data();
  const cards = data.cards ?? [];

  // Render generic cards
  for (let i = 0; i < cards.length; i++) {
    renderGenericCard(container, cards[i], i);
  }

  // Youtube special handling
  if (pageName === "youtube.html") {
    const YOUTUBE_CHANNEL_ID = "UCEHoE_Lu9j5Qxp86kaygSOg";
    const videos = await fetchChannelVideos(YOUTUBE_API_KEY, YOUTUBE_CHANNEL_ID);
    const stats = await fetchVideoStats(YOUTUBE_API_KEY, videos.map(v => v.videoId));
    videos.forEach(v => (v.stats = stats[v.videoId] || {}));
    const latest = videos[0];
    if (latest) {
      const mostViewed = videos.reduce((a, b) => (Number(a.stats.viewCount || 0) > Number(b.stats.viewCount || 0) ? a : b));
      const yesterday = Date.now() - 24 * 60 * 60 * 1000;
      const hot = (videos.filter(v => new Date(v.publishedAt).getTime() > yesterday).sort((a, b) => Number(b.stats.viewCount || 0) - Number(a.stats.viewCount || 0))[0]) || latest;

      createVideoCard(container, "Trending Video", hot);
      createVideoCard(container, "Newest Video", latest);
      createVideoCard(container, "Most Popular Video", mostViewed);
    }
  }

  // Contact page - create DM form and Admin login button
  if (pageName === "contactme.html") {
    // Build form
    const formCard = el("div", { className: "card" });
    append(formCard, el("h2", { text: "Direct Message Me" }));

    const titleRow = el("div", { className: "row" });
    append(titleRow, el("div", { text: "Title: " }), el("input", { attrs: { type: "text", placeholder: "Subject Line", id: "dm-title" } }));
    append(formCard, titleRow);

    const nameRow = el("div", { className: "row" });
    append(nameRow, el("div", { text: "Name: " }), el("input", { attrs: { type: "text", placeholder: "Your Name", id: "dm-name" } }));
    append(formCard, nameRow);

    const textArea = el("textarea", { attrs: { placeholder: "Message", id: "dm-content", rows: 5 } });
    Object.assign(textArea.style, { width: "100%", boxSizing: "border-box" });
    append(formCard, textArea);

    const btnRow = el("div", { className: "row" });
    const sendButton = el("button", { text: "Send" });
    const cancelButton = el("button", { text: "Cancel" });
    append(btnRow, sendButton, cancelButton);
    append(formCard, btnRow);

    container.appendChild(formCard);

    // Form logic
    let canSend = true;
    sendButton.addEventListener("click", async () => {
      if (!canSend) {
        showToast("Please don't spam messages!");
        return;
      }
      const titleEl = document.getElementById("dm-title");
      const nameEl = document.getElementById("dm-name");
      const contentEl = document.getElementById("dm-content");

      const titleVal = (titleEl.value || "").trim();
      const nameVal = (nameEl.value || "").trim() || "Anonymous";
      const contentVal = (contentEl.value || "").trim();

      if (!titleVal) {
        showToast("Message title cannot be empty!");
        return;
      }
      if (!contentVal) {
        showToast("Message content cannot be empty!");
        return;
      }

      try {
        await sendDM(nameVal, titleVal, contentVal);
        titleEl.value = "";
        nameEl.value = "";
        contentEl.value = "";
        showToast("Message sent!");
        canSend = false;
        setTimeout(() => (canSend = true), 30 * 1000);
      } catch (err) {
        console.error(err);
        showToast("Send failed");
      }
    });

    cancelButton.addEventListener("click", () => {
      document.getElementById("dm-title").value = "";
      document.getElementById("dm-name").value = "";
      document.getElementById("dm-content").value = "";
      showToast("Message cancelled");
    });

    // Admin login button - hidden by default, shown by Konami input
    const loginButton = el("button", { className: "loginBtn", text: "Admin Login" });
    loginButton.style.visibility = "hidden";
    container.appendChild(loginButton);

    // return login button for caller to wire Konami and click handlers
    return loginButton;
  }

  // Not contact page - return null
  return null;
}

/* =========================
   Admin DM loader (called after login)
   ========================= */
async function loadDMsIfAdmin() {
  if (!currUser || currUser.email !== ADMIN_EMAIL) return;

  const main = document.querySelector("main");
  main.querySelectorAll(".dm").forEach(n => n.remove());

  try {
    const snapshot = await getDoc(doc(db, "Messages", "DMs"));
    const data = snapshot.data() || {};
    const messages = Array.isArray(data.messages) ? data.messages.slice() : [];

    // sort: starred first, then newest
    messages.sort((a, b) => {
      if ((b.starred ? 1 : 0) !== (a.starred ? 1 : 0)) return (b.starred ? 1 : 0) - (a.starred ? 1 : 0);
      return (b.timestamp || 0) - (a.timestamp || 0);
    });

    if (messages.length == 0) {
      const noMessagesCard = document.createElement('div');
      noMessagesCard.classList.add('card', 'dm');
      const noMessagesh2 = document.createElement('h2');
      noMessagesh2.textContent = 'No Messages Currently!';
      noMessagesCard.append(noMessagesh2);
      main.append(noMessagesCard);
    }

    messages.forEach(m => {
      const card = buildDMCard(m);
      main.appendChild(card);
    });
  } catch (err) {
    console.error("Failed to load DMs", err);
    showToast("Failed to load DMs");
  }
}

/* =========================
   Konami code + init
   ========================= */
document.addEventListener("DOMContentLoaded", async () => {
  const loginButton = await loadContentCards();

  if (!loginButton) return;

  // wire konami
  const keypressOrder = [
    "ArrowUp",
    "ArrowUp",
    "ArrowDown",
    "ArrowDown",
    "ArrowLeft",
    "ArrowRight",
    "ArrowLeft",
    "ArrowRight",
    "a",
    "b"
  ];
  let keyIndex = 0;

  document.addEventListener("keydown", e => {
    if (keypressOrder[keyIndex] === e.key) {
      keyIndex++;
      if (keyIndex >= keypressOrder.length) {
        loginButton.style.visibility = "visible";
        keyIndex = 0;
        setTimeout(() => (loginButton.style.visibility = "hidden"), 5000);
      }
    } else {
      keyIndex = 0;
    }
  });

  loginButton.addEventListener("click", () => {
    loginButton.style.visibility = "hidden";
    login();
  });
});
