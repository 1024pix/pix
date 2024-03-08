import { I18n } from 'i18n';
import path from 'path';
import * as url from 'url';

import { options } from '../../../lib/infrastructure/plugins/i18n.js';
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

function getI18n() {
  const directory = path.resolve(path.join(__dirname, '../../../translations'));

  const i18n = new I18n();
  i18n.configure({
    ...options,
    directory,
  });
  return i18n;
}

export { getI18n };
