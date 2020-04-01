import { action, computed } from '@ember/object';
import { inject } from '@ember/service';
import Component from '@ember/component';
import classic from 'ember-classic-decorator';
import { standardizeNumberInTwoDigitFormat } from 'mon-pix/utils/standardize-number';

import isEmailValid from '../../utils/email-validator';
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

const isDayValid = (value) => value > 0 && value <= 31;
const isMonthValid = (value) => value > 0 && value <= 12;
const isYearValid = (value) => value > 999 && value <= 9999;
const isStringValid = (value) => !!value.trim();

@classic
export default class RegisterForm extends Component {
  @inject()
  session;

  @inject()
  store;

  studentDependentUser = null;
  studentUserAssociation = null;
  isLoading = false;
  errorMessage = null;
  matchingStudentFound = false;
  isPasswordVisible = false;
  loginWithUsername = true;

  @computed('isPasswordVisible')
  get passwordInputType() {
    return this.isPasswordVisible ? 'text' : 'password';
  }

  username = '';
  email = '';
  password = '';
  firstName = '';
  lastName = '';
  dayOfBirth = '';
  monthOfBirth = '';
  yearOfBirth = '';

  @computed('yearOfBirth', 'monthOfBirth', 'dayOfBirth')
  get birthdate() {
    const dayOfBirth = standardizeNumberInTwoDigitFormat(this.dayOfBirth.trim());
    const monthOfBirth = standardizeNumberInTwoDigitFormat(this.monthOfBirth.trim());
    const yearOfBirth = this.yearOfBirth.trim();
    return [yearOfBirth, monthOfBirth, dayOfBirth].join('-');
  }

  @computed('firstName', 'lastName', 'yearOfBirth', 'monthOfBirth', 'dayOfBirth')
  get isSearchFormNotValid() {
    return !isStringValid(this.firstName) || !isStringValid(this.lastName)
      || !isDayValid(this.dayOfBirth) || !isMonthValid(this.monthOfBirth) || !isYearValid(this.yearOfBirth);
  }

  @computed('email', 'username', 'password')
  get isCreationFormNotValid() {
    const isPasswordNotValid = !isPasswordValid(this.get('password'));
    const isUsernameNotValid = !isStringValid(this.get('username'));
    const isEmailNotValid = !isEmailValid(this.get('email'));
    if (this.loginWithUsername) {
      return isUsernameNotValid || isPasswordNotValid;
    }
    return isEmailNotValid || isPasswordNotValid;
  }

  init() {
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

    this.set('validation', validation);
    super.init(...arguments);
  }

  willDestroyElement() {
    if (this.studentUserAssociation) this.studentUserAssociation.unloadRecord();
    if (this.studentDependentUser) this.studentDependentUser.unloadRecord();
    super.willDestroyElement(...arguments);
  }

  @action
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
      .then((response) => {
        this.set('matchingStudentFound', true);
        this.set('isLoading', false);
        this.set('username', response.username);
        return this.studentDependentUser = this.store.createRecord('user', {
          firstName: this.firstName,
          lastName: this.lastName,
          email: '',
          username: this.username,
          password: '',
        });
      }, (errorResponse) => {
        this.studentUserAssociation.unloadRecord();
        this.set('isLoading', false);
        errorResponse.errors.forEach((error) => {
          if (error.status === '404') {
            return this.set('errorMessage', 'Vérifiez vos informations afin de continuer ou prévenez l’organisateur de votre parcours.');
          }
          if (error.status === '409') {
            return this.set('errorMessage', 'Vous possédez déjà un compte Pix. Veuillez vous connecter.');
          }
          return this.set('errorMessage', error.detail);
        });
      });
  }

  @action
  async register() {
    this.set('isLoading', true);
    try {
      this.set('studentDependentUser.password', this.password);
      if (this.loginWithUsername) {
        this.set('studentDependentUser.username', this.get('username'));
        this.set('studentDependentUser.email', undefined);
      } else {
        this.set('studentDependentUser.email', this.get('email'));
        this.set('studentDependentUser.username', undefined);
      }
      await this.studentDependentUser.save({
        adapterOptions: {
          isStudentDependentUser: true,
          campaignCode: this.campaignCode,
          birthdate: this.birthdate,
          withUsername: this.loginWithUsername,
        }
      });
    } catch (error) {
      this.set('isLoading', false);
      return this._updateInputsStatus();
    }

    if (this.loginWithUsername) {
      await this._authenticate(this.get('studentDependentUser.username'), this.get('studentDependentUser.password'));
    } else {
      await this._authenticate(this.get('studentDependentUser.email'), this.get('studentDependentUser.password'));
    }

    this.set('studentDependentUser.password', null);
    this.set('isLoading', false);
  }

  @action
  onToggle(data) {
    this.set('loginWithUsername', data);
  }

  @action
  togglePasswordVisibility() {
    this.toggleProperty('isPasswordVisible');
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
    this.set('yearOfBirth', value);
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
    const message = isInvalidInput ? ERROR_INPUT_MESSAGE_MAP[key] : null;
    const status =  isInvalidInput ? 'error' : 'success';
    const statusObject = 'validation.' + key + '.status';
    const messageObject = 'validation.' + key + '.message';
    this.set(statusObject, status);
    return this.set(messageObject, message);
  }

  _updateInputsStatus() {
    const errors = this.get('studentDependentUser.errors');
    errors.forEach(({ attribute, message }) => {
      const statusObject = 'validation.' + attribute + '.status';
      const messageObject = 'validation.' + attribute + '.message';
      this.set(statusObject, 'error');
      this.set(messageObject, message);
    });
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
      this.set(attribute, standardizeNumberInTwoDigitFormat(value));
    }
  }

  _authenticate(login, password) {
    const scope = 'mon-pix';
    return this.session.authenticate('authenticator:oauth2', { login, password, scope });
  }
}
