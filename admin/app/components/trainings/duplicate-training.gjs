import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixModal from '@1024pix/pix-ui/components/pix-modal';
import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';

export default class DuplicateTraining extends Component {
  @tracked showModal = false;

  @action
  closeModal() {
    this.showModal = false;
  }

  @action
  openModal() {
    this.showModal = true;
  }

  @action
  validateDuplication() {
    this.args.onSubmit();
    this.showModal = false;
  }

  <template>
    <PixButton @size="small" @variant="secondary" @triggerAction={{this.openModal}}>{{t
        "pages.trainings.training.duplicate.button.label"
      }}
    </PixButton>
    <PixModal
      @title={{t "pages.trainings.training.duplicate.modal.title"}}
      @showModal={{this.showModal}}
      @onCloseButtonClick={{this.closeModal}}
    >
      <:content>
        <p>
          {{t "pages.trainings.training.duplicate.modal.instruction"}}
        </p>
      </:content>
      <:footer>
        <PixButton @variant="secondary" @isBorderVisible={{true}} @triggerAction={{this.closeModal}}>
          {{t "common.actions.cancel"}}
        </PixButton>
        <PixButton @triggerAction={{this.validateDuplication}}>{{t "common.actions.validate"}}</PixButton>
      </:footer>
    </PixModal>
  </template>
}
