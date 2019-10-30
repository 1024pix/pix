import Controller from '@ember/controller';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';

const ERROR_INPUT_MESSAGE_MAP = {
  dayOfBirth: 'Votre jour de naissance n’est pas valide.',
  monthOfBirth: 'Votre mois de naissance n’est pas valide.',
  yearOfBirth: 'Votre année de naissance n’est pas valide.',
};

const validation = {
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

function _pad(num, size) {
  let s = num + '';
  while (s.length < size) s = '0' + s;
  return s;
}

const isDayValid = (value) => value > 0 && value <= 31;
const isMonthValid = (value) => value > 0 && value <= 12;
const isYearValid = (value) => value > 999 && value <= 9999;

export default Controller.extend({
  store: service(),

  firstName: '',
  lastName: '',
  dayOfBirth: '',
  monthOfBirth: '',
  yearOfBirth: '',
  birthdate: computed('yearOfBirth', 'monthOfBirth', 'dayOfBirth', function() {
    const monthOfBirth = _pad(this.monthOfBirth, 2);
    const dayOfBirth = _pad(this.dayOfBirth, 2);
    return [this.yearOfBirth, monthOfBirth, dayOfBirth].join('-');
  }),

  isFormNotValid: computed('yearOfBirth', 'monthOfBirth', 'dayOfBirth', function() {
    return !isDayValid(this.dayOfBirth) || !isMonthValid(this.monthOfBirth) || !isYearValid(this.yearOfBirth);
  }),

  isLoading: false,
  errorMessage: null,

  init() {
    this._super();
    this.validation = validation;
  },

  actions: {
    attemptNext() {
      this.set('errorMessage', null);
      this.set('isLoading', true);
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
          queryParams: { associationDone: true }
        });
      }, (errorResponse) => {
        studentUserAssociation.unloadRecord();
        errorResponse.errors.forEach((error) => {
          if (error.status === '404') {
            return this.set('errorMessage', 'Oups ! nous ne parvenons pas à vous trouver. Vérifiez vos informations afin de continuer ou prévenez l’organisateur de la campagne.');
          }
          throw (error);
        });
        this.set('isLoading', false);
      });
    },

    triggerInputDayValidation(key, value) {
      this._padNumberInInput('dayOfBirth', value);
      this._validateInputDay(key, value);
    },

    triggerInputMonthValidation(key, value) {
      this._padNumberInInput('monthOfBirth', value);
      this._validateInputMonth(key, value);
    },

    triggerInputYearValidation(key, value) {
      this._validateInputYear(key, value);
    },
  },

  _executeFieldValidation(key, value, isValid) {
    const isInvalidInput = !isValid(value);
    const message = isInvalidInput ? ERROR_INPUT_MESSAGE_MAP[key] : null;
    const messageObject = 'validation.' + key + '.message';
    return this.set(messageObject, message);
  },

  _validateInputDay(key, value) {
    this._executeFieldValidation(key, value, isDayValid);
  },

  _validateInputMonth(key, value) {
    this._executeFieldValidation(key, value, isMonthValid);
  },

  _validateInputYear(key, value) {
    this._executeFieldValidation(key, value, isYearValid);
  },

  _padNumberInInput(attribute, value) {
    if (value.trim()) {
      this.set(attribute, _pad(value, 2));
    }
  }
});
