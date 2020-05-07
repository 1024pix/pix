const path = require('path');
const fs = require('fs');

const DIRECTORY_PATH = process.argv[2];

const readDirRecursive = function(workingDirectoryPath) {
  fs.readdir(workingDirectoryPath, function(err, files) {
    if (err) {
      return console.log('Unable to scan directory: ' + err);
    }

    files.forEach(function(file) {
      const fileExt = path.extname(file);
      if (fileExt && fileExt.includes('scss')) {
        _editFile(`${workingDirectoryPath}/${file}`);
      } else {
        readDirRecursive(`${workingDirectoryPath}/${file}`);
      }
    });
  });
};

function _editFile(scssFile) {
  const content = fs.readFileSync(scssFile).toString();
  const fontSizeInRem = _convertFontSizePxtoRem(content);
  const fontSizeInRem16pxBase = _convertRemTo16PxBase(fontSizeInRem);

  fs.writeFileSync(scssFile, fontSizeInRem16pxBase);
}

function _convertFontSizePxtoRem(string) {
  function convert(chn, valueInPx) {
    return `font-size: ${(valueInPx / 10)}rem;`;
  }

  const fontsizePx = /font-size: (\d+)px;/g;
  return string.replace(fontsizePx, convert);
}

function _convertRemTo16PxBase(string) {
  function convert(chn, oldRem) {
    const valueInNewRem = Math.round(oldRem * 0.625 * 1000) / 1000;
    return `${valueInNewRem}rem;`;
  }

  const remValues = /([.\d]+)rem;/g;
  return string.replace(remValues, convert);
}

readDirRecursive(DIRECTORY_PATH);
