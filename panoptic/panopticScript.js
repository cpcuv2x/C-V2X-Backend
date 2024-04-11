const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

let isPanopticInProgress = false;
const videoOriginalDirectory = path.join(__dirname, '../videos/original');
// Ensure the videos directory exists
if (!fs.existsSync(videoOriginalDirectory)) {
	fs.mkdirSync(videoOriginalDirectory);
}

const videoPanopticDirectory = path.join(__dirname, '../videos/panoptic');
// Ensure the videos directory exists
if (!fs.existsSync(videoPanopticDirectory)) {
	fs.mkdirSync(videoPanopticDirectory);
}

// Function to check if a file exists
const fileExists = (filePath) => {
	try {
		return fs.existsSync(filePath);
	} catch (err) {
		console.error(`Error checking if file exists: ${err}`);
		return false;
	}
};

// Function to scan the original videos folder and run Python script if necessary
const scanAndProcessVideos = () => {
	// Read original folder
	fs.readdir(videoOriginalDirectory, (err, files) => {
		if (err) {
			console.error(`Error reading original videos folder: ${err}`);
			return;
		}

		// For each video file in the original folder
		files.forEach((file) => {
			const fileName = path.parse(file).name;
			const panopticVideoPath = path.join(
				videoPanopticDirectory,
				`${fileName}.mp4`
			);

			// Check if the video file exists in the panoptic folder
			if (!fileExists(panopticVideoPath)) {
				// Run Python script with filename
				// console.log(fileName);
				runPythonScript(fileName);
			}
		});
	});
};

// Function to run Python script with filename as argument
const runPythonScript = (fileName) => {
	if (isPanopticInProgress) {
		// console.log(
		// 	`panoptic is already in progress. Skipping this ${fileName} iteration.`
		// );
		return;
	}
	isPanopticInProgress = true;
	const activateEnvCommand = `conda activate env_pytorch &&`;
	const command = `${activateEnvCommand} python ./panoptic/panoptic_sementation.py ${fileName}`;

	const pythonProcess = spawn(command, {
		shell: true, // Use shell to run multiple commands
	});

	pythonProcess.stdout.on('data', (data) => {
		console.log(`Python script stdout: ${data}`);
	});

	pythonProcess.stderr.on('data', (data) => {
		console.error(`Python script stderr: ${data}`);
	});

	pythonProcess.on('close', (code) => {
		console.log(`Python script process exited with code ${code}`);
		isPanopticInProgress = false;
	});
};

module.exports.scanAndProcessVideos = scanAndProcessVideos;
