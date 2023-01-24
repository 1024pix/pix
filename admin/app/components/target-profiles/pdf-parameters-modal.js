import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

export default class PdfParametersModal extends Component {
  @tracked language = null;
  @tracked errorMessage = null;
  constructor() {
    super(...arguments);
    this.options = [
      { value: 'fr', label: 'Français' },
      { value: 'en', label: 'Anglais' },
    ];
    this.language = 'fr';
  }

  @action
  submit() {
    if (this._isInvalid()) {
      this.errorMessage = 'Tous les champs doivent être renseignés';
      return;
    }

    this.errorMessage = null;
    this.args.onDownloadButtonClicked(this.language, this.args.name);
  }

  @action
  onChangeLanguage(language) {
    this.language = language;
  }

  _isInvalid() {
    return !this.language?.trim();
  }
}
