import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup
} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";
import { getDatabase, ref, set, get, child } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAa8nLoZLoBfQgWd-vYfljdNycsswMWJGs",
  authDomain: "toilet-01-ca040.firebaseapp.com",
  projectId: "toilet-01-ca040",
  storageBucket: "toilet-01-ca040.firebasestorage.app",
  messagingSenderId: "424764303569",
  appId: "1:424764303569:web:04c9d9011eede80a1c3df0",
  databaseURL: "https://toilet-01-ca040-default-rtdb.europe-west1.firebasedatabase.app/"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);
const provider = new GoogleAuthProvider();

const googleAuthBtn = document.getElementById("googleAuthBtn");
const usernameSetup = document.getElementById("usernameSetup");
const usernameInput = document.getElementById("username");
const completeSignupBtn = document.getElementById("completeSignupBtn");
const authStatus = document.getElementById("authStatus");

let pendingUser = null;

function showStatus(message) {
  if (authStatus) {
    authStatus.textContent = message;
  }
}

function showUsernameSetup(show) {
  if (!usernameSetup) return;
  usernameSetup.style.display = show ? "block" : "none";
}

function sanitizeUsername(value) {
  return value.trim();
}

function validateUsername(username) {
  if (username.length < 3 || username.length > 15) {
    return "Username must be between 3 and 15 characters.";
  }

  if (!/^[A-Za-z0-9]+$/.test(username)) {
    return "Username can only contain letters and numbers.";
  }

  return "";
}

async function isUsernameTaken(username, currentUid) {
  const normalized = username.toLowerCase();
  const rootRef = ref(database);
  const usersSnapshot = await get(child(rootRef, "users"));

  if (!usersSnapshot.exists()) {
    return false;
  }

  const users = usersSnapshot.val();
  for (const uid in users) {
    if (uid === currentUid) {
      continue;
    }

    const existingUsername = users[uid]?.username;
    if (typeof existingUsername === "string" && existingUsername.toLowerCase() === normalized) {
      return true;
    }
  }

  return false;
}

async function handleGoogleAuth() {
  try {
    showStatus("Opening Google sign-in...");
    const credential = await signInWithPopup(auth, provider);
    const user = credential.user;
    const userRef = ref(database, `users/${user.uid}`);
    const snapshot = await get(userRef);

    if (snapshot.exists() && snapshot.val().username) {
      const existingUsername = snapshot.val().username;
      alert(`Welcome back "${existingUsername}"`);
      showStatus("Signed in. Redirecting...");
      window.location.href = "/addToilet.html";
      return;
    }

    pendingUser = user;
    showUsernameSetup(true);

    if (usernameInput && !usernameInput.value) {
      const suggestedName = user.email ? user.email.split("@")[0] : "";
      usernameInput.value = suggestedName.replace(/[^A-Za-z0-9]/g, "").slice(0, 15);
    }

    showStatus("Choose a username to complete signup.");
  } catch (error) {
    console.error("Google auth error:", error);
    showStatus("");
    alert("Google sign-in failed. Please try again.");
  }
}

async function completeSignup() {
  const user = pendingUser || auth.currentUser;
  if (!user) {
    alert("Please continue with Google first.");
    return;
  }

  const username = sanitizeUsername(usernameInput ? usernameInput.value : "");
  const usernameValidationError = validateUsername(username);
  if (usernameValidationError) {
    alert(usernameValidationError);
    return;
  }

  try {
    const taken = await isUsernameTaken(username, user.uid);
    if (taken) {
      alert("That username is already taken. Please choose another one.");
      return;
    }

    const userRef = ref(database, `users/${user.uid}`);
    await set(userRef, {
      username,
      email: user.email || ""
    });

    showStatus("Account created. Redirecting...");
    window.location.href = "/addToilet.html";
  } catch (error) {
    console.error("Signup completion error:", error);
    showStatus("");
    alert("Could not save your profile. Please try again.");
  }
}

if (googleAuthBtn) {
  googleAuthBtn.addEventListener("click", handleGoogleAuth);
}

if (completeSignupBtn) {
  completeSignupBtn.addEventListener("click", completeSignup);
}

showUsernameSetup(false);