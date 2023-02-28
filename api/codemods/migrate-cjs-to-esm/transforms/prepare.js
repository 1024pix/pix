// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable no-undef */
const codemods = [
  require('./src/add-file-extension-to-import'),
  require('./src/cjs-anonymous-function-export-to-cjs-named-export'),
  require('./src/cjs-named-export-containing-functions-to-cjs-named-export'),
  require('./src/cjs-anonymous-export-to-cjs-named-export'),
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
