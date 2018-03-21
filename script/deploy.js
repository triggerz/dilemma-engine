const fs = require('fs');
const path = require('path');
const semver = require('semver');
const pjson = require('../package.json');

let deployVersion;

if (process.argv.length < 3) {
  console.log('Missing version argument. Use --latest or --version:x.y.z');
  process.exit();
}

if (process.argv[2].toLowerCase() === '--latest') {
  deployVersion = 'latest';
} else {
  if (process.argv[2].toLowerCase().indexOf('--version:') !== 0) {
    console.log(`Argument ${process.argv[2]} incorrect. Use --version:x.y.z`);
    process.exit();
  }
  
  deployVersion = process.argv[2].substr('--version:'.length);
  if (!semver.valid(deployVersion)) {
    console.log(`'${deployVersion}' is not a valid semantic version. See https://semver.org/`);
    process.exit();
  }
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
