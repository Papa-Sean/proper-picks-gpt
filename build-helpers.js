const fs = require('fs');
const path = require('path');

// Function to ensure directory exists
function ensureDirectoryExists(dirPath) {
	if (!fs.existsSync(dirPath)) {
		fs.mkdirSync(dirPath, { recursive: true });
	}
}

// Clean export directory if it exists
const exportDir = path.join(__dirname, '.next', 'export');
if (fs.existsSync(exportDir)) {
	console.log('Cleaning export directory...');
	fs.rmSync(exportDir, { recursive: true, force: true });
}

// Clean out directory if it exists
const outDir = path.join(__dirname, 'out');
if (fs.existsSync(outDir)) {
	console.log('Cleaning out directory...');
	fs.rmSync(outDir, { recursive: true, force: true });
}

console.log('Directories cleaned successfully');
