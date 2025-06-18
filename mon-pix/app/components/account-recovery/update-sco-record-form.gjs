import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixButtonLink from '@1024pix/pix-ui/components/pix-button-link';
import PixCheckbox from '@1024pix/pix-ui/components/pix-checkbox';
import PixInput from '@1024pix/pix-ui/components/pix-input';
import PixInputPassword from '@1024pix/pix-ui/components/pix-input-password';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { htmlSafe } from '@ember/template';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import t from 'ember-intl/helpers/t';
import not from 'ember-truth-helpers/helpers/not';
import or from 'ember-truth-helpers/helpers/or';
import isEmpty from 'lodash/isEmpty';

import isPasswordValid from '../../utils/password-validator';

const STATUS_MAP = {
  defaultStatus: 'default',
  errorStatus: 'error',
  successStatus: 'success',
};

const ERROR_INPUT_MESSAGE_MAP = {
  emptyPassword: 'pages.account-recovery.update-sco-record.form.errors.empty-password',
  wrongPasswordFormat: 'pages.account-recovery.update-sco-record.form.errors.invalid-password',
};

class PasswordValidation {
  @tracked status = STATUS_MAP['defaultStatus'];
  @tracked message = null;
}

export default class UpdateScoRecordFormComponent extends Component {
  <template>
    <h1 class="account-recovery__content--title">
      {{t "pages.account-recovery.update-sco-record.welcome-message" firstName=@firstName}}
    </h1>
    <p id="choose-password" class="account-recovery__content--information-text--details">
      {{t "pages.account-recovery.update-sco-record.form.choose-password"}}
    </p>
    {{#if (or @hasGarAuthenticationMethod @hasScoUsername)}}
      <p id="removal-notice" class="account-recovery__content--information-text--details">
        {{t
          "pages.account-recovery.update-sco-record.form.authentication-methods-removal-notice"
          connections=this.scoConnectionsText
          htmlSafe=true
        }}
      </p>
      <p id="new-connection-info" class="account-recovery__content--information-text--details">
        {{t "pages.account-recovery.update-sco-record.form.new-connection-info"}}
      </p>
    {{/if}}
    <form onSubmit={{this.submitUpdate}} class="account-recovery__content--form">
      <div class="account-recovery__content--form-fields">
        <PixInput @id="email" @value={{@email}} @disabled={{true}}>
          <:label>{{t "pages.account-recovery.update-sco-record.form.email-label"}}</:label>
        </PixInput>

        <PixInputPassword
          @id="password"
          @value={{this.password}}
          autocomplete="off"
          {{on "focusout" this.validatePassword}}
          {{on "input" this.handlePasswordInput}}
          @validationStatus={{this.passwordValidation.status}}
          @errorMessage={{this.passwordValidation.message}}
          @requiredLabel={{true}}
        >
          <:label>{{t "pages.account-recovery.update-sco-record.form.password-label"}}</:label>
        </PixInputPassword>

        <div class="update-sco-record-form__cgu-container">
          <PixCheckbox {{on "change" this.onChange}}>
            <:label>
              {{t
                "common.cgu.message"
                cguUrl=this.cguUrl
                dataProtectionPolicyUrl=this.dataProtectionPolicyUrl
                htmlSafe=true
              }}
            </:label>
          </PixCheckbox>
        </div>

        <PixButton
          @type="submit"
          @isDisabled={{not this.isSubmitButtonEnabled}}
          class="account-recovery__content--actions update-sco-record-form__buttons"
        >
          {{t "pages.account-recovery.update-sco-record.form.login-button"}}
        </PixButton>
      </div>
    </form>

    <PixButtonLink @route="logout" class="account-recovery__content--actions update-sco-record-form__buttons">
      {{t "common.actions.quit"}}
    </PixButtonLink>
  </template>
  @service intl;
  @service url;
  @tracked cguAndProtectionPoliciesAccepted = false;
  @tracked password = '';
  @tracked passwordValidation = new PasswordValidation();

  get cguUrl() {
    return this.url.cguUrl;
  }

  get dataProtectionPolicyUrl() {
    return this.url.dataProtectionPolicyUrl;
  }

  get isSubmitButtonEnabled() {
    return (
      isPasswordValid(this.password) &&
      !this._hasAPIRejectedCall() &&
      this.cguAndProtectionPoliciesAccepted &&
      !this.args.isLoading
    );
  }

  get scoConnectionsText() {
    const scoConnectionsTextParts = [];
    const usernameConnection = this.intl.t('pages.account-recovery.update-sco-record.form.sco-connections.username');
    const garConnection = this.intl.t('pages.account-recovery.update-sco-record.form.sco-connections.gar');
    if (this.args.hasGarAuthenticationMethod) {
      scoConnectionsTextParts.push(garConnection);
    }
    if (this.args.hasScoUsername) {
      scoConnectionsTextParts.push(usernameConnection);
    }
    if (scoConnectionsTextParts.length === 0) {
      return '';
    }
    const listFormatter = new Intl.ListFormat(this.intl.primaryLocale, {
      style: 'long',
      type: 'conjunction',
    });
    const formattedListParts = listFormatter.formatToParts(scoConnectionsTextParts);
    const htmlParts = formattedListParts.map((part) => {
      if (part.type === 'element') {
        return `<strong>${part.value}</strong>`;
      } else {
        return part.value;
      }
    });
    return htmlSafe(htmlParts.join(''));
  }

  @action
  onChange(event) {
    this.cguAndProtectionPoliciesAccepted = !!event.target.checked;
  }

  @action validatePassword() {
    if (isEmpty(this.password)) {
      this.passwordValidation.status = STATUS_MAP['errorStatus'];
      this.passwordValidation.message = this.intl.t(ERROR_INPUT_MESSAGE_MAP['emptyPassword']);
      return;
    }

    const isInvalidInput = !isPasswordValid(this.password);
    if (isInvalidInput) {
      this.passwordValidation.status = STATUS_MAP['errorStatus'];
      this.passwordValidation.message = this.intl.t(ERROR_INPUT_MESSAGE_MAP['wrongPasswordFormat']);
      return;
    }

    this.passwordValidation.status = STATUS_MAP['successStatus'];
    this.passwordValidation.message = null;
  }

  @action
  handlePasswordInput(event) {
    this.password = event.target.value;
  }

  @action
  async submitUpdate(event) {
    event.preventDefault();
    this.passwordValidation.status = STATUS_MAP['successStatus'];
    this.passwordValidation.message = null;
    this.args.updateRecord(this.password);
  }

  _hasAPIRejectedCall() {
    return this.passwordValidation.status === STATUS_MAP['errorStatus'];
  }
}
