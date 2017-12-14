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
const mainFiles = fs.readdirSync(path.join(buildFolder, 'js'));
const mainFile = mainFiles.find(file => file.startsWith('main') && file.endsWith('.js'));
const mainFilePath = path.join(buildFolder, 'js', mainFile);

const publicFolder = './public';
const publicFiles = fs.readdirSync(publicFolder);
const cssFile = publicFiles.find(file => file.startsWith('index') && file.endsWith('.css'));
const cssFilePath = path.join(publicFolder, cssFile);

fs.copyFileSync(mainFilePath, path.join(outputFolder, 'main.js'));
fs.copyFileSync(cssFilePath, path.join(outputFolder, 'index.css'));
