import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";
import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAa8nLoZLoBfQgWd-vYfljdNycsswMWJGs",
  authDomain: "toilet-01-ca040.firebaseapp.com",
  projectId: "toilet-01-ca040",
  storageBucket: "toilet-01-ca040.firebasestorage.app",
  messagingSenderId: "424764303569",
  appId: "1:424764303569:web:04c9d9011eede80a1c3df0",
  databaseURL: "https://toilet-01-ca040-default-rtdb.europe-west1.firebasedatabase.app/" // Explicitly included
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app); // Correctly initializes the database using the databaseURL
const auth = getAuth(app);

// Get references to buttons and forms
const signUpBtn = document.getElementById('signUpBtn');
const signInBtn = document.getElementById('signInBtn');
const signUpForm = document.getElementById('signUpForm');
const signInForm = document.getElementById('signInForm');
const signUpBtnDiv = document.getElementById('signUpBtnDiv');
const signInBtnDiv = document.getElementById('signInBtnDiv');

// Show Sign-Up Form and Hide Sign-In Form
signUpBtn.addEventListener('click', () => {
  signUpForm.style.display = 'block';
  signInForm.style.display = 'none';
  signUpBtnDiv.style.borderBottom = '1.5px solid #e0e0e0';
  signInBtnDiv.style.borderBottom = 'none';
});

// Show Sign-In Form and Hide Sign-Up Form
signInBtn.addEventListener('click', () => {
  signUpForm.style.display = 'none';
  signInForm.style.display = 'block';
  signInBtnDiv.style.borderBottom = '1.5px solid #e0e0e0';
  signUpBtnDiv.style.borderBottom = 'none';
});

// Event listener for Sign-Up form
signUpForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const username = document.getElementById("username").value; 

  try {
    // Create user with Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Save user data in the database
    const userId = user.uid;
    const userRef = ref(database, `users/${userId}`);
    await set(userRef, {
      username: username,
      email: email
    });
    console.log("User data saved to database");

    // Clear the form
    signUpForm.reset();

    // Show a welcome alert
    alert("Welcome to FindAToilet!");

    // Redirect to a new page
    console.log("Redirecting to /addToilet.html");
    window.location.href = "addToilet.html";
  } catch (error) {
    console.error("Sign-up error:", error.message);
    alert("Error during sign-up: " + error.message);
  }
});

// Event listener for Sign-In form
signInForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("signInEmail").value;
  const password = document.getElementById("signInPassword").value;

  try {
    // Sign in user with Firebase Authentication
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log("User signed in:", userCredential.user.uid);

    // Clear the form
    signInForm.reset();

    // Show a welcome alert
    alert("Welcome back!");

    // Redirect to a new page
    console.log("Redirecting to /addToilet.html");
    window.location.href = "/addToilet.html";
  } catch (error) {
    console.error("Sign-in error:", error.message);
    alert("Error during sign-in: " + error.message);
  }
});
