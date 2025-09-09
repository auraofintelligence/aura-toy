// Import the necessary parts from the Three.js library
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// --- CORE SETUP (THE 'UNIVERSE') ---

// 1. Scene: This is the container for all our 3D objects.
const scene = new THREE.Scene();

// 2. Camera: This is our eye, determining what we see.
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5; // Move the camera back a bit so we can see the object

// 3. Renderer: This draws the scene onto the screen.
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('scene-container').appendChild(renderer.domElement);

// --- ADDING OBJECTS (THE 'AURA') ---

// 1. Geometry: The shape of our object. A torus is a donut shape.
const geometry = new THREE.TorusGeometry(2, 0.5, 16, 100);

// 2. Material: The "skin" of the object. MeshNormalMaterial colors based on direction.
const material = new THREE.MeshNormalMaterial();

// 3. Mesh: The final object, combining the shape and the skin.
const torus = new THREE.Mesh(geometry, material);
scene.add(torus); // Add our torus to the scene

// --- MAKING IT INTERACTIVE ---

// Controls: This allows us to use the mouse to rotate and zoom.
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // Makes the movement feel smoother

// --- CONNECTING THE UI ('WIRING IT UP') ---

const viewSelect = document.getElementById('view-select');
const resetButton = document.getElementById('reset-button');

// Listen for changes on the dropdown menu
viewSelect.addEventListener('change', function() {
    if (this.value === 'top_down') {
        // Move camera to a top-down position
        camera.position.set(0, 5, 0);
    } else {
        // Go back to the default position
        camera.position.set(0, 0, 5);
    }
    controls.update(); // Important: tell controls to update after changing camera
});

// Listen for clicks on the reset button
resetButton.addEventListener('click', function() {
    torus.position.set(0, 0, 0); // Reset torus position
    torus.rotation.set(0, 0, 0); // Reset torus rotation
    camera.position.set(0, 0, 5); // Reset camera position
    viewSelect.value = 'default'; // Reset the dropdown
    controls.update();
});


// --- THE RENDER LOOP (MAKES IT A MOVIE, NOT A PICTURE) ---

function animate() {
    requestAnimationFrame(animate); // This creates a loop
    
    // Slowly rotate the torus for a nice effect
    torus.rotation.x += 0.005;
    torus.rotation.y += 0.005;
    
    controls.update(); // Update controls every frame
    renderer.render(scene, camera); // Draw the scene
}

// Start the animation loop!
animate();

// Handle window resizing
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
