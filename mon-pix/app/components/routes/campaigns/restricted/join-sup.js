import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { standardizeNumberInTwoDigitFormat } from 'mon-pix/utils/standardize-number';

const ERROR_INPUT_MESSAGE_MAP = {
  studentNumber: 'pages.join.sup.fields.student-number.error',
  firstName: 'pages.join.fields.firstname.error',
  lastName: 'pages.join.fields.lastname.error',
  dayOfBirth: 'pages.join.fields.birthdate.day-error',
  monthOfBirth: 'pages.join.fields.birthdate.month-error',
  yearOfBirth: 'pages.join.fields.birthdate.year-error',
};

const isDayValid = (value) => value > 0 && value <= 31;
const isMonthValid = (value) => value > 0 && value <= 12;
const isYearValid = (value) => value > 999 && value <= 9999;
const isStringValid = (value) => !!value.trim();

class Errors {
  @tracked firstName = null;
  @tracked lastName = null;
  @tracked dayOfBirth = null;
  @tracked monthOfBirth = null;
  @tracked yearOfBirth = null;
  @tracked studentNumber = null;
  @tracked global = null;
}

export default class JoinSup extends Component {
  @service store;
  @service intl;

  @tracked firstName = '';
  @tracked lastName = '';
  @tracked dayOfBirth = '';
  @tracked monthOfBirth = '';
  @tracked yearOfBirth = '';
  @tracked studentNumber = '';

  @tracked isLoading = false;
  errors = new Errors();

  get birthdate() {
    const dayOfBirth = standardizeNumberInTwoDigitFormat(this.dayOfBirth.trim());
    const monthOfBirth = standardizeNumberInTwoDigitFormat(this.monthOfBirth.trim());
    const yearOfBirth = this.yearOfBirth.trim();
    return [yearOfBirth, monthOfBirth, dayOfBirth].join('-');
  }

  get isValidForm() {
    this._validateInputString('studentNumber', this.studentNumber);
    this._validateInputString('firstName', this.firstName);
    this._validateInputString('lastName', this.lastName);
    this._validateInputDay('dayOfBirth', this.dayOfBirth);
    this._validateInputMonth('monthOfBirth', this.monthOfBirth);
    this._validateInputYear('yearOfBirth', this.yearOfBirth);

    const hasError = (
      this.errors.studentNumber ||
      this.errors.firstName ||
      this.errors.lastName ||
      this.errors.dayOfBirth ||
      this.errors.monthOfBirth ||
      this.errors.yearOfBirth
    );

    return !hasError;
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
  async submit(event) {
    event.preventDefault();

    if (!this.isValidForm) return;

    this.isLoading = true;

    const schoolingRegistration = this.store.createRecord('schooling-registration-user-association', {
      id: `${this.args.campaignCode}_${this.lastName}`,
      studentNumber: this.studentNumber,
      firstName: this.firstName,
      lastName: this.lastName,
      birthdate: this.birthdate,
      campaignCode: this.args.campaignCode,
    });

    try {
      await this.args.onSubmitToReconcile(schoolingRegistration, { registerAdditional: true });
    } catch (errorResponse) {
      schoolingRegistration.unloadRecord();
      this._setErrorMessage(errorResponse);
    }
    this.isLoading = false;
  }

  _setErrorMessage(errorResponse) {
    const ERRORS_HANDLED = ['409', '404'];
    const ERRORS_HANDLED_MESSAGE = this.intl.t('pages.join.sup.error', { htmlSafe: true });
    if (!errorResponse.errors) {
      this.errors.global = ERRORS_HANDLED_MESSAGE;
      return;
    }
    errorResponse.errors.forEach((error) => {
      if (ERRORS_HANDLED.includes(error.status)) {
        this.errors.global = ERRORS_HANDLED_MESSAGE;
        return;
      }
      this.errors.global = error.detail;
      return;
    });
  }

  _executeFieldValidation(key, value, isValid) {
    const isInvalidInput = !isValid(value);
    const message = isInvalidInput ? this.intl.t(ERROR_INPUT_MESSAGE_MAP[key]) : null;
    this.errors[key] = message;
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

  _standardizeNumberInInput(attribute, value) {
    if (value) {
      this.attribute = standardizeNumberInTwoDigitFormat(value);
    }
  }
}

