import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import isEmpty from 'lodash/isEmpty';
import dayjs from 'dayjs';

const INE_REGEX = /^[0-9]{9}[a-zA-Z]{2}$/;
const INA_REGEX = /^[0-9]{10}[a-zA-Z]{1}$/;

const STATUS_MAP = {
  defaultStatus: 'default',
  errorStatus: 'error',
  successStatus: 'success',
};

const ERROR_INPUT_MESSAGE_MAP = {
  invalidIneInaFormat: 'pages.account-recovery.find-sco-record.student-information.errors.invalid-ine-ina-format',
  emptyIneIna: 'pages.account-recovery.find-sco-record.student-information.errors.empty-ine-ina',
  emptyLastName: 'pages.account-recovery.find-sco-record.student-information.errors.empty-last-name',
  emptyFirstName: 'pages.account-recovery.find-sco-record.student-information.errors.empty-first-name',
};

class IneInaValidation {
  @tracked status = STATUS_MAP['defaultStatus'];
  @tracked message = null;
}

class LastNameValidation {
  @tracked status = STATUS_MAP['defaultStatus'];
  @tracked message = null;
}

class FirstNameValidation {
  @tracked status = STATUS_MAP['defaultStatus'];
  @tracked message = null;
}

export default class StudentInformationFormComponent extends Component {
  @service intl;
  @service store;

  @tracked ineInaValidation = new IneInaValidation();
  @tracked firstNameValidation = new FirstNameValidation();
  @tracked lastNameValidation = new LastNameValidation();

  @tracked ineIna = '';
  @tracked lastName = '';
  @tracked firstName = '';
  @tracked dayOfBirth = '';
  @tracked monthOfBirth = '';
  @tracked yearOfBirth = '';

  get isFormValid() {
    return (
      !isEmpty(this.lastName) &&
      !isEmpty(this.firstName) &&
      this._isDayOfBirthValid &&
      this._isMonthOfBirthValid &&
      this._isYearOfBirthValid &&
      this._isIneInaValid
    );
  }

  get _isIneInaValid() {
    const isValidIne = INE_REGEX.test(this.ineIna);
    const isValidIna = INA_REGEX.test(this.ineIna);
    return (isValidIna || isValidIne) && !isEmpty(this.ineIna);
  }

  get _isDayOfBirthValid() {
    return !isEmpty(this.dayOfBirth);
  }

  get _isMonthOfBirthValid() {
    return !isEmpty(this.monthOfBirth);
  }

  get _isYearOfBirthValid() {
    return !isEmpty(this.yearOfBirth);
  }

  get _formatBirthdate() {
    const year = parseInt(this.yearOfBirth);
    const month = parseInt(this.monthOfBirth) - 1;
    const day = parseInt(this.dayOfBirth);
    return dayjs(new Date(year, month, day)).format('YYYY-MM-DD');
  }

  @action validateIneIna() {
    this.ineIna = this.ineIna.trim();

    if (isEmpty(this.ineIna)) {
      this.ineInaValidation.status = STATUS_MAP['errorStatus'];
      this.ineInaValidation.message = this.intl.t(ERROR_INPUT_MESSAGE_MAP['emptyIneIna']);
      return;
    }

    if (!this._isIneInaValid) {
      this.ineInaValidation.status = STATUS_MAP['errorStatus'];
      this.ineInaValidation.message = this.intl.t(ERROR_INPUT_MESSAGE_MAP['invalidIneInaFormat']);
      return;
    }

    this.ineInaValidation.status = STATUS_MAP['successStatus'];
    this.ineInaValidation.message = null;
  }

  @action validateLastName() {
    this.lastName = this.lastName.trim();
    if (isEmpty(this.lastName)) {
      this.lastNameValidation.status = STATUS_MAP['errorStatus'];
      this.lastNameValidation.message = this.intl.t(ERROR_INPUT_MESSAGE_MAP['emptyLastName']);
      return;
    }

    this.lastNameValidation.status = STATUS_MAP['successStatus'];
    this.lastNameValidation.message = null;
  }

  @action validateFirstName() {
    this.firstName = this.firstName.trim();
    if (isEmpty(this.firstName)) {
      this.firstNameValidation.status = STATUS_MAP['errorStatus'];
      this.firstNameValidation.message = this.intl.t(ERROR_INPUT_MESSAGE_MAP['emptyFirstName']);
      return;
    }

    this.firstNameValidation.status = STATUS_MAP['successStatus'];
    this.firstNameValidation.message = null;
  }

  @action
  async submit(event) {
    event.preventDefault();

    if (this.isFormValid) {
      await this.args.submitStudentInformation({
        ineIna: this.ineIna,
        firstName: this.firstName,
        lastName: this.lastName,
        birthdate: this._formatBirthdate,
      });
    }
  }

  @action
  handleDayInputChange(event) {
    const { value } = event.target;

    if (value.length === 2) {
      document.getElementById('monthOfBirth').focus();
    }
  }

  @action
  handleMonthInputChange(event) {
    const { value } = event.target;

    if (value.length === 2) {
      document.getElementById('yearOfBirth').focus();
    }
  }
}
