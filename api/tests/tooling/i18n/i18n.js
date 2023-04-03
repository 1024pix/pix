import path from 'path';
import i18n from 'i18n';
import * as url from 'url';
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

function getI18n() {
  const directory = path.resolve(path.join(__dirname, '../../../translations'));
  i18n.configure({
    locales: ['fr', 'en'],
    defaultLocale: 'fr',
    directory,
    objectNotation: true,
    updateFiles: false,
  });
  return i18n;
}

export { getI18n };
