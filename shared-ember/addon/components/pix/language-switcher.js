import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class PixLanguageSwitcherComponent extends Component {
  @tracked selectedLanguage = this.args.selectedLanguage;

  availableLanguages = [
    { label: 'Français', value: 'fr' },
    { label: 'English', value: 'en' },
  ];

  @action
  onChange(language) {
    this.selectedLanguage = language;
    this.args.onLanguageChange(language);
  }
}
