import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixInput from '@1024pix/pix-ui/components/pix-input';
import PixModal from '@1024pix/pix-ui/components/pix-modal';
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

  errorMessage = 'Le nom ou le prénom ne peuvent pas être vides';

  constructor(...args) {
    super(...args);

    this.firstName = this.args.participant?.firstName || '';
    this.lastName = this.args.participant?.lastName || '';
  }

  submit(event) {
    event.preventDefault();
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
    return Boolean(this.firstName.trim()) && Boolean(this.lastName.trim());
  }

  @action
  async updateParticipantName() {
    if (!this.areFieldsValid) {
      return;
    }

    if (!this.hasChanges) {
      this.notifications.success('Nom mis à jour avec succès');
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

      this.notifications.success('Nom mis à jour avec succès');
      this.args.onClose();
    } catch (e) {
      this.notifications.error('Une erreur est survenue lors de la mise à jour du nom');
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
          {{#unless this.areFieldsValid}}
            {{t "components.ui.edit-participant-name-modal.error-message"}}
          {{/unless}}

          <PixInput
            @id="firstName"
            @value={{this.firstName}}
            {{on "input" this.updateFirstName}}
            @requiredLabel={{t "common.form.mandatory-fields-title"}}
          >
            <:label>{{t "components.ui.edit-participant-name-modal.fields.first-name"}}</:label>
          </PixInput>

          <PixInput @id="lastName" @value={{this.lastName}} {{on "input" this.updateLastName}} @requiredLabel={{true}}>
            <:label>{{t "components.ui.edit-participant-name-modal.fields.last-name"}}</:label>
          </PixInput>

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
