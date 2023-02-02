// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable no-undef */
const toDefaultExport = require('./module-exports-to-export-default.js');
const toNamedExport = require('./module-exports-to-named-export.js');
const toImportDefault = require('./require-to-import-default.js');
const singleRequire = require('./single-require.js');
const toNamedImport = require('./require-with-props-to-named-import.js');
const dotenvCjsImportToEsm = require('./dotenv-cjs-import-to-esm.js');
const dynamicRequireToEsImport = require('./dynamic-require-to-es-import.js');
const transformScripts = (fileInfo, api, options) => {
  return [
    toDefaultExport,
    toNamedExport,
    toImportDefault,
    dotenvCjsImportToEsm,
    toNamedImport,
    singleRequire,
    // dynamicRequireToEsImport,
  ].reduce((input, script) => {
    return script(
      {
        source: input,
      },
      api,
      options
    );
  }, fileInfo.source);
};

module.exports = transformScripts;
