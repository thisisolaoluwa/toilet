import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getDatabase, ref, set, push, get, child } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";

// Firebase configuration
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

// Custom icon for toilet markers
const customIcon = L.icon({
  iconUrl: "icon.png",
  iconSize: [21, 31],
  iconAnchor: [25, 50],
  popupAnchor: [0, -50],
});

const customIcon2 = L.icon({
  iconUrl: "walking-man2.png",
  iconSize: [38, 51],
  iconAnchor: [25, 50],
  popupAnchor: [0, -50],
});


// Global variables
let map;
let userMarker, userCircle;
let userInteracted = false;


// Create the marker cluster group and apply the custom icon
let markerCluster = L.markerClusterGroup({
  iconCreateFunction: function(cluster) {
    // Get the number of markers in the cluster
    const markerCount = cluster.getChildCount();
    
    return L.divIcon({
      html: `<div><span>${markerCount}</span></div>`, 
      className: 'custom-cluster-icon', 
      iconSize: L.point(40, 40), 
    });
  }
});




// Initialize the map
document.addEventListener("DOMContentLoaded", function () {
  map = L.map("map").setView([47.0679, 15.4417], 14);

  L.tileLayer.provider("MapTiler.Streets", {
    key: "Jjz68MUbUh6hPOf9bnWl",
    style: "65dd4672-b0b6-4acf-a9ad-86bd6c2a2345",
  }).addTo(map);

  map.addLayer(markerCluster); // Add cluster layer to the map

  map.on("movestart", () => {
    userInteracted = true;
  });


// go to user's location at the click of the button.

const findToiletLink = document.querySelector(".find-toilet-link");
  if (findToiletLink) {
    findToiletLink.addEventListener("click", function (event) {
      event.preventDefault(); // Prevent the default link behavior

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          function (position) {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;

            // Center the map on the user's location
            map.setView([lat, lng], 18);

            L.marker([lat, lng], {icon: customIcon2}).addTo(map)
              
          },
          function (error) {
            alert("Unable to retrieve your location.");
          }
        );
      } else {
        alert("Geolocation is not supported by your browser.");
      }
    });
  } else {
    console.error("No element with class 'find-toilet-link' found.");
  }


  fetchAllToiletLocations();


// Function to fetch lat and lng of all toilets and add markers from the database
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


});