// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js"; 
import { getDatabase, ref, set, push, get, child } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";

// Firebase configuration (same for both files)
const firebaseConfig = {
  apiKey: "AIzaSyAa8nLoZLoBfQgWd-vYfljdNycsswMWJGs",
  authDomain: "toilet-01-ca040.firebaseapp.com",
  projectId: "toilet-01-ca040",
  storageBucket: "toilet-01-ca040.firebasestorage.app",
  messagingSenderId: "424764303569",
  appId: "1:424764303569:web:04c9d9011eede80a1c3df0",
  databaseURL: "https://toilet-01-ca040-default-rtdb.europe-west1.firebasedatabase.app/",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = getAuth(app);

let currentUser = null; // Track authenticated user

// Global variables for map and user location
let map;
let userMarker, userCircle;
let userInteracted = false;
let crossLat, crossLong, userLat, userLong;

// Custom icon for toilet markers
const customIcon = L.icon({
  iconUrl: "icon.png",
  iconSize: [21, 31],
  iconAnchor: [25, 50],
  popupAnchor: [0, -50],
});

// Create a marker cluster group for toilet markers
let markerCluster = L.markerClusterGroup({
  iconCreateFunction: function (cluster) {
    const markerCount = cluster.getChildCount();
    return L.divIcon({
      html: `<div><span>${markerCount}</span></div>`,
      className: "custom-cluster-icon",
      iconSize: L.point(40, 40),
    });
  },
});





// calculating distance beween user's location to the actual toilet
function getDistance(userLat, userLong, crossLat, crossLong) {
  const R = 6371; // Radius of the Earth in km
  const dLat = (crossLat - userLat) * (Math.PI / 180);
  const dLon = (crossLong - userLong) * (Math.PI / 180);

  const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(userLat * (Math.PI / 180)) * Math.cos(crossLat * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c * 1000; // Convert km to meters
}





  // Get the user's current location for distance calculation
    function getPosition(position) {
    userLat = position.coords.latitude;
    userLong = position.coords.longitude;
    map.setView([userLat, userLong], 18);

    // After getting the location, you can safely call getDistance
    map.on('moveend', function() {
      let center = map.getCenter();
      crossLat = center.lat;
      crossLong = center.lng;
      
      if (crossLat !== undefined && crossLong !== undefined) {
          getDistance(userLat, userLong, crossLat, crossLong);
      } else {
          alert("Please move the map to select a location.");
      }
  });
  
  }


// --- FORM & CHECKBOX HANDLING --- //

// Hide/show price input depending on free/not free options
const freeYes = document.getElementById("freeYes");
const notFree = document.getElementById("notFree");
const freeUnknown = document.getElementById("freeUnknown");
const priceLabel = document.getElementById("priceLabel");
const priceInput = document.getElementById("priceInput");

if (notFree) {
  notFree.addEventListener("click", () => {
    priceLabel.classList.remove("hidden1");
    priceInput.classList.remove("hidden1");
  });
}
if (freeYes) {
  freeYes.addEventListener("click", () => {
    priceLabel.classList.add("hidden1");
    priceInput.classList.add("hidden1");
  });
}
if (freeUnknown) {
  freeUnknown.addEventListener("click", () => {
    priceLabel.classList.add("hidden1");
    priceInput.classList.add("hidden1");
  });
}

// Ensure only one checkbox per group (for example, for men, women, disabled)
document.querySelectorAll('input[type="checkbox"]').forEach((checkbox) => {
  checkbox.addEventListener("change", (event) => {
    const group = event.target.dataset.group;
    if (group) {
      document.querySelectorAll(`input[data-group="${group}"]`).forEach((box) => {
        if (box !== event.target) box.checked = false;
      });
    }
  });
});



// --- FETCH AND DISPLAY TOILET MARKERS --- //
async function fetchAllToiletLocations() {
  const rootRef = ref(database);

  try {
    const snapshot = await get(child(rootRef, "toilets"));
    if (snapshot.exists()) {
      const toilets = snapshot.val();
      const locations = [];

      markerCluster.clearLayers(); // Clear previous markers

      for (const userId in toilets) {
        const userToilets = toilets[userId];
        // Try to get the username from a "users" node (if available)
        const userSnapshot = await get(child(rootRef, `users/${userId}`));
        const username = userSnapshot.exists() ? userSnapshot.val().username : "Unknown";

        for (const toiletId in userToilets) {
          const toiletData = userToilets[toiletId];
          const { crossLat, crossLong, toiletName } = toiletData;
          if (crossLat !== undefined && crossLong !== undefined) {
            const lat = parseFloat(crossLat);
            const lng = parseFloat(crossLong);
            if (!isNaN(lat) && !isNaN(lng)) {
              locations.push({ lat, lng, toiletName, ...toiletData, username });
            }
          }
        }
      }

      locations.forEach((toilet) => {
        const { lat, lng, toiletName, username, ...details } = toilet;
        const marker = L.marker([lat, lng], { icon: customIcon });



        let featuresHtml = `
          
        `;

        function formatDate(timestamp) {
          const date = new Date(timestamp);
          const day = String(date.getDate()).padStart(2, '0');
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const year = date.getFullYear();
          return `${day}/${month}/${year}`;
        }

        // Build popup content with a button for directions
        const googleMapsDirectionUrl = (lat, lng) => {
          return `https://maps.google.com/?daddr=${lat},${lng}`;
        };
      



// Function to create the panel dynamically
function createInfoPanel(data) {
  // Remove existing panel if it exists
  const existingPanel = document.getElementById('infoPanel');
  if (existingPanel) existingPanel.remove();

  // Create the info panel
  const infoPanel = document.createElement('div');
  infoPanel.id = 'infoPanel';
  infoPanel.classList.add('show'); // Add class to make it visible




  // Format opening hours
  function formatOpeningHours(details) {
    let openingHoursHtml = "<h4 style='margin-bottom: 5px; font-size: 20px;'>Opening Hours</h4><ul style='list-style-type: none; padding: 0;'>";

    const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
    let hasOpeningHours = false;
    const openingHours = details.openingHours;

    if (!openingHours) {
        return "<p><strong>Opening Hours:</strong> Not specified</p>";
    }

    days.forEach((day) => {
        if (openingHours[day]) {
            const { open, close, closed, fullDay } = openingHours[day];

            let formattedDay = `<span style="display: inline-block; width: 120px; font-weight: bold;">${day.charAt(0).toUpperCase() + day.slice(1)}:</span>`;

            if (fullDay) {
                openingHoursHtml += `<li>${formattedDay}<span style="margin-left: 20px;">Open 24 hours</span></li>`;
                hasOpeningHours = true;
            } else if (closed) {
                openingHoursHtml += `<li>${formattedDay}<span style="margin-left: 20px;">Closed</span></li>`;
                hasOpeningHours = true;
            } else if (open && close) {
                openingHoursHtml += `<li>${formattedDay}<span style="margin-left: 20px;">${open} - ${close}</span></li>`;
                hasOpeningHours = true;
            }
        }
    });

    openingHoursHtml += "</ul>";

    return hasOpeningHours ? openingHoursHtml : "<p><strong>Opening Hours:</strong> Not specified</p>";
}



// Format notes
const notesHtml = details.notes ? `<p><strong>Notes:</strong> <p>${details.notes}</p></p>` : "";






  infoPanel.innerHTML = `

          <button id="closeBtn">
              &times;
            </button>

          <div id="infoPanelContent">
            <h3 id="toiletName">${toiletName}</h3>
            <button class = "direction-btn" 
              onclick="window.open('${googleMapsDirectionUrl(toilet.crossLat, toilet.crossLong)}', '_blank')">
              
              <img src="direction.png" 
              alt="Direction">
              <strong>Direction</strong>
            </button>

            <!--/////////////////////////////////////////////////////-->
            <div id="infoPanelBigDiv"  style="display: flex; flex-wrap: wrap">


            <div class="infoPanelDiv" id="infoPanelDiv1">



            <div style="margin-top: 10px;">
              <h4 class="infoPanelTopics" ><strong>Features</strong></h4>



            <div style="display: flex; justify-content: space-between; align-items: center; width: 90%; margin-bottom: 5px;">
            
              <div style="display: flex; align-items: center; gap: 20px; padding-left: 20px">
                <span class="material-icons">male</span>
                <strong>Men</strong>
              </div>

              <img src="${details.men === 'yes' ? 'check' : details.men === 'no' ? 'cancel' : 'question'}.png" 
              style="width: 14px;" alt="Status Icon">
            </div>




          <div style="display: flex; justify-content: space-between; align-items: center; width: 90%; margin-bottom: 5px;">
            
            <div style="display: flex; align-items: center; gap: 20px; padding-left: 20px">
              <span class="material-icons">female</span>
              <strong>Women</strong>
            </div>


            <img src="${details.women === 'yes' ? 'check' : details.women === 'no' ? 'cancel' : 'question'}.png" 
            style="width: 14px;" alt="Status Icon">
          </div>



          <div style="display: flex; justify-content: space-between; align-items: center; width: 90%; margin-bottom: 5px;">
            
            <div style="display: flex; align-items: center; gap: 20px; padding-left: 20px">
              <span class="material-icons">accessible</span>
              <strong>Accessible</strong>
            </div>

            <img src="${details.accessible === 'yes' ? 'check' : details.accessible === 'no' ? 'cancel' : 'question'}.png" 
            style="width: 14px;" alt="Status Icon">

          


        

          </div>            </div>
            <div style="margin-top: 15px; display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 10px;">
              <span style=" flex-basis: 100%; text-align: left; font-size: 20px; padding-left: 15px;"><strong>This toilet is</strong></span>
              <span style="color: ${details.cleanliness === 'dirty' ? '#F57C00' : '#CCCCCC'}; flex: 1; text-align: center;"><strong>Dirty</strong></span>
              <span style="color: ${details.cleanliness === 'clean' ? '#F57C00' : '#CCCCCC'}; flex: 1; text-align: center;"><strong>Clean</strong></span>
              <span style="color: ${details.cleanliness === 'veryClean' ? '#F57C00' : '#CCCCCC'}; flex: 1; text-align: center;"><strong>Very Clean</strong></span>
            </div>
            <div style="margin-top: 10px;">
              <span style="font-size: 20px; display: flex; padding-left: 15px;"><strong>Fee</strong> </span>
              ${details.isFree === 'yes' 
                ? '<span style="margin-left: 25px; color: #F57C00; font-weight: bold; padding-left: 20px;">FREE</span>' 
                : `<span style="margin-left: 25px; color: #F57C00; font-weight: bold;">${details.price}</span>`}
            </div>
                

            </div>

            <!--/////////////////////////////////////////////////////-->

            <div class="infoPanelDiv" id="infoPanelDiv2">


            <div style="margin-top: 15px; padding-left: 15px; font-size: 20px;">
                  ${formatOpeningHours(details)}
                
            </div>

            </div>

            <!--/////////////////////////////////////////////////////-->

            <div class="infoPanelDiv" id="infoPanelDiv3">

            
            <div style="margin-top: 10px; padding-left: 15px; font-size: 20px;">
                  ${notesHtml}
            </div>




            <div style="margin-top: 10px; font-size: 13px; padding-left: 15px;">
              <p>This toilet was added by <span style= "color: #F57C00;" > ${username} </span> on ${formatDate(details.timestamp)} </p>
            </div>



            </div>
          </div>

    
  `;

  



  

  // Append the panel to the body
  document.body.appendChild(infoPanel);

  // Close button functionality
  document.getElementById('closeBtn').addEventListener('click', () => {
      infoPanel.classList.remove('show');
      setTimeout(() => infoPanel.remove(), 300); // Remove from DOM after animation
  });
}

// When marker is clicked, fetch data and display the panel
marker.on('click', async () => {
  createInfoPanel(toilet);
  
});




markerCluster.addLayer(marker); // Add marker to the cluster group

        

     
      });

      console.log("Toilet Locations:", locations);
    } else {
      console.log("No toilets found.");
    }
  } catch (error) {
    console.error("Error fetching toilet locations:", error);
  }
}

// --- AUTHENTICATION & FORM HANDLING --- //

// Monitor authentication state
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("User is signed in:", user.uid);
    currentUser = user;
  } else {
    console.log("No user is signed in.");
    currentUser = null;
  }
});

