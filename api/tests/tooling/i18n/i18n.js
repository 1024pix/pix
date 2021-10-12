const path = require('path');
const i18n = require('i18n');

function getI18n() {
  const directory = path.resolve(path.join(__dirname, '../../../translations'));
  i18n.configure({
    locales: ['fr'],
    defaultLocale: 'fr',
    directory,
    objectNotation: true,
    updateFiles: false,
    missingKeyFn: function (locale, value) {
      throw new Error(`Key "${value}" not found in locale "${locale}"`);
    },
  });
  return i18n;
}

module.exports = { getI18n };
