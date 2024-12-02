// script.js
const container = document.getElementById("visualization-container");

// Initialize Three.js
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, container.offsetWidth / container.offsetHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(container.offsetWidth, container.offsetHeight);
container.appendChild(renderer.domElement);

// Create a sphere geometry as a placeholder for audio visualization
const geometry = new THREE.SphereGeometry(1, 32, 32);
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true });
const sphere = new THREE.Mesh(geometry, material);
scene.add(sphere);

camera.position.z = 5;

// Audio setup
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const analyser = audioContext.createAnalyser();
analyser.fftSize = 256;
const dataArray = new Uint8Array(analyser.frequencyBinCount);

// Request access to microphone
navigator.mediaDevices.getUserMedia({ audio: true })
  .then((stream) => {
    const source = audioContext.createMediaStreamSource(stream);
    source.connect(analyser);

    function animate() {
      requestAnimationFrame(animate);

      // Get frequency data
      analyser.getByteFrequencyData(dataArray);

      // Calculate average frequency to affect geometry
      const avgFrequency = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;

      // Adjust sphere scale based on audio input
      const scale = Math.max(1, avgFrequency / 50);
      sphere.scale.set(scale, scale, scale);

      // Change color based on frequency
      material.color.setHSL(avgFrequency / 256, 1, 0.5);

      renderer.render(scene, camera);
    }

    animate();
  })
  .catch((err) => {
    console.error("Microphone access denied: ", err);
  });
