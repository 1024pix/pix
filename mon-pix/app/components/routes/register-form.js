import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { standardizeNumberInTwoDigitFormat } from 'mon-pix/utils/standardize-number';

import isEmailValid from '../../utils/email-validator';
import isPasswordValid from '../../utils/password-validator';
import ENV from 'mon-pix/config/environment';

import { getRegisterErrorsMessageByShortCode } from '../../utils/errors-messages';

const ERROR_INPUT_MESSAGE_MAP = {
  firstName: 'pages.login-or-register.register-form.fields.firstname.error',
  lastName: 'pages.login-or-register.register-form.fields.lastname.error',
  dayOfBirth: 'pages.login-or-register.register-form.fields.birthdate.day-error',
  monthOfBirth: 'pages.login-or-register.register-form.fields.birthdate.month-error',
  yearOfBirth: 'pages.login-or-register.register-form.fields.birthdate.year-error',
  email: 'pages.login-or-register.register-form.fields.email.error',
  password: 'pages.login-or-register.register-form.fields.password.error',
};

const isDayValid = (value) => value > 0 && value <= 31;
const isMonthValid = (value) => value > 0 && value <= 12;
const isYearValid = (value) => value > 999 && value <= 9999;
const isStringValid = (value) => !!value.trim();

class FormValidation {
  lastName = {
    @tracked status: 'default',
    @tracked message: null,
  }
  firstName = {
    @tracked status: 'default',
    @tracked message: null,
  }
  dayOfBirth = {
    @tracked status: 'default',
    @tracked message: null,
  }
  monthOfBirth = {
    @tracked status: 'default',
    @tracked message: null,
  }
  yearOfBirth = {
    @tracked status: 'default',
    @tracked message: null,
  }
  email = {
    @tracked status: 'default',
    @tracked message: null,
  }
  password = {
    @tracked status: 'default',
    @tracked message: null,
  }
}

export default class RegisterForm extends Component {
  @service session;
  @service store;
  @service intl;

  @tracked isLoading = false;
  @tracked errorMessage = null;
  @tracked displayRegisterErrorMessage = false;
  @tracked matchingStudentFound = false;
  @tracked loginWithUsername = true;

  schoolingRegistrationDependentUser = null;
  schoolingRegistrationUserAssociation = null;
  validation = new FormValidation();

  username = '';
  email = '';
  password = '';
  firstName = '';
  lastName = '';
  dayOfBirth = '';
  monthOfBirth = '';
  yearOfBirth = '';

  willDestroy() {
    if (this.schoolingRegistrationUserAssociation) this.schoolingRegistrationUserAssociation.unloadRecord();
    if (this.schoolingRegistrationDependentUser) this.schoolingRegistrationDependentUser.unloadRecord();
    super.willDestroy(...arguments);
  }

  get birthdate() {
    const dayOfBirth = standardizeNumberInTwoDigitFormat(this.dayOfBirth.trim());
    const monthOfBirth = standardizeNumberInTwoDigitFormat(this.monthOfBirth.trim());
    const yearOfBirth = this.yearOfBirth.trim();
    return [yearOfBirth, monthOfBirth, dayOfBirth].join('-');
  }

  get isSearchFormNotValid() {
    return !isStringValid(this.firstName) || !isStringValid(this.lastName)
      || !isDayValid(this.dayOfBirth) || !isMonthValid(this.monthOfBirth) || !isYearValid(this.yearOfBirth);
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
      return this.isLoading = false;
    }

    this.schoolingRegistrationUserAssociation = this.store.createRecord('schooling-registration-user-association', {
      id: this.args.campaignCode + '_' + this.lastName,
      firstName: this.firstName,
      lastName: this.lastName,
      birthdate: this.birthdate,
      campaignCode: this.args.campaignCode,
    });

    return this.schoolingRegistrationUserAssociation.save({ adapterOptions: { searchForMatchingStudent: true } })
      .then((response) => {
        this.matchingStudentFound = true;
        this.isLoading = false;
        this.username = response.username;
        return this.schoolingRegistrationDependentUser = this.store.createRecord('schooling-registration-dependent-user', {
          id: this.args.campaignCode + '_' + this.lastName,
          campaignCode: this.args.campaignCode,
          firstName: this.firstName,
          lastName: this.lastName,
          birthdate: this.birthdate,
          email: '',
          username: this.username,
          password: '',
        });
      }, (errorResponse) => {
        this.schoolingRegistrationUserAssociation.unloadRecord();
        this.isLoading = false;
        errorResponse.errors.forEach((error) => {
          if (error.status === '404') {
            return this.errorMessage = 'Vous êtes un élève ? <br> Vérifiez vos informations (prénom, nom et date de naissance) ou contactez un enseignant. <br><br> Vous êtes un enseignant ? <br> L’accès à un parcours n’est pas disponible pour le moment.';
          }
          if (error.status === '409') {
            const message = this._showErrorMessageByShortCode(error.meta);
            return this.errorMessage = message;
          }
          const defaultMessage = this.intl.t(ENV.APP.API_ERROR_MESSAGES.INTERNAL_SERVER_ERROR.MESSAGE);
          return this.errorMessage = (error.detail) ? error.detail : defaultMessage;
        });
      });
  }

  _showErrorMessageByShortCode(meta) {
    const defaultMessage = this.intl.t(ENV.APP.API_ERROR_MESSAGES.INTERNAL_SERVER_ERROR.MESSAGE);
    return this.intl.t(getRegisterErrorsMessageByShortCode(meta), { value: meta.value, htlmSafe: true }) || defaultMessage;

  }

  @action
  async register(event) {
    event.preventDefault();

    this.isLoading = true;
    this.displayRegisterErrorMessage = false;

    if (this.isCreationFormNotValid) {
      return this.isLoading = false;
    }
    try {
      this.schoolingRegistrationDependentUser.password = this.password;
      this.schoolingRegistrationDependentUser.withUsername = this.loginWithUsername;
      if (this.loginWithUsername) {
        this.schoolingRegistrationDependentUser.username = this.username;
        this.schoolingRegistrationDependentUser.email = undefined;
      } else {
        this.schoolingRegistrationDependentUser.email = this.email;
        this.schoolingRegistrationDependentUser.username = undefined;
      }
      await this.schoolingRegistrationDependentUser.save();
    } catch (error) {
      this.isLoading = false;
      return this._updateInputsStatus();
    }

    if (this.loginWithUsername) {
      await this._authenticate(this.schoolingRegistrationDependentUser.username, this.schoolingRegistrationDependentUser.password);
    } else {
      await this._authenticate(this.schoolingRegistrationDependentUser.email, this.schoolingRegistrationDependentUser.password);
    }

    this.schoolingRegistrationDependentUser.password = null;
    this.isLoading = false;
  }

  @action
  onToggle(data) {
    this.loginWithUsername = data;
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
    this.yearOfBirth = value;
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

  _executeFieldValidation(key, value, isValid) {
    const isInvalidInput = !isValid(value);
    const message = isInvalidInput ? this.intl.t(ERROR_INPUT_MESSAGE_MAP[key]) : null;
    const status = isInvalidInput ? 'error' : 'success';

    this.validation[key].status = status;
    this.validation[key].message = message;
  }

  _updateInputsStatus() {
    const errors = this.schoolingRegistrationDependentUser.errors;

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
    const scope = 'mon-pix';
    return this.session.authenticate('authenticator:oauth2', { login, password, scope });
  }
}
