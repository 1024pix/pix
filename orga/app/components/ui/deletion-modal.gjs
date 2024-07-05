import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixCheckbox from '@1024pix/pix-ui/components/pix-checkbox';
import PixModal from '@1024pix/pix-ui/components/pix-modal';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';
import { not } from 'ember-truth-helpers';

export default class DeletionModal extends Component {
  @tracked allowDeletion = false;

  get isMultipleDeletion() {
    return this.args.count > 1;
  }

  get canDelete() {
    if (!this.isMultipleDeletion) {
      return true;
    }
    return this.allowDeletion;
  }

  @action
  giveDeletionPermission() {
    this.allowDeletion = !this.allowDeletion;
  }
  <template>
    <PixModal @title={{@title}} @showModal={{@showModal}} @onCloseButtonClick={{@onCloseModal}}>
      <:content>
        {{yield to="content"}}
        {{#if this.isMultipleDeletion}}
          <PixCheckbox
            {{on "click" this.giveDeletionPermission}}
            @size="small"
            @checked={{this.allowDeletion}}
            @class="deletion-modal__permission-checkbox"
          >
            <:label>
              <strong>
                {{t "components.ui.deletion-modal.confirmation-checkbox" count=@count}}
              </strong>
            </:label>
          </PixCheckbox>
        {{/if}}
      </:content>
      <:footer>
        <PixButton @variant="secondary" @triggerAction={{@onCloseModal}}>
          {{t "common.actions.cancel"}}
        </PixButton>
        <PixButton @variant="error" @triggerAction={{@onTriggerAction}} @isDisabled={{not this.canDelete}}>
          {{t "components.ui.deletion-modal.confirm-deletion"}}
        </PixButton>
      </:footer>
    </PixModal>
  </template>
}
