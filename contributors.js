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
const leaderboardBody = document.getElementById("leaderboardBody");

function getToiletCountForUser(toiletsByUser, uid) {
  if (!toiletsByUser || !toiletsByUser[uid]) {
    return 0;
  }
  return Object.keys(toiletsByUser[uid]).length;
}

function getDisplayName(userData, uid) {
  if (userData?.username) {
    return userData.username;
  }
  if (userData?.email) {
    return userData.email.split("@")[0];
  }
  return `user_${uid.slice(0, 6)}`;
}

async function loadLeaderboard() {
  try {
    const rootRef = ref(database);
    const [usersSnapshot, toiletsSnapshot] = await Promise.all([
      get(child(rootRef, "users")),
      get(child(rootRef, "toilets"))
    ]);

    const users = usersSnapshot.exists() ? usersSnapshot.val() : {};
    const toilets = toiletsSnapshot.exists() ? toiletsSnapshot.val() : {};

    const rows = Object.keys(users).map((uid) => {
      const userData = users[uid];
      return {
        username: getDisplayName(userData, uid),
        toiletCount: getToiletCountForUser(toilets, uid)
      };
    });

    rows.sort((a, b) => {
      if (b.toiletCount !== a.toiletCount) {
        return b.toiletCount - a.toiletCount;
      }
      return a.username.localeCompare(b.username);
    });

    if (!rows.length) {
      leaderboardBody.innerHTML = '<tr><td colspan="3">No contributors yet.</td></tr>';
      return;
    }

    leaderboardBody.innerHTML = rows
      .map((row, index) => `
        <tr>
          <td>${index + 1}</td>
          <td>${row.username}</td>
          <td>${row.toiletCount}</td>
        </tr>
      `)
      .join("");
  } catch (error) {
    console.error("Failed to load contributors:", error);
    leaderboardBody.innerHTML = '<tr><td colspan="3">Unable to load contributors.</td></tr>';
  }
}

loadLeaderboard();