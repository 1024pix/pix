import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixInput from '@1024pix/pix-ui/components/pix-input';
import PixInputPassword from '@1024pix/pix-ui/components/pix-input-password';
import { fn } from '@ember/helper';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import t from 'ember-intl/helpers/t';
import FormTextfieldDate from 'mon-pix/components/form-textfield-date';
import PixToggleDeprecated from 'mon-pix/components/pix-toggle-deprecated';
import ENV from 'mon-pix/config/environment';
import { standardizeNumberInTwoDigitFormat } from 'mon-pix/utils/standardize-number';

import isEmailValid from '../../utils/email-validator';
import { getRegisterErrorsMessageByShortCode } from '../../utils/errors-messages';
import isPasswordValid from '../../utils/password-validator';

const ERROR_INPUT_MESSAGE_MAP = {
  firstName: 'pages.sco-signup-or-login.signup-form.fields.firstname.error',
  lastName: 'pages.sco-signup-or-login.signup-form.fields.lastname.error',
  dayOfBirth: 'pages.sco-signup-or-login.signup-form.fields.birthdate.day.error',
  monthOfBirth: 'pages.sco-signup-or-login.signup-form.fields.birthdate.month.error',
  yearOfBirth: 'pages.sco-signup-or-login.signup-form.fields.birthdate.year.error',
  email: 'pages.sco-signup-or-login.signup-form.fields.email.error',
  password: 'pages.sco-signup-or-login.signup-form.fields.password.error',
};

const isDayValid = (value) => value > 0 && value <= 31;
const isMonthValid = (value) => value > 0 && value <= 12;
const isYearValid = (value) => value > 999 && value <= 9999;
const isStringValid = (value) => !!value.trim();

class LastName {
  @tracked status = 'default';
  @tracked message = null;
}

class FirstName {
  @tracked status = 'default';
  @tracked message = null;
}

class Email {
  @tracked status = 'default';
  @tracked message = null;
}

class Password {
  @tracked status = 'default';
  @tracked message = null;
}

class DayOfBirth {
  @tracked status = 'default';
  @tracked message = null;
}

class MonthOfBirth {
  @tracked status = 'default';
  @tracked message = null;
}

class YearOfBirth {
  @tracked status = 'default';
  @tracked message = null;
}

class FormValidation {
  lastName = new LastName();
  firstName = new FirstName();
  email = new Email();
  password = new Password();
  dayOfBirth = new DayOfBirth();
  monthOfBirth = new MonthOfBirth();
  yearOfBirth = new YearOfBirth();
}

export default class ScoSignupForm extends Component {
  <template>
    {{! template-lint-disable no-triple-curlies }}
    <form {{on "submit" this.searchForMatchingStudent}} class="sco-signup-form">
      <span class="sco-signup-form__required-inputs">{{t "common.form.mandatory-fields" htmlSafe=true}}</span>

      <PixInput
        @id="firstName"
        @value={{this.firstName}}
        {{on "focusout" (fn this.triggerInputStringValidation "firstName" this.firstName)}}
        {{on "input" this.handleFirstNameInput}}
        @requiredLabel={{true}}
        @validationStatus={{this.validation.firstName.status}}
        @errorMessage={{this.validation.firstName.message}}
        @disabled={{this.matchingStudentFound}}
        autocomplete="given-name"
        type="text"
      >
        <:label>{{t "pages.sco-signup-or-login.signup-form.fields.firstname.label"}}</:label>
      </PixInput>

      <PixInput
        @id="lastName"
        @value={{this.lastName}}
        {{on "focusout" (fn this.triggerInputStringValidation "lastName" this.lastName)}}
        {{on "input" this.handleLastNameInput}}
        @requiredLabel={{true}}
        @validationStatus={{this.validation.lastName.status}}
        @errorMessage={{this.validation.lastName.message}}
        @disabled={{this.matchingStudentFound}}
        autocomplete="family-name"
        type="text"
      >
        <:label>{{t "pages.sco-signup-or-login.signup-form.fields.lastname.label"}}</:label>
      </PixInput>

      <FormTextfieldDate
        @label={{t "pages.sco-signup-or-login.signup-form.fields.birthdate.label"}}
        @dayTextfieldName="dayOfBirth"
        @monthTextfieldName="monthOfBirth"
        @yearTextfieldName="yearOfBirth"
        @dayValue={{this.dayOfBirth}}
        @monthValue={{this.monthOfBirth}}
        @yearValue={{this.yearOfBirth}}
        @onValidateDay={{this.triggerInputDayValidation}}
        @onValidateMonth={{this.triggerInputMonthValidation}}
        @onValidateYear={{this.triggerInputYearValidation}}
        @dayValidationStatus={{this.validation.dayOfBirth.status}}
        @monthValidationStatus={{this.validation.monthOfBirth.status}}
        @yearValidationStatus={{this.validation.yearOfBirth.status}}
        @dayValidationMessage={{this.validation.dayOfBirth.message}}
        @monthValidationMessage={{this.validation.monthOfBirth.message}}
        @yearValidationMessage={{this.validation.yearOfBirth.message}}
        @disabled={{this.matchingStudentFound}}
        @require={{true}}
        @onDayInput={{this.handleDayInput}}
        @onMonthInput={{this.handleMonthInput}}
        @onYearInput={{this.handleYearInput}}
        @aria-describedby="register-error-message register-display-error-message"
      />

