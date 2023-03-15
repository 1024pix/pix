import hapiI18n from 'hapi-i18n';
import * as url from 'url';
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
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
