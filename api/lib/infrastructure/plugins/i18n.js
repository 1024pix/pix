import hapiI18n from 'hapi-i18n';
const plugin = hapiI18n;
const options = {
  locales: ['en', 'fr'],
  directory: __dirname + '/../../../translations',
  defaultLocale: 'fr',
  queryParameter: 'lang',
  languageHeaderField: 'Accept-Language',
  objectNotation: true,
  updateFiles: false,
};

export { plugin, options };
