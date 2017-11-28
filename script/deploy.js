const fs = require('fs');
const path = require('path');
const pjson = require('../package.json');

let deployVersion;

if (process.argv[2].toLowerCase() === '--latest') {
  deployVersion = 'latest';
} else {
  console.log('Currently, only --latest works.');
}

const outputFolder = `deploy/${deployVersion}`;

console.log(`Deploying version: ${pjson.version} into ${outputFolder}`);

if (!fs.existsSync(outputFolder)) {
  fs.mkdirSync(outputFolder);
}

const buildFolder = './build/static';
const files = fs.readdirSync(path.join(buildFolder, 'js'));
const mainFile = files.find(file => file.startsWith('main') && file.endsWith('.js'));
const mainFilePath = path.join(buildFolder, 'js', mainFile);

fs.copyFileSync(mainFilePath, path.join(outputFolder, 'main.js'));
