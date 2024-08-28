const { spawn } = require('child_process');

const type = '1';  // IGCSE
const subjects = '0610,0620,0625';
const years = '2022,2023,2024';
const components = '22,42,62';
const paperTypes = '1,2';
const seasons = '1,2,3';

// Set environment variables
const env = {
    TYPE: type,
    SUBJECTS: subjects,
    YEARS: years,
    COMPONENTS: components,
    PAPERTYPES: paperTypes,
    SEASONS: seasons,
    ...process.env  // inherit other environment variables
};

// Spawn a new process to run index.js
const child = spawn('node', ['index.js'], { env });

child.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
});

child.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
});

child.on('close', (code) => {
    console.log(`child process exited with code ${code}`);
});
