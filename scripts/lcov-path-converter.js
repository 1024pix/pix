const fs = require('fs');
const projectPath = process.argv[2];
const lcovFile = `${projectPath}/coverage/lcov.info`;

fs.readFile(lcovFile, 'utf8', (err, data) => {

  if (err) return console.error(err);

  const result = data.replace(/^SF:/g, `SF:${projectPath}/`);

  fs.writeFile(lcovFile, result, 'utf8', (err) => {

    if (err) return console.error(err);

    console.log('LCOV file converted.');
  });

});