      {{#if this.errorMessage}}
        <div class="sco-signup-form__error" aria-live="polite" id="register-error-message">{{{this.errorMessage}}}</div>
      {{/if}}

      {{#unless this.matchingStudentFound}}
        <div class="signup-button-container">
          <PixButton id="submit-search" @type="submit" @isLoading={{this.isLoading}}>
            {{t "pages.sco-signup-or-login.signup-form.button-form"}}
          </PixButton>
        </div>
      {{/unless}}

    </form>

    {{#if this.matchingStudentFound}}
      <hr />

      <label class="sco-signup-form__login-options">{{t "pages.sco-signup-or-login.signup-form.options.text"}}</label>
      <div id="login-mode-container" class="sco-signup-form__login-mode-container">
        <PixToggleDeprecated
          @valueFirstLabel={{t "pages.sco-signup-or-login.signup-form.options.username"}}
          @valueSecondLabel={{t "pages.sco-signup-or-login.signup-form.options.email"}}
          @onToggle={{this.onToggle}}
        />
      </div>

      <form {{on "submit" this.register}} autocomplete="off" class="sco-signup-form">
        {{#if this.loginWithUsername}}
          <div class="sco-signup-form-username-container">
            <PixInput @id="username" @value={{this.username}} @requiredLabel={{true}} disabled={{true}} type="text">
              <:label>{{t "pages.sco-signup-or-login.signup-form.fields.username.label"}}</:label>
            </PixInput>
          </div>
        {{else}}
          <PixInput
            @id="email"
            @value={{this.email}}
            {{on "focusout" (fn this.triggerInputEmailValidation "email" this.email)}}
            {{on "input" this.handleEmailInput}}
            @requiredLabel={{true}}
            @validationStatus={{this.validation.email.status}}
            @errorMessage={{this.validation.email.message}}
            @disabled={{this.matchingStudentFound}}
            @subLabel={{t "pages.sco-signup-or-login.signup-form.fields.email.help"}}
            autocomplete="email"
            type="email"
          >
            <:label>{{t "pages.sco-signup-or-login.signup-form.fields.email.label"}}</:label>
          </PixInput>
        {{/if}}
        <PixInputPassword
          @id="password"
          @value={{this.password}}
          @subLabel={{t "pages.sco-signup-or-login.signup-form.fields.password.help"}}
          {{on "focusout" (fn this.triggerInputPasswordValidation "password" this.password)}}
          {{on "input" this.handlePasswordInput}}
          @validationStatus={{this.validation.password.status}}
          @errorMessage={{this.validation.password.message}}
          @requiredLabel={{true}}
        >
          <:label>{{t "pages.sco-signup-or-login.signup-form.fields.password.label"}}</:label>
        </PixInputPassword>

        {{#if this.displayRegisterErrorMessage}}
          <div class="sco-signup-form__error" aria-live="polite" id="register-display-error-message">
            {{{this.registerErrorMessage}}}
          </div>
        {{/if}}

        <div class="sco-signup-form__action-form-buttons">
          <PixButton id="submit-registration" @type="submit" @isLoading={{this.isLoading}}>
            {{t "pages.sco-signup-or-login.signup-form.button-form"}}
          </PixButton>
          <PixButton @triggerAction={{this.resetForm}} @variant="secondary" @iconBefore="arrowLeft">
            {{t "pages.sco-signup-or-login.signup-form.not-me"}}
          </PixButton>
        </div>
        <p class="legal-notice">
          {{t "pages.sco-signup-or-login.signup-form.rgpd-legal-notice"}}
          <a
            href="{{t 'pages.sco-signup-or-login.signup-form.rgpd-legal-notice-url'}}"
            target="_blank"
            rel="noopener noreferrer"
            class="link--underline"
          >
            {{t "pages.sco-signup-or-login.signup-form.rgpd-legal-notice-link"}}
          </a>
        </p>

      </form>
    {{/if}}
  </template>
  @service session;
  @service store;
  @service intl;
  @service router;

  @tracked isLoading = false;
  @tracked errorMessage = null;
  @tracked displayRegisterErrorMessage = false;
  @tracked matchingStudentFound = false;
  @tracked loginWithUsername = true;

  dependentUser = null;
  scoOrganizationLearner = null;
  @tracked validation = new FormValidation();

  @tracked username = '';
  @tracked email = '';
  @tracked password = '';
  @tracked firstName = '';
  @tracked lastName = '';
  @tracked dayOfBirth = '';
  @tracked monthOfBirth = '';
  @tracked yearOfBirth = '';

  get birthdate() {
    const dayOfBirth = standardizeNumberInTwoDigitFormat(this.dayOfBirth.trim());
    const monthOfBirth = standardizeNumberInTwoDigitFormat(this.monthOfBirth.trim());
    const yearOfBirth = this.yearOfBirth.trim();
    return [yearOfBirth, monthOfBirth, dayOfBirth].join('-');
  }

  get isSearchFormNotValid() {
    return (
      !isStringValid(this.firstName) ||
      !isStringValid(this.lastName) ||
      !isDayValid(this.dayOfBirth) ||
      !isMonthValid(this.monthOfBirth) ||
      !isYearValid(this.yearOfBirth)
    );
  }

  get isCreationFormNotValid() {
    const isPasswordNotValid = !isPasswordValid(this.password);
    const isEmailNotValid = !isEmailValid(this.email);
    if (this.loginWithUsername) {
      return isPasswordNotValid;
    }
    return isEmailNotValid || isPasswordNotValid;
  }

  @action
  searchForMatchingStudent(event) {
    event.preventDefault();

    this.errorMessage = null;
    this.isLoading = true;
    this._validateInputString('firstName', this.firstName);
    this._validateInputString('lastName', this.lastName);
    this._validateInputDay('dayOfBirth', this.dayOfBirth);
    this._validateInputMonth('monthOfBirth', this.monthOfBirth);
    this._validateInputYear('yearOfBirth', this.yearOfBirth);

    if (this.isSearchFormNotValid) {
      return (this.isLoading = false);
    }

    this.scoOrganizationLearner = this.store.createRecord('sco-organization-learner', {
      id: this.args.organizationId + '_' + this.lastName,
      firstName: this.firstName,
      lastName: this.lastName,
      birthdate: this.birthdate,
      organizationId: this.args.organizationId,
    });

    return this.scoOrganizationLearner.save({ adapterOptions: { searchForMatchingStudent: true } }).then(
      (response) => {
        this.matchingStudentFound = true;
        this.isLoading = false;
        this.username = response.username;
        return (this.dependentUser = this.store.createRecord('dependent-user', {
          id: this.args.organizationId + '_' + this.lastName,
          redirectionUrl: this.args.redirectionUrl,
          organizationId: this.args.organizationId,
          firstName: this.firstName,
          lastName: this.lastName,
          birthdate: this.birthdate,
          email: '',
          username: this.username,
          password: '',
        }));
      },
      (errorResponse) => {
        this.scoOrganizationLearner.unloadRecord();
        this.isLoading = false;
        errorResponse.errors?.forEach((error) => {
          if (error.status === '404') {
            return (this.errorMessage =
              'Vous êtes un élève ? <br> Vérifiez vos informations (prénom, nom et date de naissance) ou contactez un enseignant. <br><br> Vous êtes un enseignant ? <br> L’accès à un parcours n’est pas disponible pour le moment.');
          }
          if (error.status === '409') {
            const message = this._showErrorMessageByShortCode(error.meta);
            return (this.errorMessage = message);
          }
          if (error.status === '500') {
            return (this.errorMessage = this.intl.t(ENV.APP.API_ERROR_MESSAGES.INTERNAL_SERVER_ERROR.I18N_KEY));
          }
          const defaultMessage = this.intl.t(ENV.APP.API_ERROR_MESSAGES.INTERNAL_SERVER_ERROR.I18N_KEY);
          return (this.errorMessage = error.detail ? error.detail : defaultMessage);
        });
      },
    );
  }

  @action
  async register(event) {
    event.preventDefault();

    this.isLoading = true;
    this.displayRegisterErrorMessage = false;

    if (this.isCreationFormNotValid) {
      return (this.isLoading = false);
    }
    try {
      this.dependentUser.password = this.password;
      this.dependentUser.withUsername = this.loginWithUsername;

      if (this.loginWithUsername) {
        this.dependentUser.username = this.username;
        this.dependentUser.email = undefined;
      } else {
        this.dependentUser.email = this.email;
        this.dependentUser.username = undefined;
      }

      await this.dependentUser.save();

      const userLogin = this.loginWithUsername ? this.dependentUser.username : this.dependentUser.email;
      await this._authenticate(userLogin, this.dependentUser.password);
    } catch (responseError) {
      responseError.errors.forEach((error) => {
        let defaultMessage = this.intl.t(ENV.APP.API_ERROR_MESSAGES.INTERNAL_SERVER_ERROR.I18N_KEY);
        if (error.status === '422') {
          return this._displayErrorsRelatedToInputs();
        }

        if (error.status === '500' || error.status === '400' || error.status === '404' || error.status === '409') {
          if (error.status === '409') {
            defaultMessage = this._showErrorMessageByShortCode(error.meta);
          }
        }
        this.displayRegisterErrorMessage = true;
        this.registerErrorMessage = defaultMessage;
      });
    } finally {
      this.dependentUser.password = null;
      this.isLoading = false;
    }
  }

  @action
  onToggle(data) {
    this.loginWithUsername = data;
    this.displayRegisterErrorMessage = false;
  }

  @action
  triggerInputStringValidation(key, value) {
    this._validateInputString(key, value);
  }

  @action
  triggerInputDayValidation(key, value) {
    value = value.trim();
    this._standardizeNumberInInput('dayOfBirth', value);
    this._validateInputDay(key, value);
  }

  @action
  triggerInputMonthValidation(key, value) {
    value = value.trim();
    this._standardizeNumberInInput('monthOfBirth', value);
    this._validateInputMonth(key, value);
  }

  @action
  triggerInputYearValidation(key, value) {
    value = value.trim();
    this._standardizeNumberInInput('yearOfBirth', value);
    this._validateInputYear(key, value);
  }

  @action
  triggerInputEmailValidation(key, value) {
    this._validateInputEmail(key, value);
  }

  @action
  triggerInputPasswordValidation(key, value) {
    this._validateInputPassword(key, value);
  }

  @action
  handleFirstNameInput(event) {
    this.firstName = event.target.value;
  }

  @action
  handleLastNameInput(event) {
    this.lastName = event.target.value;
  }

  @action
  handleEmailInput(event) {
    this.email = event.target.value;
  }

  @action
  handlePasswordInput(event) {
    this.password = event.target.value;
  }

  @action
  handleDayInput(event) {
    this.dayOfBirth = event.target.value;
  }
  @action
  handleMonthInput(event) {
    this.monthOfBirth = event.target.value;
  }
  @action
  handleYearInput(event) {
    this.yearOfBirth = event.target.value;
  }

  @action
  resetForm() {
    if (this.scoOrganizationLearner) this.scoOrganizationLearner.unloadRecord();
    if (this.dependentUser) this.dependentUser.unloadRecord();
    this.firstName = null;
    this.lastName = null;
    this.dayOfBirth = null;
    this.monthOfBirth = null;
    this.yearOfBirth = null;
    this.password = null;
    this.email = null;
    this.username = null;
    this.matchingStudentFound = false;
    this.loginWithUsername = true;
    this.validation = new FormValidation();
    this.errorMessage = null;
  }

  _executeFieldValidation(key, value, isValid) {
    const isInvalidInput = !isValid(value);
    const message = isInvalidInput ? this.intl.t(ERROR_INPUT_MESSAGE_MAP[key]) : null;
    const status = isInvalidInput ? 'error' : 'success';

    this.validation[key].status = status;
    this.validation[key].message = message;
  }

  _displayErrorsRelatedToInputs() {
    const errors = this.dependentUser.errors;
    if (errors) {
      errors.forEach(({ attribute, message }) => {
        this.validation[attribute].status = 'error';
        this.validation[attribute].message = message;
      });
    } else {
      this.displayRegisterErrorMessage = true;
    }
  }

  _validateInputString(key, value) {
    this._executeFieldValidation(key, value, isStringValid);
  }

  _validateInputDay(key, value) {
    this._executeFieldValidation(key, value, isDayValid);
  }

  _validateInputMonth(key, value) {
    this._executeFieldValidation(key, value, isMonthValid);
  }

  _validateInputYear(key, value) {
    this._executeFieldValidation(key, value, isYearValid);
  }

  _validateInputEmail(key, value) {
    this._executeFieldValidation(key, value, isEmailValid);
  }

  _validateInputPassword(key, value) {
    this._executeFieldValidation(key, value, isPasswordValid);
  }

  _standardizeNumberInInput(attribute, value) {
    if (value) {
      this.attribute = standardizeNumberInTwoDigitFormat(value);
    }
  }

  _authenticate(login, password) {
    return this.session.authenticate('authenticator:oauth2', { login, password });
  }

  _showErrorMessageByShortCode(meta) {
    const defaultMessage = this.intl.t(ENV.APP.API_ERROR_MESSAGES.INTERNAL_SERVER_ERROR.I18N_KEY);
    return (
      this.intl.t(getRegisterErrorsMessageByShortCode(meta), { value: meta.value, htlmSafe: true }) || defaultMessage
    );
  }
}
