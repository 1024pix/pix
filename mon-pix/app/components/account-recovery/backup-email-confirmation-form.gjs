import { PixButton, PixInput, PixNotificationAlert } from '@1024pix/nebulix-ember';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { LinkTo } from '@ember/routing';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import t from 'ember-intl/helpers/t';
import not from 'ember-truth-helpers/helpers/not';
import isEmpty from 'lodash/isEmpty';

import isEmailValid from '../../utils/email-validator';

const STATUS_MAP = {
  defaultStatus: 'default',
  errorStatus: 'error',
  successStatus: 'success',
};

const ERROR_INPUT_MESSAGE_MAP = {
  emailAlreadyExist: 'pages.account-recovery.find-sco-record.backup-email-confirmation.form.error.email-already-exist',
  newEmailAlreadyExist:
    'pages.account-recovery.find-sco-record.backup-email-confirmation.form.error.new-email-already-exist',
  emptyEmail: 'pages.account-recovery.find-sco-record.backup-email-confirmation.form.error.empty-email',
  wrongEmailFormat: 'pages.account-recovery.find-sco-record.backup-email-confirmation.form.error.wrong-email-format',
};

class EmailValidation {
  @tracked status = STATUS_MAP['defaultStatus'];
  @tracked message = null;
}

export default class BackupEmailConfirmationFormComponent extends Component {
  <template>
    <h1 class="account-recovery__content--title">
      {{t
        "pages.account-recovery.find-sco-record.backup-email-confirmation.email-is-needed-message"
        firstName=@firstName
      }}
    </h1>

    <div class="account-recovery__content--step--content">
      {{#if @existingEmail}}
        <div id="backup-email-confirmation-already-associated-error-message">
          <p class="account-recovery__content--information-text">
            {{t
              "pages.account-recovery.find-sco-record.backup-email-confirmation.email-already-exist-for-account-message"
            }}
            <strong>{{@existingEmail}}</strong>
          </p>
          <p class="account-recovery__content--information-text--details">
            {{t "pages.account-recovery.find-sco-record.backup-email-confirmation.email-is-valid-message"}}
            <LinkTo @route="password-reset-demand">
              {{t "pages.account-recovery.find-sco-record.backup-email-confirmation.email-reset-message"}}
            </LinkTo>
            {{t "pages.account-recovery.find-sco-record.backup-email-confirmation.ask-for-new-email-message"}}
          </p>
        </div>
      {{else}}
        <p class="account-recovery__content--information-text">
          {{t "pages.account-recovery.find-sco-record.backup-email-confirmation.email-sent-to-choose-password-message"}}
        </p>
      {{/if}}

      <form onSubmit={{this.submitBackupEmailConfirmationForm}}>
        <PixInput
          @id="email"
          @value={{this.email}}
          {{on "focusout" this.validateEmail}}
          {{on "input" this.handleInputChange}}
          @requiredLabel={{true}}
          @validationStatus={{this.emailValidation.status}}
          @errorMessage={{this.emailValidation.message}}
          autocomplete="off"
          type="text"
        >
          <:label>{{t "pages.account-recovery.find-sco-record.backup-email-confirmation.form.email"}}</:label>
        </PixInput>

        {{#if @showAlreadyRegisteredEmailError}}
          <PixNotificationAlert
            @type="error"
            class="account-recovery__content--not-found-error"
            id="backup-email-confirmation-already-use-error-message"
          >
            {{t
              "pages.account-recovery.find-sco-record.backup-email-confirmation.form.error.invalid-or-already-used-email"
            }}
          </PixNotificationAlert>
        {{/if}}

        <div class="account-recovery__content--actions">
          <PixButton @triggerAction={{@cancelAccountRecovery}} @variant="secondary">
            {{t "pages.account-recovery.find-sco-record.backup-email-confirmation.form.actions.cancel"}}
          </PixButton>
          <PixButton @type="submit" @isDisabled={{not this.isSubmitButtonEnabled}}>
            {{t "pages.account-recovery.find-sco-record.backup-email-confirmation.form.actions.submit"}}
          </PixButton>
        </div>
      </form>
    </div>
  </template>
  @service intl;

  @tracked email = '';
  @tracked emailValidation = new EmailValidation();

  get isSubmitButtonEnabled() {
    return isEmailValid(this.email) && !this._hasAPIRejectedCall() && !this.args.isLoading;
  }

  @action validateEmail() {
    this.args.resetErrors();
    this.email = this.email.trim();
    if (isEmpty(this.email)) {
      this.emailValidation.status = STATUS_MAP['errorStatus'];
      this.emailValidation.message = this.intl.t(ERROR_INPUT_MESSAGE_MAP['emptyEmail']);
      return;
    }

    const isInvalidInput = !isEmailValid(this.email);
    if (isInvalidInput) {
      this.emailValidation.status = STATUS_MAP['errorStatus'];
      this.emailValidation.message = this.intl.t(ERROR_INPUT_MESSAGE_MAP['wrongEmailFormat']);
      return;
    }

    this.emailValidation.status = STATUS_MAP['successStatus'];
    this.emailValidation.message = null;
  }

  @action
  handleInputChange(event) {
    this.email = event.target.value;
  }

  @action
  async submitBackupEmailConfirmationForm(event) {
    event.preventDefault();
    this.emailValidation.status = STATUS_MAP['successStatus'];
    this.emailValidation.message = null;
    this.args.sendEmail(this.email);
  }

  _hasAPIRejectedCall() {
    return this.emailValidation.status === STATUS_MAP['errorStatus'];
  }
}
