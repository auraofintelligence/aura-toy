// Import the necessary parts from the Three.js library
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// --- CORE SETUP ---
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 15;
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('scene-container').appendChild(renderer.domElement);
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// --- DATA GRID SETUP ---
const ROWS = 12;
const COLS = 24;
const CELL_SIZE = 20; // Size of each cell in pixels for the texture

// This Set will store the coordinates of selected cells, e.g., "3-5"
// This is the beginning of your vector data structure.
let selectedCells = new Set();

// --- THE OBJECT (THE DATA PLANE) ---

// We use a PlaneGeometry. This IS your 12x24 matrix in 3D space.
const planeGeometry = new THREE.PlaneGeometry(COLS, ROWS);

// The magic is here: we create the grid texture using a 2D canvas.
let gridTexture = createGridTexture();
const planeMaterial = new THREE.MeshBasicMaterial({ map: gridTexture });
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
scene.add(plane);


// --- TEXTURE FUNCTION (DRAWS OUR DATA) ---

// This function draws the grid onto a 2D canvas, which we then use as a "skin"
function createGridTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = COLS * CELL_SIZE;
    canvas.height = ROWS * CELL_SIZE;
    const context = canvas.getContext('2d');

    // Fill the background
    context.fillStyle = '#374151'; // A dark blue-grey
    context.fillRect(0, 0, canvas.width, canvas.height);

    // Draw selected cells
    context.fillStyle = '#ef4444'; // The red color from your design
    selectedCells.forEach(cellKey => {
        const [x, y] = cellKey.split('-').map(Number);
        context.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
    });

    // Draw grid lines
    context.strokeStyle = '#4b5563';
    context.lineWidth = 2;
    for (let i = 0; i <= COLS; i++) {
        context.beginPath();
        context.moveTo(i * CELL_SIZE, 0);
        context.lineTo(i * CELL_SIZE, ROWS * CELL_SIZE);
        context.stroke();
    }
    for (let i = 0; i <= ROWS; i++) {
        context.beginPath();
        context.moveTo(0, i * CELL_SIZE);
        context.lineTo(COLS * CELL_SIZE, i * CELL_SIZE);
        context.stroke();
    }
    
    return new THREE.CanvasTexture(canvas);
}

// Function to update the texture whenever data changes
function updateTexture() {
    gridTexture.dispose(); // Clean up the old texture
    gridTexture = createGridTexture();
    plane.material.map = gridTexture;
    plane.material.needsUpdate = true;
}

// --- INTERACTION (RAYCASTING) ---

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function onCanvasClick(event) {
    // Calculate mouse position in normalized device coordinates (-1 to +1)
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

    // Update the raycaster with the camera and mouse position
    raycaster.setFromCamera(mouse, camera);

    // Find what objects the ray intersects
    const intersects = raycaster.intersectObject(plane);

    if (intersects.length > 0) {
        // The first object is the closest one
        const intersect = intersects[0];

        // The 'uv' coordinate gives us the exact point on the plane (from 0.0 to 1.0)
        const uv = intersect.uv;

        // Convert the UV coordinate to our grid cell coordinate
        const x = Math.floor(uv.x * COLS);
        const y = Math.floor(uv.y * ROWS);
        const cellKey = `${x}-${y}`;

        // Toggle the cell's selection state
        if (selectedCells.has(cellKey)) {
            selectedCells.delete(cellKey);
        } else {
            selectedCells.add(cellKey);
        }

        // Redraw the texture with the new data
        updateTexture();
        
        // Update the UI counter
        document.getElementById('cell-count').textContent = selectedCells.size;
    }
}
document.getElementById('scene-container').addEventListener('click', onCanvasClick);


// --- UI WIRING ---

const resetButton = document.getElementById('reset-button');
const saveButton = document.getElementById('save-button');
const loadButton = document.getElementById('load-button');
const cellCountSpan = document.getElementById('cell-count');

resetButton.addEventListener('click', () => {
    selectedCells.clear();
    updateTexture();
    cellCountSpan.textContent = 0;
});

saveButton.addEventListener('click', () => {
    // localStorage can only store strings, so we convert our Set to an Array, then to a JSON string.
    const dataToSave = JSON.stringify(Array.from(selectedCells));
    localStorage.setItem('auraGridState', dataToSave);
    alert(`State saved with ${selectedCells.size} cells!`);
});

loadButton.addEventListener('click', () => {
    const savedData = localStorage.getItem('auraGridState');
    if (savedData) {
        // Convert the JSON string back into an Array, then into a Set.
        selectedCells = new Set(JSON.parse(savedData));
        updateTexture();
        cellCountSpan.textContent = selectedCells.size;
        alert(`State loaded with ${selectedCells.size} cells!`);
    } else {
        alert('No saved state found.');
    }
});


// --- RENDER LOOP ---
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}
animate();

// --- WINDOW RESIZE ---
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
