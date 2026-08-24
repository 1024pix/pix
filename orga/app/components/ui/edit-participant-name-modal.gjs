import { PixButton, PixInput, PixModal } from '@1024pix/nebulix-ember';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';

export default class EditParticipantNameModal extends Component {
  @service notifications;
  @service intl;
  @service store;
  @service currentUser;

  @tracked firstName = '';
  @tracked lastName = '';

  @tracked isLoading = false;

  constructor(...args) {
    super(...args);

    this.firstName = this.args.participant?.firstName || '';
    this.lastName = this.args.participant?.lastName || '';
  }

  @action
  updateFirstName(event) {
    this.firstName = event.target.value;
  }

  @action
  updateLastName(event) {
    this.lastName = event.target.value;
  }

  get hasChanges() {
    return this.firstName !== this.args.participant?.firstName || this.lastName !== this.args.participant?.lastName;
  }

  get areFieldsValid() {
    return this.isFirstNameValid && this.isLastNameValid;
  }

  get isFirstNameValid() {
    return Boolean(this.firstName.trim());
  }
  get isLastNameValid() {
    return Boolean(this.lastName.trim());
  }

  @action
  async updateParticipantName() {
    if (!this.areFieldsValid) {
      return;
    }
    if (!this.hasChanges) {
      this.notifications.sendSuccess(this.intl.t('components.ui.edit-participant-name-modal.success-message'));
      return this.args.onClose();
    }

    this.isLoading = true;

    try {
      const adapter = this.store.adapterFor('organization-participant');

      await adapter.updateParticipantName(
        this.currentUser.organization.id,
        this.args.participant.id,
        this.firstName.trim(),
        this.lastName.trim(),
      );

      this.args.participant.firstName = this.firstName.trim();
      this.args.participant.lastName = this.lastName.trim();

      this.notifications.sendSuccess(this.intl.t('components.ui.edit-participant-name-modal.success-message'));
      this.args.onClose();
    } catch {
      this.notifications.sendError(this.intl.t('api-error-messages.global'));
    } finally {
      this.isLoading = false;
    }
  }

  <template>
    <PixModal
      @title={{t "components.ui.edit-participant-name-modal.label"}}
      @showModal={{@show}}
      @onCloseButtonClick={{@onClose}}
    >
      <:content>

        <div class="name-edit-modal__content">

          <div class="input-container">
            <PixInput
              @id="firstName"
              @value={{this.firstName}}
              {{on "input" this.updateFirstName}}
              @requiredLabel={{t "common.form.mandatory-fields-title"}}
              @validationStatus={{if this.isFirstNameValid "default" "error"}}
              @errorMessage={{t "components.ui.edit-participant-name-modal.error-messages.first-name"}}
            >
              <:label>{{t "components.ui.edit-participant-name-modal.fields.first-name"}}</:label>
            </PixInput>
          </div>

          <div class="input-container">
            <PixInput
              @id="lastName"
              @value={{this.lastName}}
              {{on "input" this.updateLastName}}
              @requiredLabel={{t "common.form.mandatory-fields-title"}}
              @validationStatus={{if this.isLastNameValid "default" "error"}}
              @errorMessage={{t "components.ui.edit-participant-name-modal.error-messages.last-name"}}
            >
              <:label>{{t "components.ui.edit-participant-name-modal.fields.last-name"}}</:label>
            </PixInput>
          </div>

        </div>

      </:content>
      <:footer>
        <PixButton @triggerAction={{@onClose}} @variant="secondary">
          {{t "common.actions.cancel"}}
        </PixButton>

        <PixButton @triggerAction={{this.updateParticipantName}}>
          {{t "common.actions.save"}}
        </PixButton>
      </:footer>
    </PixModal>
  </template>
}
