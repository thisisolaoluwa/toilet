import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getDatabase, ref, get, child } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";

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
const database = getDatabase(app);

const totalContributorsEl = document.getElementById("totalContributors");
const totalToiletsEl = document.getElementById("totalToilets");

function countToilets(toiletsByUser) {
  if (!toiletsByUser) {
    return 0;
  }

  return Object.keys(toiletsByUser).reduce((sum, uid) => {
    const userToilets = toiletsByUser[uid] || {};
    return sum + Object.keys(userToilets).length;
  }, 0);
}

async function loadStats() {
  try {
    const rootRef = ref(database);
    const [usersSnapshot, toiletsSnapshot] = await Promise.all([
      get(child(rootRef, "users")),
      get(child(rootRef, "toilets"))
    ]);

    const users = usersSnapshot.exists() ? usersSnapshot.val() : {};
    const toilets = toiletsSnapshot.exists() ? toiletsSnapshot.val() : {};

    totalContributorsEl.textContent = Object.keys(users).length;
    totalToiletsEl.textContent = countToilets(toilets);
  } catch (error) {
    console.error("Failed to load stats:", error);
    totalContributorsEl.textContent = "-";
    totalToiletsEl.textContent = "-";
  }
}

loadStats();