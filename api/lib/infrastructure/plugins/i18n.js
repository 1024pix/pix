const hapiI18n = require('hapi-i18n');

module.exports = {
  plugin: hapiI18n,
  options: {
    locales: ['en', 'fr'],
    directory: __dirname + '/../../../translations',
    defaultLocale: 'fr',
    queryParameter: 'lang',
    languageHeaderField: 'Accept-Language',
    objectNotation: true,
    updateFiles: false,
  },
};
