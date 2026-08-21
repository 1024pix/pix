import { PixButton, PixModal } from '@1024pix/nebulix-ember';
import { fn } from '@ember/helper';
import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';

export default class DuplicateTraining extends Component {
  @tracked showModal = false;
  @tracked type = null;
  @tracked value = null;

  get displayDeletionPrerequisiteTrigger() {
    return this.args.training.prerequisiteTrigger;
  }

  get displayDeletionGoalTrigger() {
    return this.args.training.goalTrigger;
  }

  get modalTitle() {
    return this.type === 'goal'
      ? 'pages.trainings.training.delete.modal.goal-title'
      : 'pages.trainings.training.delete.modal.prerequisite-title';
  }

  @action
  resetTriggerElement() {
    this.value = null;
    this.type = null;
  }

  @action
  closeModal() {
    this.showModal = false;
    this.resetTriggerElement();
  }

  @action
  openModal(type, value) {
    this.showModal = true;
    this.type = type;
    this.value = value;
  }

  @action
  validateDestruction() {
    this.args.onSubmit(this.value);
    this.showModal = false;
    this.resetTriggerElement();
  }

  <template>
    {{#if this.displayDeletionPrerequisiteTrigger}}
      <PixButton
        @triggerAction={{fn this.openModal "prerequisite" @training.prerequisiteTrigger.id}}
        @variant="error"
      >{{t "pages.trainings.training.delete.button.prerequisite-label"}}</PixButton>
    {{/if}}
    {{#if this.displayDeletionGoalTrigger}}
      <PixButton @triggerAction={{fn this.openModal "goal" @training.goalTrigger.id}} @variant="error">{{t
          "pages.trainings.training.delete.button.goal-label"
        }}</PixButton>
    {{/if}}

    <PixModal @title={{t this.modalTitle}} @showModal={{this.showModal}} @onCloseButtonClick={{this.closeModal}}>
      <:content>
        <p>
          {{t "pages.trainings.training.delete.modal.instruction"}}
        </p>
      </:content>
      <:footer>
        <PixButton @variant="secondary" @isBorderVisible={{true}} @triggerAction={{this.closeModal}}>
          {{t "common.actions.cancel"}}
        </PixButton>
        <PixButton @triggerAction={{this.validateDestruction}}>{{t "common.actions.validate"}}</PixButton>
      </:footer>
    </PixModal>
  </template>
}
