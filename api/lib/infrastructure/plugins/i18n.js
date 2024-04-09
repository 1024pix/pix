import * as url from 'node:url';

import hapiI18n from 'hapi-i18n';
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
  mustacheConfig: {
    tags: ['{', '}'],
    disable: false,
  },
};

export { options, plugin };
