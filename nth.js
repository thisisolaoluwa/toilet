const lat1 = 47.07636036657402;
const lon1 = 15.453225854244764;

const lat2 = 47.07622797393837;
const lon2 = 15.453815699405181;



// calculating distance beween user's location to the actual toilet
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);

  const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c * 1000; // Convert km to meters
}

const distance = getDistance(lat1, lon1, lat2, lon2);
console.log(`Distance: ${distance.toFixed(2)} meters`);












// --- GEOLOCATION FUNCTION --- //
function getPosition(position) {
  const lat = position.coords.latitude;
  const long = position.coords.longitude;
  const accuracy = position.coords.accuracy;

  // Remove previous markers/circles
  if (userMarker) map.removeLayer(userMarker);
  if (userCircle) map.removeLayer(userCircle);

  // Add a new circle to represent accuracy
  userCircle = L.circle([lat, long], { radius: accuracy }).addTo(map);

 

}