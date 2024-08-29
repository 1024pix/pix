import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixModal from '@1024pix/pix-ui/components/pix-modal';
import PixSelect from '@1024pix/pix-ui/components/pix-select';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';

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
    this.args.onDownloadButtonClicked(this.language);
  }

  @action
  onChangeLanguage(language) {
    this.language = language;
  }

  _isInvalid() {
    return !this.language?.trim();
  }

  <template>
    <PixModal @title="Paramètres du PDF" @onCloseButtonClick={{@onCloseButtonClicked}} @showModal={{@displayModal}}>
      <:content>
        <PixSelect
          @value={{this.language}}
          @onChange={{this.onChangeLanguage}}
          @options={{this.options}}
          @hideDefaultOption={{true}}
          class="pdf-modal--select"
        >
          <:label>Langue du référentiel (français ou anglais) :</:label>
        </PixSelect>
      </:content>
      <:footer>
        <PixButton
          @type="submit"
          @size="small"
          class="pix-button--background-transparent-light"
          {{on "click" @onCloseButtonClicked}}
        >
          {{t "common.actions.cancel"}}
        </PixButton>
        <PixButton @size="small" @triggerAction={{this.submit}}>Télécharger</PixButton>
      </:footer>
    </PixModal>
  </template>
}
