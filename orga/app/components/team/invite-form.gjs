import { PixButton, PixModal, PixTextarea } from '@1024pix/nebulix-ember';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';

import isEmailValid from '../../utils/email-validator';

export default class InviteForm extends Component {
  @service intl;
  @tracked modalOpen = false;
  @tracked emailError = null;

  @action
  openModal() {
    const emailInput = this.args?.email?.trim();
    if (!emailInput) {
      this.emailError = this.intl.t('pages.team-new.errors.mandatory-email-field');
      return;
    }
    const emails = emailInput.split(',').map((email) => email.trim());
    const areEmailsValid = emails.every((email) => isEmailValid(email));

    if (!areEmailsValid) {
      this.emailError = this.intl.t('pages.team-new.errors.invalid-input');
      return;
    }
    this.emailError = null;
    this.modalOpen = true;
  }

  @action
  closeModal() {
    this.modalOpen = false;
  }

  <template>
    {{! template-lint-disable require-input-label }}
    <form {{on "submit" @onSubmit}} class="form" ...attributes>

      <div class="form__field">
        <PixTextarea
          @id="email"
          type="email"
          @value={{@email}}
          aria-invalid={{if this.emailError "true" "false"}}
          aria-describedby="email-error"
          class="invite-form__email-field"
          @requiredLabel={{t "common.form.mandatory-fields-title"}}
          {{on "change" @onUpdateEmail}}
        >
          <:label>{{t "pages.team-new-item.input-label"}}</:label>
        </PixTextarea>
        {{#if this.emailError}}
          <p id="email-error" class="invite-form__error-message">{{this.emailError}}</p>
        {{/if}}
      </div>

      <div class="form__validation">
        <PixButton @triggerAction={{@onCancel}} @variant="secondary">
          {{t "common.actions.cancel"}}
        </PixButton>
        <PixButton @triggerAction={{this.openModal}} @variant="secondary">
          {{t "pages.team-new-item.invite-button"}}
        </PixButton>
      </div>

      <PixModal
        class="invite-form__modal"
        @title={{t "pages.team-new.invite-form-modal.title"}}
        @showModal={{this.modalOpen}}
        @onCloseButtonClick={{this.closeModal}}
      >
        <:content>
          <p>{{t "pages.team-new.invite-form-modal.warning"}}</p>
          <p class="invite-form__question">{{t "pages.team-new.invite-form-modal.question"}}</p>
        </:content>

        <:footer>
          <PixButton @variant="secondary" @isBorderVisible={{true}} @triggerAction={{this.closeModal}}>
            {{t "common.actions.cancel"}}
          </PixButton>
          <PixButton @variant="secondary" @triggerAction={{@onSubmit}} @isLoading={{this.isLoading}}>{{t
              "pages.team-new.invite-form-modal.confirm"
            }}</PixButton>
        </:footer>
      </PixModal>
    </form>
  </template>
}
