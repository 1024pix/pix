import Helper from '@ember/component/helper';
import { inject as service } from '@ember/service';

export default class textWithMultipleLang extends Helper {
  @service intl;

  compute(params) {
    const text = params[0];
    const lang = params[1];
    const listOfLocales = this.intl.locales;
    if (text && lang && listOfLocales.includes(lang)) {
      const regex = new RegExp(`(\\[${lang}\\]){1}(.|\n)*?(\\[\\/${lang}\\]){1}`);
      const textForLang = text.match(regex);
      return textForLang ? _clean(textForLang[0], listOfLocales) : _clean(text, listOfLocales);
    } else {
      return _clean(text, listOfLocales);
    }
  }
}

function _clean(text, listOfLocales) {
  const regex = new RegExp(`\\[(\\/)?(${listOfLocales.join('|')})\\]`, 'g');
  return text ? text.replace(regex, '') : text;
}
