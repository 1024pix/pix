import Service from '@ember/service';
import dayjs from 'dayjs';

export default class DayjsLocaleLoaderService extends Service {
  #LOADERS = {
    de: () => import('dayjs/esm/locale/de.js'),
    en: () => import('dayjs/esm/locale/en.js'),
    es: () => import('dayjs/esm/locale/es.js'),
    fr: () => import('dayjs/esm/locale/fr.js'),
    it: () => import('dayjs/esm/locale/it.js'),
    nl: () => import('dayjs/esm/locale/nl.js'),
  };

  async load(locale) {
    const language = new Intl.Locale(locale).language;
    if (!Object.keys(this.#LOADERS).includes(language)) {
      throw new Error('Language not supported');
    }
    const { default: dayjsLocaleData } = await this.#LOADERS[language]();
    dayjs.locale(language, dayjsLocaleData);
  }
}
