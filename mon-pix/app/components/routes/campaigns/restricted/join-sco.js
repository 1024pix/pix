import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import Component from '@glimmer/component';
import { standardizeNumberInTwoDigitFormat } from 'mon-pix/utils/standardize-number';
import { decodeToken } from 'mon-pix/helpers/jwt';
import get from 'lodash/get';

const ERROR_INPUT_MESSAGE_MAP = {
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

class Validation {
  @tracked firstName = null;
  @tracked lastName = null;
  @tracked dayOfBirth = null;
  @tracked monthOfBirth = null;
  @tracked yearOfBirth = null;
}

export default class JoinSco extends Component {
  @service session;
  @service currentUser;
  @service store;
  @service intl;

  validation = new Validation();

  @tracked isLoading = false;
  @tracked errorMessage;

  @tracked displayInformationModal = false;
  @tracked reconciliationError = null;
  @tracked reconciliationWarning = null;

  @tracked firstName = '';
  @tracked lastName = '';
  @tracked dayOfBirth = '';
  @tracked monthOfBirth = '';
  @tracked yearOfBirth = '';

  constructor() {
    super(...arguments);

    const tokenIdForExternalUser = this.session.data.externalUser;
    if (tokenIdForExternalUser) {
      const userFirstNameAndLastName = decodeToken(tokenIdForExternalUser);
      this.firstName = userFirstNameAndLastName['first_name'];
      this.lastName = userFirstNameAndLastName['last_name'];
    }
  }

  get birthdate() {
    const dayOfBirth = standardizeNumberInTwoDigitFormat(this.dayOfBirth.trim());
    const monthOfBirth = standardizeNumberInTwoDigitFormat(this.monthOfBirth.trim());
    const yearOfBirth = this.yearOfBirth.trim();
    return [yearOfBirth, monthOfBirth, dayOfBirth].join('-');
  }

  get isFormNotValid() {
    return !isStringValid(this.firstName) || !isStringValid(this.lastName)
      || !isDayValid(this.dayOfBirth) || !isMonthValid(this.monthOfBirth) || !isYearValid(this.yearOfBirth);
  }

  get isDisabled() {
    return (undefined !== get(this.session,'data.externalUser'));
  }

  @action
  closeModal() {
    this.displayInformationModal = false;
  }

  @action
  async submit(event) {
    event.preventDefault();
    this.isLoading = true;
    this.errorMessage = null;

    this._validateForm();
    if (this.isFormNotValid) {
      return this.isLoading = false;
    }

    const externalUserToken = this.session.get('data.externalUser');
    const reconciliationRecord = this._getReconciliationRecord(externalUserToken);
    try {
      if (externalUserToken) {
        await this.args.onSubmitToCreateAndReconcile(reconciliationRecord);
      } else {
        await this.args.onSubmitToReconcile(reconciliationRecord, { withReconciliation: false });
        reconciliationRecord.unloadRecord();
        this._displayWarningMessage();
      }
      this.isLoading = false;
    } catch (errorResponse) {
      reconciliationRecord.unloadRecord();
      this._setErrorMessageForAttemptNextAction(errorResponse);
      this.isLoading = false;
    }
  }

  @action
  async associate(event) {
    event.preventDefault();
    this.isLoading = true;
    this.errorMessage = null;

    this._validateForm();
    if (this.isFormNotValid) {
      return this.isLoading = false;
    }

    const reconciliationRecord = this._getReconciliationRecord();
    try {
      await this.args.onSubmitToReconcile(reconciliationRecord, { withReconciliation: true });
      this.isLoading = false;
      this.closeModal();
    } catch (errorResponse) {
      reconciliationRecord.unloadRecord();
      this._setErrorMessageForAttemptNextAction(errorResponse);
      this.isLoading = false;
    }
  }

  @action
  triggerInputStringValidation(key, value) {
    this._validateInputName(key, value);
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

  _validateForm() {
    this._validateInputName('firstName', this.firstName);
    this._validateInputName('lastName', this.lastName);
    this._validateInputDay('dayOfBirth', this.dayOfBirth);
    this._validateInputMonth('monthOfBirth', this.monthOfBirth);
    this._validateInputYear('yearOfBirth', this.yearOfBirth);
  }

  _getReconciliationRecord(hasExternalUserToken) {
    const externalUserToken = this.session.get('data.externalUser');
    if (hasExternalUserToken) {
      return this.store.createRecord('external-user', {
        birthdate: this.birthdate,
        campaignCode: this.args.campaignCode,
        externalUserToken,
      });
    }
    return this.store.createRecord('schooling-registration-user-association', {
      id: this.args.campaignCode + '_' + this.lastName,
      firstName: this.firstName,
      lastName: this.lastName,
      birthdate: this.birthdate,
      campaignCode: this.args.campaignCode,
    });
  }

  _executeFieldValidation(key, value, isValid) {
    const isInvalidInput = !isValid(value);
    this.validation[key] = isInvalidInput ? this.intl.t(ERROR_INPUT_MESSAGE_MAP[key]) : null;
  }

  _validateInputName(key, value) {
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
  _setErrorMessageForAttemptNextAction(errorResponse) {
    errorResponse.errors.forEach((error) => {
      if (error.status === '409') {
        if ('USER_ALREADY_RECONCILED_IN_THIS_ORGANIZATION' === error.code) {
          this.errorMessage = this.intl.t('api-error-messages.join-error.r70');
        } else {
          this.reconciliationError = error;
          this.displayInformationModal = true;
          this.session.set('data.expectedUserId', error.meta.userId);
        }
      } else if (error.status === '404') {
        this.errorMessage = this.intl.t('pages.join.sco.error-not-found', { htmlSafe: true });
      } else {
        this.errorMessage = error.detail;
      }
    });
  }

  _displayWarningMessage() {
    const user = this.currentUser.user;
    const connectionMethod = user.email ? user.email : user.username;
    this.reconciliationWarning = {
      connectionMethod,
      firstName: this.firstName,
      lastName: this.lastName,
    };
    this.displayInformationModal = true;
  }
}
