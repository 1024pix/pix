import path from 'path';
import i18n from 'i18n';

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

export default { getI18n };
