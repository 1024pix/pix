import Helper from '@ember/component/helper';
import { service } from '@ember/service';
import { htmlSafe, isHTMLSafe } from '@ember/template';

export default class textWithMultipleLang extends Helper {
  @service locale;

  compute(params) {
    let text = params[0];
    if (isHTMLSafe(text)) {
      text = text.toString();
    }
    const lang = this.locale.currentLanguage;
    const listOfLocales = this.locale.supportedLocales;
    let outputText = _clean(text, listOfLocales);

    if (text && listOfLocales.includes(lang)) {
      const multipleLangRegExp = new RegExp(`(\\[${lang}\\]){1}(.|\n)*?(\\[\\/${lang}\\]){1}`);
      const textForLang = text.match(multipleLangRegExp);
      outputText = textForLang ? _clean(textForLang[0], listOfLocales) : outputText;
    }
    return htmlSafe(outputText);
  }
}

function _clean(text, listOfLocales) {
  const regex = new RegExp(`\\[(\\/)?(${listOfLocales.join('|')})\\]`, 'g');
  return text ? text.replace(regex, '') : text;
}
