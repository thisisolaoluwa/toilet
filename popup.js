// Function to fetch toilets and add markers
async function fetchAllToiletLocations() {
  const rootRef = ref(database);

  try {
    const snapshot = await get(child(rootRef, "toilets"));
    if (snapshot.exists()) {
      const toilets = snapshot.val();
      const locations = [];

      // Clear existing markers
      markers.forEach((marker) => map.removeLayer(marker));
      markers = [];

      Object.keys(toilets).forEach((userId) => {
        const userToilets = toilets[userId];
        Object.keys(userToilets).forEach((toiletId) => {
          const toiletData = userToilets[toiletId];
          const { crossLat, crossLong, toiletName } = toiletData;
          if (crossLat && crossLong) {
            const lat = parseFloat(crossLat);
            const lng = parseFloat(crossLong);
            if (!isNaN(lat) && !isNaN(lng)) {
              locations.push({ lat, lng, toiletName, ...toiletData });
            }
          }
        });
      });

      // Add markers to the map
      locations.forEach((toilet) => {
        const { lat, lng, toiletName, ...details } = toilet;
        const marker = L.marker([lat, lng], { icon: customIcon }).addTo(map);
        markers.push(marker);

        // Build the popup content
        const featuresHtml = `
          <div style="display: flex; align-items: center; gap: 5px;">
            <strong>Men</strong>
            <img src="icons/${details.men ? "check" : "cancel"}.png" alt="${details.men ? "Available" : "Not Available"}" style="width: 16px; height: 16px;">
          </div>
          <div style="display: flex; align-items: center; gap: 5px;">
            <strong>Women</strong>
            <img src="icons/${details.women ? "check" : "cancel"}.png" alt="${details.women ? "Available" : "Not Available"}" style="width: 16px; height: 16px;">
          </div>
          <div style="display: flex; align-items: center; gap: 5px;">
            <strong>Accessible</strong>
            <img src="icons/${details.accessible ? "check" : "question"}.png" alt="${details.accessible ? "Available" : "Unknown"}" style="width: 16px; height: 16px;">
          </div>
        `;

        const popupContent = `
          <div style="font-family: Arial, sans-serif; font-size: 14px; line-height: 1.5;">
            <h3 style="color: orange;">${toiletName || "Unnamed Toilet"}</h3>
            <button 
              onclick="alert('Direction details coming soon')" 
              style="background-color: orange; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; font-size: 14px;"
            >
              Direction
            </button>
            <hr>
            <div style="margin-top: 10px;">
              <h4 style="margin-bottom: 5px;">Features</h4>
              ${featuresHtml}
            </div>
            <hr>
            <div style="margin-top: 10px;">
              <p><strong>This toilet is</strong> <span style="color: green;">Clean</span></p>
            </div>
            <div style="margin-top: 10px;">
              <p><strong>Fee</strong> <span style="color: green;">FREE</span></p>
            </div>
            <hr>
            <div style="margin-top: 10px;">
              <p>You think this information is not correct? <a href="#" style="color: orange; text-decoration: underline;">Edit it</a></p>
            </div>
          </div>
        `;

        // Add popup to marker
        marker.bindPopup(popupContent);
      });

      console.log("Toilet Locations:", locations);
    } else {
      console.log("No toilets found.");
    }
  } catch (error) {
    console.error("Error fetching toilet locations:", error);
  }
}
