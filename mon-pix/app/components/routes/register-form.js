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
  dayOfBirth: 'pages.login-or-register.register-form.fields.birthdate.day.error',
  monthOfBirth: 'pages.login-or-register.register-form.fields.birthdate.month.error',
  yearOfBirth: 'pages.login-or-register.register-form.fields.birthdate.year.error',
  email: 'pages.login-or-register.register-form.fields.email.error',
  password: 'pages.login-or-register.register-form.fields.password.error',
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

export default class RegisterForm extends Component {
  @service session;
  @service store;
  @service intl;

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
      id: this.args.campaignCode + '_' + this.lastName,
      firstName: this.firstName,
      lastName: this.lastName,
      birthdate: this.birthdate,
      campaignCode: this.args.campaignCode,
    });

    return this.scoOrganizationLearner.save({ adapterOptions: { searchForMatchingStudent: true } }).then(
      (response) => {
        this.matchingStudentFound = true;
        this.isLoading = false;
        this.username = response.username;
        return (this.dependentUser = this.store.createRecord('dependent-user', {
          id: this.args.campaignCode + '_' + this.lastName,
          campaignCode: this.args.campaignCode,
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
        errorResponse.errors.forEach((error) => {
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
      }
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

    this.dependentUser.password = this.password;
    this.dependentUser.withUsername = this.loginWithUsername;
    if (this.loginWithUsername) {
      this.dependentUser.username = this.username;
      this.dependentUser.email = undefined;
    } else {
      this.dependentUser.email = this.email;
      this.dependentUser.username = undefined;
    }

    try {
      await this.dependentUser.save();
    } catch (responseError) {
      this.isLoading = false;
      responseError.errors.forEach((error) => {
        if (error.status === '500' || error.status === '400' || error.status === '409') {
          let defaultMessage = this.intl.t(ENV.APP.API_ERROR_MESSAGES.INTERNAL_SERVER_ERROR.I18N_KEY);
          if (error.status === '409') {
            defaultMessage = this._showErrorMessageByShortCode(error.meta);
          }
          this.displayRegisterErrorMessage = true;
          this.registerErrorMessage = defaultMessage;
        }
      });

      return this._displayErrorsRelatedToInputs();
    }

    if (this.loginWithUsername) {
      await this._authenticate(this.dependentUser.username, this.dependentUser.password);
    } else {
      await this._authenticate(this.dependentUser.email, this.dependentUser.password);
    }

    this.dependentUser.password = null;
    this.isLoading = false;
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
    const scope = 'mon-pix';
    return this.session.authenticate('authenticator:oauth2', { login, password, scope });
  }

  _showErrorMessageByShortCode(meta) {
    const defaultMessage = this.intl.t(ENV.APP.API_ERROR_MESSAGES.INTERNAL_SERVER_ERROR.I18N_KEY);
    return (
      this.intl.t(getRegisterErrorsMessageByShortCode(meta), { value: meta.value, htlmSafe: true }) || defaultMessage
    );
  }
}
