import Helper from '@ember/component/helper';
import { service } from '@ember/service';
import type { SafeString } from '@ember/template';
import { htmlSafe, isHTMLSafe } from '@ember/template';

// Minimal typing of the still-JS locale service.
interface LocaleService {
  currentLanguage: string;
  availableLocales: string[];
}

type TranslatableText = string | SafeString | null | undefined;

interface TextWithMultipleLangSignature {
  Args: {
    Positional: [text: TranslatableText];
  };
  Return: SafeString;
}

export default class TextWithMultipleLang extends Helper<TextWithMultipleLangSignature> {
  @service declare locale: LocaleService;

  compute([text]: [TranslatableText]): SafeString {
    const rawText = isHTMLSafe(text) ? text.toString() : text;

    const lang = this.locale.currentLanguage;
    const listOfLocales = this.locale.availableLocales;
    let outputText = clean(rawText, listOfLocales);

    if (rawText && listOfLocales.includes(lang)) {
      const multipleLangRegExp = new RegExp(`(\\[${lang}\\]){1}(.|\n)*?(\\[\\/${lang}\\]){1}`);
      const textForLang = rawText.match(multipleLangRegExp);
      outputText = textForLang ? clean(textForLang[0], listOfLocales) : outputText;
    }
    return htmlSafe(outputText ?? '');
  }
}

function clean(text: string | null | undefined, listOfLocales: string[]): string | null | undefined {
  const regex = new RegExp(`\\[(\\/)?(${listOfLocales.join('|')})\\]`, 'g');
  return text ? text.replace(regex, '') : text;
}
