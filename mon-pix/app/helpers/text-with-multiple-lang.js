import { helper } from '@ember/component/helper';

function _clean(text) {
  return text.replace(/\[\/?(fr|en)\]/g, '');
}
export function textWithMultipleLang(params) {
  const text = params[0];
  const lang = params[1];
  const regex = new RegExp(`(\\[${lang}\\]){1}(.|\n)*?(\\[\\/${lang}\\]){1}`);
  const textForLang = text.match(regex);
  return textForLang ? _clean(textForLang[0]) : _clean(text);
}

export default helper(textWithMultipleLang);
