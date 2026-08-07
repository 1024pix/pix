import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixInput from '@1024pix/pix-ui/components/pix-input';
import PixInputPassword from '@1024pix/pix-ui/components/pix-input-password';
import PixNotificationAlert from '@1024pix/pix-ui/components/pix-notification-alert';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import t from 'ember-intl/helpers/t';
import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty';

import isEmailValid from '../../utils/email-validator';

const ERROR_INPUT_MESSAGE_MAP = {
  invalidEmail: 'pages.user-account.account-add-or-update-email-with-validation.fields.errors.invalid-email',
  emptyPassword: 'pages.user-account.account-add-or-update-email-with-validation.fields.errors.empty-password',
  emailAlreadyExist:
    'pages.user-account.account-add-or-update-email-with-validation.fields.errors.new-email-already-exist',
  invalidOrAlreadyUsedEmail:
    'pages.user-account.account-add-or-update-email-with-validation.fields.errors.invalid-or-already-used-email',
  invalidPassword: 'pages.user-account.account-add-or-update-email-with-validation.fields.errors.invalid-password',
  unknownError: 'pages.user-account.account-add-or-update-email-with-validation.fields.errors.unknown-error',
};

export default class EmailWithValidationForm extends Component {
  @service intl;
  @service emailVerificationCode;
  @tracked newEmail = '';
  @tracked password = '';
  @tracked newEmailValidationMessage = null;
  @tracked errorMessage = null;
  @tracked hasRequestedUpdate = false;
  @tracked newEmailValidationStatus = 'default';

  get isFormValid() {
    return isEmailValid(this.newEmail) && !isEmpty(this.password);
  }

  @action
  validateNewEmail(event) {
    this.newEmail = event.target.value;
    this.newEmail = this.newEmail.trim();
    const isInvalidInput = !isEmailValid(this.newEmail);

    this.newEmailValidationMessage = null;
    this.newEmailValidationStatus = 'default';

    if (isInvalidInput) {
      this.newEmailValidationStatus = 'error';
      this.newEmailValidationMessage = this.intl.t(ERROR_INPUT_MESSAGE_MAP['invalidEmail']);
    }
  }

  @action
  async onSubmit(event) {
    event && event.preventDefault();

    this.errorMessage = null;

    if (this.isFormValid) {
      try {
        if (!this.hasRequestedUpdate) {
          this.hasRequestedUpdate = true;

          await this.emailVerificationCode.sendNewEmail({
            password: this.password,
            newEmail: this.newEmail,
            action: 'update-email',
          });

          this.args.showVerificationCode({ newEmail: this.newEmail, password: this.password });
        }
      } catch (response) {
        this.handleSubmitError(response);
      } finally {
        this.hasRequestedUpdate = false;
      }
    }
  }

  @action
  passwordChanged(event) {
    this.password = event.target.value;
  }

  handleSubmitError(response) {
    const status = get(response, 'errors[0].status');
    if (status === '422') {
      const pointer = get(response, 'errors[0].source.pointer');
      if (pointer.endsWith('email')) {
        this.errorMessage = this.intl.t(ERROR_INPUT_MESSAGE_MAP['invalidOrAlreadyUsedEmail']);
      }
      if (pointer.endsWith('password')) {
        this.errorMessage = this.intl.t(ERROR_INPUT_MESSAGE_MAP['emptyPassword']);
      }
    } else if (status === '400') {
      this.errorMessage = this.intl.t(ERROR_INPUT_MESSAGE_MAP['invalidPassword']);
    } else {
      this.errorMessage = this.intl.t(ERROR_INPUT_MESSAGE_MAP['unknownError']);
    }
  }

  <template>
    <h2 class="update-email-with-validation__title">
      {{t "pages.user-account.account-add-or-update-email-with-validation.title.update-email"}}
    </h2>

    <form onSubmit={{this.onSubmit}}>
      <div class="update-email-with-validation__email-input">
        <PixInput
          @id="newEmail"
          @validationStatus={{this.newEmailValidationStatus}}
          @errorMessage={{this.newEmailValidationMessage}}
          @value={{this.newEmail}}
          type="email"
          {{on "change" this.validateNewEmail}}
          required
          autocomplete="off"
        >
          <:label>{{t
              "pages.user-account.account-add-or-update-email-with-validation.fields.email.update-email.label"
            }}</:label>
        </PixInput>
      </div>
      <div class="update-email-with-validation__informations">
        <p>{{t
            "pages.user-account.account-add-or-update-email-with-validation.fields.password.security-information"
          }}</p>
      </div>
      <div class="update-email-with-validation__password-input">
        <PixInputPassword
          @id="update-email-with-validation__password"
          {{on "change" this.passwordChanged}}
          required
          autocomplete="off"
        >
          <:label>{{t "pages.user-account.account-add-or-update-email-with-validation.fields.password.label"}}</:label>
        </PixInputPassword>
      </div>
      {{#if this.errorMessage}}
        <PixNotificationAlert @type="error">
          {{this.errorMessage}}
        </PixNotificationAlert>
      {{/if}}
      <div class="update-email-with-validation__action-buttons">
        <PixButton
          class="update-email-with-validation-actions__confirm-button"
          @type="submit"
          @isDisabled={{this.hasRequestedUpdate}}
        >
          {{t "pages.user-account.account-add-or-update-email-with-validation.save-button"}}
        </PixButton>
        <PixButton @triggerAction={{@disableEmailEditionMode}} @variant="secondary">
          {{t "common.actions.cancel"}}
        </PixButton>
      </div>
    </form>
  </template>
}
