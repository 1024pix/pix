import Component from '@ember/component';
import { computed } from '@ember/object';
import { inject } from '@ember/service';
import { standardizeNumberInTwoDigitFormat } from 'mon-pix/utils/standardize-number';

import isEmailValid from '../../utils/email-validator';
import isUsernameValid from '../../utils/username-validator';
import isPasswordValid from '../../utils/password-validator';

const ERROR_INPUT_MESSAGE_MAP = {
  firstName: 'Votre prénom n’est pas renseigné.',
  lastName: 'Votre nom n’est pas renseigné.',
  dayOfBirth: 'Votre jour de naissance n’est pas valide.',
  monthOfBirth: 'Votre mois de naissance n’est pas valide.',
  yearOfBirth: 'Votre année de naissance n’est pas valide.',
  email: 'Votre email n’est pas valide.',
  password: 'Votre mot de passe doit contenir 8 caractères au minimum et comporter au moins une majuscule, une minuscule et un chiffre.'
};

const validation = {
  lastName: {
    status: 'default',
    message: null
  },
  firstName: {
    status: 'default',
    message: null
  },
  dayOfBirth: {
    status: 'default',
    message: null
  },
  monthOfBirth: {
    status: 'default',
    message: null
  },
  yearOfBirth: {
    status: 'default',
    message: null
  },
  email: {
    status: 'default',
    message: null
  },
  username: {
    status: 'default',
    message: null
  },
  password: {
    status: 'default',
    message: null
  },
};

const isDayValid = (value) => value > 0 && value <= 31;
const isMonthValid = (value) => value > 0 && value <= 12;
const isYearValid = (value) => value > 999 && value <= 9999;
const isStringValid = (value) => !!value.trim();

