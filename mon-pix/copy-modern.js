const rimraf = require('rimraf');
const path = require('path');
const fs = require('fs');
const jsdom = require('jsdom');

const { JSDOM } = jsdom;

// dist and dist-modern index.html parsed as JSDOM
const modernPath = path.resolve('dist-modern', 'index.html');
const modernDOM = new JSDOM(fs.readFileSync(modernPath, { encoding: 'utf8' }));
const indexPath = path.resolve('dist-modern', 'index.html');
const indexDOM = new JSDOM(fs.readFileSync(indexPath, { encoding: 'utf8' }));

const modernScript = modernDOM.window.document.querySelector('script[src*="mon-pix"]');

function copyToDist(scriptSrc) {
  const currentPath = path.resolve('dist-modern', scriptSrc.substring(1));
  const newPath = path.resolve('dist', `${scriptSrc.slice(1, -3)}.modern.js`);
  fs.renameSync(currentPath, newPath);
}

function writeModernScriptToFile(dom, modernScript) {
  const script = dom.window.document.querySelector('script[data-modern-script]');
  script.setAttribute('src', `${modernScript.getAttribute('src').slice(0, -3)}.modern.js`);
  script.setAttribute('integrity', modernScript.getAttribute('integrity'));
}

// Move .modern script to /dist
copyToDist(modernScript.getAttribute('src'));
writeModernScriptToFile(indexDOM, modernScript);

const newHTML = indexDOM.serialize();

fs.writeFileSync(path.resolve('dist', 'index.html'), newHTML);
rimraf.sync('dist-modern');
