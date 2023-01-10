const path = require('path');
const i18n = require('i18n');

function getI18n() {
  const directory = path.resolve(path.join(__dirname, '../../../translations'));
  i18n.configure({
    locales: ['fr', 'en'],
    defaultLocale: 'fr',
    directory,
    objectNotation: true,
    updateFiles: false,
    mustacheConfig: {
      tags: ['{', '}'],
      disable: false,
    },
  });
  return i18n;
}

module.exports = { getI18n };
