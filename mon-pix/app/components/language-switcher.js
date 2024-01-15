import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

import languages from 'mon-pix/languages';

const FRENCH_LANGUAGE = 'fr';

export default class LanguageSwitcher extends Component {
  @tracked selectedLanguage = this.args.selectedLanguage;

  availableLanguages = this.mapToOptions(languages);

  @action
  onChange(value) {
    this.selectedLanguage = value;
    this.args.onLanguageChange(value);
  }

  mapToOptions(languages) {
    const options = Object.entries(languages)
      .filter(([_, config]) => config.languageSwitcherDisplayed)
      .map(([key, config]) => ({
        label: config.value,
        value: key,
      }));

    const optionsWithoutFrSortedByLabel = options
      .filter((option) => option.value !== FRENCH_LANGUAGE)
      .sort((option) => option.label);

    const frenchLanguageOption = options.find((option) => option.value === FRENCH_LANGUAGE);

    return [frenchLanguageOption, ...optionsWithoutFrSortedByLabel];
  }
}
