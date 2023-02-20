export default {
  plugin: require('hapi-i18n'),
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
