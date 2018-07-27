const fs = require('fs');
const path = require('path');
const pixLivePath = path.join(__dirname, '..');
const lcovFile = `${pixLivePath}/coverage/lcov.info`;

fs.readFile(lcovFile, 'utf8', (err, data) => {

  if (err) return console.error(err);

  const result = data.replace(/SF:app/g, `SF:${pixLivePath}/app`);

  fs.writeFile(lcovFile, result, 'utf8', (err) => {

    if (err) return console.error(err);

    console.log('LCOV file converted.');
  });

});
