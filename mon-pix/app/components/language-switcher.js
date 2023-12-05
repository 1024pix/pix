import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class LanguageSwitcher extends Component {
  @tracked selectedLanguage = this.args.selectedLanguage;

  availableLanguages = [
    { label: 'Français', value: 'fr' },
    { label: 'English', value: 'en' },
    { label: 'Nederlands', value: 'nl' },
  ];

  @action
  onChange(value) {
    this.selectedLanguage = value;
    this.args.onLanguageChange(value);
  }
}
