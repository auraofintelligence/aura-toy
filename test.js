import { selectedCells, createGridTexture, ROWS, CELL_SIZE } from './script.js';

// This is a very simple testing "framework" to keep things dependency-free.
const testResults = document.getElementById('test-results');

function test(description, testFn) {
    const li = document.createElement('li');
    li.textContent = `Test: ${description}`;
    try {
        testFn();
        li.classList.add('pass');
        li.textContent += ' -> PASS';
    } catch (e) {
        li.classList.add('fail');
        li.textContent += ` -> FAIL: ${e.message}`;
        console.error(e);
    }
    testResults.appendChild(li);
}

// The main test logic, running after the page loads
window.addEventListener('load', () => {

    test('Correct cell is visually highlighted after selection', () => {
        // --- SETUP ---
        selectedCells.clear();
        const targetX = 3;
        const targetY = 10; // A cell in the upper part of the grid (Y=11 is the top row)
        const cellKey = `${targetX}-${targetY}`;

        // --- ACTION ---
        // 1. Programmatically select a cell
        selectedCells.add(cellKey);

        // 2. Generate the texture canvas, which is where the drawing happens
        const texture = createGridTexture();
        const canvas = texture.image;
        const context = canvas.getContext('2d');

        // --- ASSERT ---
        // We will now inspect the pixel data of the canvas to verify the fix.

        // Define the center of the cell we expect to be colored red
        const canvasX = Math.floor((targetX * CELL_SIZE) + (CELL_SIZE / 2));

        // This is the CRUCIAL part of the test.
        // With the fix, the drawing Y coordinate must be inverted.
        const correctedY = ROWS - 1 - targetY;
        const canvasY = Math.floor((correctedY * CELL_SIZE) + (CELL_SIZE / 2));

        // Get the pixel data at the *correct* location
        const pixelData = context.getImageData(canvasX, canvasY, 1, 1).data;

        // The color should be the red from the script (#ef4444)
        const red = [239, 68, 68];

        if (pixelData[0] !== red[0] || pixelData[1] !== red[1] || pixelData[2] !== red[2]) {
            throw new Error(`The pixel at the CORRECT location (${canvasX}, ${canvasY}) was not red. Found RGBA(${pixelData.join(',')}).`);
        }

        // Additionally, let's verify that the *buggy* location is NO LONGER red.
        // This ensures we didn't just paint the whole canvas red.
        const buggyCanvasY = Math.floor((targetY * CELL_SIZE) + (CELL_SIZE / 2));
        const buggyPixelData = context.getImageData(canvasX, buggyCanvasY, 1, 1).data;

        if (buggyPixelData[0] === red[0] && buggyPixelData[1] === red[1] && buggyPixelData[2] === red[2]) {
             throw new Error(`The pixel at the BUGGY location (${canvasX}, ${buggyCanvasY}) is still red, indicating the fix is not working.`);
        }
    });

});