export default Component.extend({

  session: inject(),
  store: inject(),

  studentDependentUser: null,
  studentUserAssociation: null,
  isLoading: false,
  errorMessage: null,
  matchingStudentFound: false,
  isPasswordVisible: false,
  loginWithEmail: true,

  passwordInputType: computed('isPasswordVisible', function() {
    return this.isPasswordVisible ? 'text' : 'password';
  }),
  username: computed('studentDependentUser.{firstName,lastName}', function() {
    return `${this.get('studentDependentUser.firstName')}${this.get('studentDependentUser.lastName')}`;
  }),

  firstName: '',
  lastName: '',
  dayOfBirth: '',
  monthOfBirth: '',
  yearOfBirth: '',
  birthdate: computed('yearOfBirth', 'monthOfBirth', 'dayOfBirth', function() {
    const dayOfBirth = standardizeNumberInTwoDigitFormat(this.dayOfBirth.trim());
    const monthOfBirth = standardizeNumberInTwoDigitFormat(this.monthOfBirth.trim());
    const yearOfBirth = this.yearOfBirth.trim();
    return [yearOfBirth, monthOfBirth, dayOfBirth].join('-');
  }),

  isSearchFormNotValid: computed('firstName', 'lastName', 'yearOfBirth', 'monthOfBirth', 'dayOfBirth', function() {
    return !isStringValid(this.firstName) || !isStringValid(this.lastName)
      || !isDayValid(this.dayOfBirth) || !isMonthValid(this.monthOfBirth) || !isYearValid(this.yearOfBirth);
  }),

  isCreationFormNotValid: computed('studentDependentUser.{email,username,password}', function() {
    if (this.loginWithEmail) {
      return !isEmailValid(this.get('studentDependentUser.email')) || !isPasswordValid(this.get('studentDependentUser.password'));
    }
    return !isUsernameValid(this.get('studentDependentUser.username')) || !isPasswordValid(this.get('studentDependentUser.password'));
  }),

  init() {
    this.validation = validation;
    this._super(...arguments);
  },

  willDestroyElement() {
    if (this.studentUserAssociation) this.studentUserAssociation.unloadRecord();
    if (this.studentDependentUser) this.studentDependentUser.unloadRecord();
    this._super(...arguments);
  },

  actions: {

    searchForMatchingStudent() {
      this.set('errorMessage', null);
      this.set('isLoading', true);
      this._validateInputString('firstName', this.firstName);
      this._validateInputString('lastName', this.lastName);
      this._validateInputDay('dayOfBirth', this.dayOfBirth);
      this._validateInputMonth('monthOfBirth', this.monthOfBirth);
      this._validateInputYear('yearOfBirth', this.yearOfBirth);
      if (this.isSearchFormNotValid) {
        return this.set('isLoading', false);
      }

      this.studentUserAssociation = this.store.createRecord('student-user-association', {
        id: this.campaignCode + '_' + this.lastName,
        firstName: this.firstName,
        lastName: this.lastName,
        birthdate: this.birthdate,
        campaignCode: this.campaignCode,
      });

      return this.studentUserAssociation.save({ adapterOptions: { searchForMatchingStudent: true } })
        .then(() => {
          this.set('matchingStudentFound', true);
          this.set('isLoading', false);
          return this.studentDependentUser = this.store.createRecord('student-dependent-user', {
            campaignCode: this.campaignCode,
            firstName: this.firstName,
            lastName: this.lastName,
            birthdate: this.birthdate,
            email: '',
            username: '',
            password: ''
          });
        }, (errorResponse) => {
          this.studentUserAssociation.unloadRecord();
          this.set('isLoading', false);
          errorResponse.errors.forEach((error) => {
            if (error.status === '404') {
              return this.set('errorMessage', 'Oups ! nous ne parvenons pas à vous trouver. Vérifiez vos informations afin de continuer ou prévenez l’organisateur de votre parcours.');
            }
            return this.set('errorMessage', error.detail);
          });
        });
    },

    async register() {
      this.set('isLoading', true);
      this.set('studentDependentUser.withUsername', !this.loginWithEmail);
      try {
        if (this.loginWithEmail) {
          this.set('studentDependentUser.username', undefined);
        } else {
          this.set('studentDependentUser.email', undefined);
          this.set('studentDependentUser.username', this.username);
        }
        await this.studentDependentUser.save();
      } catch (error) {
        this.studentDependentUser.unloadRecord();
        this.set('isLoading', false);
        return this._updateInputsStatus();
      }

      if (this.loginWithEmail) {
        await this._authenticate(this.get('studentDependentUser.email'), this.get('studentDependentUser.password'));
      } else {
        await this._authenticate(this.get('studentDependentUser.username'), this.get('studentDependentUser.password'));
      }

      this.set('studentDependentUser.password', null);
      this.set('isLoading', false);
    },

    onToggle(data) {
      this.set('loginWithEmail', data);
    },

    togglePasswordVisibility() {
      this.toggleProperty('isPasswordVisible');
    },

    triggerInputStringValidation(key, value) {
      this._validateInputString(key, value);
    },
    triggerInputDayValidation(key, value) {
      value = value.trim();
      this._standardizeNumberInInput('dayOfBirth', value);
      this._validateInputDay(key, value);
    },
    triggerInputMonthValidation(key, value) {
      value = value.trim();
      this._standardizeNumberInInput('monthOfBirth', value);
      this._validateInputMonth(key, value);
    },
    triggerInputYearValidation(key, value) {
      value = value.trim();
      this.set('yearOfBirth', value);
      this._validateInputYear(key, value);
    },
    triggerInputEmailValidation(key, value) {
      this._validateInputEmail(key, value);
    },
    triggerInputUsernameValidation(key, value) {
      this._validateInputUsername(key, value);
    },
    triggerInputPasswordValidation(key, value) {
      this._validateInputPassword(key, value);
    },
  },

  _executeFieldValidation(key, value, isValid) {
    const isInvalidInput = !isValid(value);
    const message = isInvalidInput ? ERROR_INPUT_MESSAGE_MAP[key] : null;
    const status =  isInvalidInput ? 'error' : 'success';
    const statusObject = 'validation.' + key + '.status';
    const messageObject = 'validation.' + key + '.message';
    this.set(statusObject, status);
    return this.set(messageObject, message);
  },

  _updateInputsStatus() {
    const errors = this.get('studentDependentUser.errors');
    errors.forEach(({ attribute, message }) => {
      const statusObject = 'validation.' + attribute + '.status';
      const messageObject = 'validation.' + attribute + '.message';
      this.set(statusObject, 'error');
      this.set(messageObject, message);
    });
  },

  _validateInputString(key, value) {
    this._executeFieldValidation(key, value, isStringValid);
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

  _validateInputEmail(key, value) {
    this._executeFieldValidation(key, value, isEmailValid);
  },

  _validateInputUsername(key, value) {
    this._executeFieldValidation(key, value, isUsernameValid);
  },

  _validateInputPassword(key, value) {
    this._executeFieldValidation(key, value, isPasswordValid);
  },

  _standardizeNumberInInput(attribute, value) {
    if (value) {
      this.set(attribute, standardizeNumberInTwoDigitFormat(value));
    }
  },

  _authenticate(email, password) {
    const scope = 'mon-pix';
    return this.session.authenticate('authenticator:oauth2', { email, password, scope });
  },

});
