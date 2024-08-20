import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixModal from '@1024pix/pix-ui/components/pix-modal';
import Component from '@glimmer/component';

export default class ConfirmPopup extends Component {
  get title() {
    return this.args.title || 'Merci de confirmer';
  }

  get closeTitle() {
    return this.args.closeTitle || 'Annuler';
  }

  get submitTitle() {
    return this.args.submitTitle || 'Confirmer';
  }

  get size() {
    return this.args.size || null;
  }

  <template>
    <PixModal @title={{this.title}} @onCloseButtonClick={{@cancel}} @showModal={{@show}}>
      <:content>
        <p>{{@message}}</p>
        <p class="confirm-popup__errors">{{@error}}</p>
      </:content>

      <:footer>
        <PixButton @variant="secondary" @triggerAction={{@cancel}}>
          {{this.closeTitle}}
        </PixButton>

        <PixButton @triggerAction={{@confirm}} @loadingColor="white" @variant="primary">
          {{this.submitTitle}}
        </PixButton>
      </:footer>
    </PixModal>
  </template>
}
