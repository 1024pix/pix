import { PixButton, PixCheckbox, PixModal } from '@1024pix/nebulix-ember';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';
import { not } from 'ember-truth-helpers';

export default class DeletionModal extends Component {
  @tracked allowDeletion = false;

  get canDelete() {
    return this.allowDeletion;
  }

  @action
  toggleDeletionPermission() {
    this.allowDeletion = !this.allowDeletion;
  }

  @action
  closeModal() {
    this.args.onCloseModal?.();
    this.allowDeletion = false;
  }

  @action
  triggerAction() {
    this.args.onTriggerAction?.();
    this.allowDeletion = false;
  }

  <template>
    <PixModal @title={{@title}} @showModal={{@showModal}} @onCloseButtonClick={{this.closeModal}}>
      <:content>
        {{yield to="content"}}
        <PixCheckbox
          {{on "click" this.toggleDeletionPermission}}
          @size="small"
          @checked={{this.allowDeletion}}
          @class="deletion-modal__permission-checkbox"
        >
          <:label>
            <strong>
              {{t "common.actions.are-you-sure"}}
            </strong>
          </:label>
        </PixCheckbox>
      </:content>
      <:footer>
        <PixButton @variant="secondary" @triggerAction={{this.closeModal}}>
          {{t "common.actions.cancel"}}
        </PixButton>
        <PixButton @variant="error" @triggerAction={{this.triggerAction}} @isDisabled={{not this.canDelete}}>
          {{t "common.actions.confirm-deletion"}}
        </PixButton>
      </:footer>
    </PixModal>
  </template>
}
