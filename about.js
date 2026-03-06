const imageElement = document.getElementById("aboutRotatingImage");
const images = ["1.jpg", "2.jpg"];
let currentIndex = 0;

if (imageElement) {
  setInterval(() => {
    currentIndex = (currentIndex + 1) % images.length;
    imageElement.src = images[currentIndex];
  }, 5000);
}