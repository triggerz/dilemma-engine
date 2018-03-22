const fs = require('fs');
const path = require('path');
const semver = require('semver');
const pkg = require( '../package.json');

let deployVersion = pkg.version;

if (process.argv.length > 2) {
  if (process.argv[2].toLowerCase() === '--latest') {
    deployVersion = 'latest';
  } else {
    console.log('Only supported parameter is --latest');
    process.exit(-1);
  }
}

const outputFolder = `deploy/${deployVersion}`;

console.log(`Deploying version: ${deployVersion} into ${outputFolder}`);

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
