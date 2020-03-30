import classic from 'ember-classic-decorator';
import { action, computed } from '@ember/object';
import { inject as service } from '@ember/service';
import Controller from '@ember/controller';
import { standardizeNumberInTwoDigitFormat } from 'mon-pix/utils/standardize-number';

const ERROR_INPUT_MESSAGE_MAP = {
  firstName: 'Votre prénom n’est pas renseigné.',
  lastName: 'Votre nom n’est pas renseigné.',
  dayOfBirth: 'Votre jour de naissance n’est pas valide.',
  monthOfBirth: 'Votre mois de naissance n’est pas valide.',
  yearOfBirth: 'Votre année de naissance n’est pas valide.',
};

const validation = {
  firstName: {
    message: null
  },
  lastName: {
    message: null
  },
  dayOfBirth: {
    message: null
  },
  monthOfBirth: {
    message: null
  },
  yearOfBirth: {
    message: null
  }
};

const isDayValid = (value) => value > 0 && value <= 31;
const isMonthValid = (value) => value > 0 && value <= 12;
const isYearValid = (value) => value > 999 && value <= 9999;
const isStringValid = (value) => !!value.trim();

@classic
export default class JoinRestrictedCampaignController extends Controller {
  queryParams = ['participantExternalId'];
  participantExternalId = null;

  @service session;
  @service store;

  firstName = '';
  lastName = '';
  dayOfBirth = '';
  monthOfBirth = '';
  yearOfBirth = '';
  pageTitle = 'Rejoindre';

  @computed('yearOfBirth', 'monthOfBirth', 'dayOfBirth')
  get birthdate() {
    const dayOfBirth = standardizeNumberInTwoDigitFormat(this.dayOfBirth.trim());
    const monthOfBirth = standardizeNumberInTwoDigitFormat(this.monthOfBirth.trim());
    const yearOfBirth = this.yearOfBirth.trim();
    return [yearOfBirth, monthOfBirth, dayOfBirth].join('-');
  }

  @computed('firstName', 'lastName', 'yearOfBirth', 'monthOfBirth', 'dayOfBirth')
  get isFormNotValid() {
    return !isStringValid(this.firstName) || !isStringValid(this.lastName)
    || !isDayValid(this.dayOfBirth) || !isMonthValid(this.monthOfBirth) || !isYearValid(this.yearOfBirth);
  }

  @computed('session.data.authenticated.source')
  get isDisabled() {
    return this.session.data.authenticated.source === 'external';
  }

  isLoading = false;
  errorMessage = null;

  init() {
    super.init();
    this.validation = validation;
  }

  @action
  attemptNext() {
    this.set('errorMessage', null);
    this.set('isLoading', true);
    this._validateInputName('firstName', this.firstName);
    this._validateInputName('lastName', this.lastName);
    this._validateInputDay('dayOfBirth', this.dayOfBirth);
    this._validateInputMonth('monthOfBirth', this.monthOfBirth);
    this._validateInputYear('yearOfBirth', this.yearOfBirth);
    if (this.isFormNotValid) {
      return this.set('isLoading', false);
    }

    const campaignCode = this.model;
    const studentUserAssociation = this.store.createRecord('student-user-association', {
      id: campaignCode + '_' + this.lastName,
      firstName: this.firstName,
      lastName: this.lastName,
      birthdate: this.birthdate,
      campaignCode,
    });

    return studentUserAssociation.save().then(() => {
      this.set('isLoading', false);
      this.transitionToRoute('campaigns.start-or-resume', this.model, {
        queryParams: { associationDone: true, participantExternalId: this.participantExternalId }
      });
    }, (errorResponse) => {
      studentUserAssociation.unloadRecord();
      this._setErrorMessageForAttemptNextAction(errorResponse);
      this.set('isLoading', false);
    });
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
    this.set('yearOfBirth', value);
    this._validateInputYear(key, value);
  }

  _setErrorMessageForAttemptNextAction(errorResponse) {
    errorResponse.errors.forEach((error) => {
      if (error.status === '409') {
        return this.set('errorMessage', 'Les informations saisies ont déjà été utilisées. Prévenez l’organisateur de votre parcours.');
      }
      if (error.status === '404') {
        return this.set('errorMessage', 'Vérifiez vos informations afin de continuer ou prévenez l’organisateur de votre parcours.');
      }
      return this.set('errorMessage', error.detail);
    });
  }

  _executeFieldValidation(key, value, isValid) {
    const isInvalidInput = !isValid(value);
    const message = isInvalidInput ? ERROR_INPUT_MESSAGE_MAP[key] : null;
    const messageObject = 'validation.' + key + '.message';
    return this.set(messageObject, message);
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
      this.set(attribute, standardizeNumberInTwoDigitFormat(value));
    }
  }
}
