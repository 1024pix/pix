// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable no-undef */
const codemods = [
  require('./module-exports-to-export-default.js'),
  require('./module-exports-to-named-export.js'),
  require('./require-to-import-default.js'),
  require('./single-require.js'),
  require('./require-with-props-to-named-import.js'),
];

const transformScripts = (fileInfo, api, options) => {
  return codemods.reduce((input, script) => {
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
