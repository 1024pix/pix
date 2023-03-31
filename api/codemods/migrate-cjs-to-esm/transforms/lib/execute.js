// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable no-undef */
const codemods = [
  require('../src/cjs-export-to-esm-export'),
  require('../src/cjs-export-directly-specified-on-exports-expression-key-to-esm'),
  require('../src/cjs-named-import-with-key-chained-require-to-esm-named-import'),
  require('../src/cjs-anonymous-import-to-namespace-import'),
  require('../src/cjs-import-to-esm-named-import'),
  require('../src/cjs-package-import-to-esm-import'),
  require('../src/cjs-import-invocation-only-to-esm-import'),
  require('../src/esm-named-package-import-to-default-import'),
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