// Wait for DOM to load before initializing the map, setting events, and wiring up the form
document.addEventListener("DOMContentLoaded", function () {
  // Initialize the map (centered at an initial location)
  map = L.map("map").setView([47.5162, 14.5501], 8);

  // Add the MapTiler.Streets tile layer
  L.tileLayer.provider("MapTiler.Streets", {
    key: "Jjz68MUbUh6hPOf9bnWl",
    style: "65dd4672-b0b6-4acf-a9ad-86bd6c2a2345",
  }).addTo(map);

  // Add the marker cluster layer
  map.addLayer(markerCluster);

  // Mark that the user has interacted if the map starts moving
  map.on("movestart", () => {
    userInteracted = true;
  });

 
  // Start geolocation updates
  if (!navigator.geolocation) {
    console.log("Your browser doesn't support geolocation.");
  } else {
    navigator.geolocation.getCurrentPosition(getPosition, (err) =>
      console.error("Geolocation error:", err),
      { enableHighAccuracy: true }
    );
    
  }

    // Toggle opening hours section visibility based on radio button selection
    const openingHoursContainer = document.getElementById("opening-hours-form");
    const knowOpeningHoursYes = document.getElementById("knowOpeningHoursYes");
    const knowOpeningHoursNo = document.getElementById("knowOpeningHoursNo");
  
    knowOpeningHoursYes.addEventListener("change", () => {
      openingHoursContainer.classList.remove("hidden2");
    });
    knowOpeningHoursNo.addEventListener("change", () => {
      openingHoursContainer.classList.add("hidden2");
    });
  





  ///logic for the opening hours form////

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const timeOptions = generateTimeOptions();
  
  days.forEach(day => {
    const openSelect = document.querySelector(`select[name="${day}_open"]`);
    const closeSelect = document.querySelector(`select[name="${day}_close"]`);
    const closedCheckbox = document.querySelector(`input[name="${day}_closed"]`);
    const hoursCheckbox = document.querySelector(`input[name="${day}_24hours"]`);
    
    // Populate time dropdowns
    if (openSelect && closeSelect) {
      openSelect.innerHTML = timeOptions;
      closeSelect.innerHTML = timeOptions;
    }
    
    // Add event listeners to checkboxes
    if (closedCheckbox && hoursCheckbox) {
      closedCheckbox.addEventListener('change', function() {
        toggleTimeInputs(day, this.checked, 'closed');
      });
      
      hoursCheckbox.addEventListener('change', function() {
        toggleTimeInputs(day, this.checked, '24hours');
      });
    }
  });

  function generateTimeOptions() {
    let options = '<option value="">Select Time</option>';
    for (let hour = 0; hour < 24; hour++) {
      for (let min = 0; min < 60; min += 30) {
        const time = `${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
        options += `<option value="${time}">${time}</option>`;
      }
    }
    return options;
  }

  function toggleTimeInputs(day, isChecked, type) {
    const openSelect = document.querySelector(`select[name="${day}_open"]`);
    const closeSelect = document.querySelector(`select[name="${day}_close"]`);
    const closedCheckbox = document.querySelector(`input[name="${day}_closed"]`);
    const hoursCheckbox = document.querySelector(`input[name="${day}_24hours"]`);
    
    if (type === 'closed' && isChecked) {
      openSelect.disabled = true;
      closeSelect.disabled = true;
      hoursCheckbox.checked = false;
    } else if (type === '24hours' && isChecked) {
      openSelect.disabled = true;
      closeSelect.disabled = true;
      closedCheckbox.checked = false;
    } else {
      openSelect.disabled = false;
      closeSelect.disabled = false;
    }
  }
});



  



  // Fetch and display all existing toilet markers

  ////////////////////////////////////////////////////////////////////////////////////////////////////
  fetchAllToiletLocations();

  // --- Form submission for adding a new toilet --- //
  const form = document.getElementById("toiletForm");
  if (form) {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      if (!currentUser) {
        alert("Please log in before submitting the form.");
        window.location.href = "/reg.html";
        return;}

       // Ensure that crossLat and crossLong are set before calculating distance
      if (crossLat === undefined || crossLong === undefined) {
      alert("Please move the map to select a location.");
      return;
      }

      // Calculate the distance
      const distance = getDistance(userLat, userLong, crossLat, crossLong);

      // Check if the user is too far from the toilet location
      if (distance >= 50) {
        alert("You are too far from the toilet you are trying to add. Please get closer.");
        return;
      }

      
     

      // Collect form data
      const toiletName = document.getElementById("toiletName").value;
      const men = document.querySelector('input[data-group="men"]:checked')?.value || null;
      const women = document.querySelector('input[data-group="women"]:checked')?.value || null;
      const disabled = document.querySelector('input[data-group="disabled"]:checked')?.value || null;
      const cleanliness = document.querySelector('input[name="cleanliness"]:checked')?.value || null;
      const isFree = document.querySelector('input[name="isFree"]:checked')?.value || null;
      const price = document.getElementById("priceInput").value;

      const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
      const openingHours = {};
      days.forEach(day => {
        openingHours[day] = {
          open: document.querySelector(`select[name="${day}_open"]`).value,
          close: document.querySelector(`select[name="${day}_close"]`).value,
          closed: document.querySelector(`input[name="${day}_closed"]`).checked,
          fullDay: document.querySelector(`input[name="${day}_24hours"]`).checked
        };
      });

      const notes = document.getElementById("toiletNotes");

      if (notes) {
        let alertShown = false; // Flag to track if the alert has been shown

        notes.addEventListener("input", function () {
          if (this.value.length > 300) {
            this.value = this.value.substring(0, 300); // Trim to 100 characters
            if (!alertShown) {
              alert("You can only enter up to 300 characters.");
              alertShown = true; // Set flag to prevent multiple alerts
              setTimeout(() => {
                alertShown = false; // Reset flag after user continues typing
              }, 1000); // Allow alert again after 1 second (adjustable)
            }
          }
        });
}

      





      // Create the data object with the current map center as the toilet's location
      const toiletData = {
        toiletName,
        crossLat,
        crossLong,
        men,
        women,
        disabled,
        cleanliness,
        isFree,
        price,
        timestamp: new Date().toISOString(),
        openingHours,  
        notes       
      };

      try {
        const userID = currentUser.uid;
        const toiletsRef = ref(database, `toilets/${userID}`);
        const newToiletRef = push(toiletsRef);
        await set(newToiletRef, toiletData);
        alert("Toilet added successfully!");
        form.reset();
      } catch (error) {
        console.error("Error adding data:", error);
        alert("Failed to add toilet.");
      }
    });
  }

  // --- Logout handling --- //
  const logoutButton = document.getElementById("logoutButton");
  if (logoutButton) {
    logoutButton.addEventListener("click", () => {
      signOut(auth)
        .then(() => {
          console.log("User logged out successfully.");
          window.location.href = "/index.html";
        })
        .catch((error) => {
          console.error("Error during logout:", error);
        });
    });
  }
;
