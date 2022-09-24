import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

export default class PdfParametersModal extends Component {
  @tracked language = null;
  @tracked title = null;
  @tracked errorMessage = null;

  @action
  submit() {
    if (this._isInvalid()) {
      this.errorMessage = 'Tous les champs doivent être renseignés';
      return;
    }

    this.errorMessage = null;
    this.args.onDownloadButtonClicked(this.language, this.title);
  }

  @action
  onChangeTitle(event) {
    this.title = event.target.value;
  }

  @action
  onChangeLanguage(event) {
    this.language = event.target.value;
  }

  _isInvalid() {
    return !this.language?.trim() && !this.title?.trim();
  }
}
