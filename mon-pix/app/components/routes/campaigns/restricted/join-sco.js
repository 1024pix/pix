import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import Component from '@glimmer/component';
import { standardizeNumberInTwoDigitFormat } from 'mon-pix/utils/standardize-number';
import ENV from 'mon-pix/config/environment';
import _ from 'lodash';

const ERROR_INPUT_MESSAGE_MAP = {
  firstName: 'Votre prénom n’est pas renseigné.',
  lastName: 'Votre nom n’est pas renseigné.',
  dayOfBirth: 'Votre jour de naissance n’est pas valide.',
  monthOfBirth: 'Votre mois de naissance n’est pas valide.',
  yearOfBirth: 'Votre année de naissance n’est pas valide.',
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
  @service url;
  @service router;

  validation = new Validation();

  @tracked isLoading = false;
  @tracked errorMessage;
  @tracked displayModal = false;
  @tracked modalErrorMessage = null;

  @tracked firstName = '';
  @tracked lastName = '';
  @tracked dayOfBirth = '';
  @tracked monthOfBirth = '';
  @tracked yearOfBirth = '';

  constructor() {
    super(...arguments);

    if (this.session.data.authenticated.source === 'external') {
      this.firstName = this.currentUser.user.firstName;
      this.lastName = this.currentUser.user.lastName;
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
    return this.session.data.authenticated.source === 'external';
  }

  @action
  closeModal() {
    this.displayModal = false;
  }

  @action
  async goToHome() {
    await this.session.invalidate();
    return window.location.replace(this.url.homeUrl);
  }

  @action
  async goToCampaignConnectionForm() {
    await this.session.invalidate();
    return this.router.replaceWith('campaigns.restricted.login-or-register-to-access', { queryParams: { displayRegisterForm: false } });
  }

  @action
  async attemptNext(event) {
    event.preventDefault();
    this.isLoading = true;
    this._validateInputName('firstName', this.firstName);
    this._validateInputName('lastName', this.lastName);
    this._validateInputDay('dayOfBirth', this.dayOfBirth);
    this._validateInputMonth('monthOfBirth', this.monthOfBirth);
    this._validateInputYear('yearOfBirth', this.yearOfBirth);

    const schoolingRegistration = this.store.createRecord('schooling-registration-user-association', {
      id: this.args.campaignCode + '_' + this.lastName,
      firstName: this.firstName,
      lastName: this.lastName,
      birthdate: this.birthdate,
      campaignCode: this.args.campaignCode,
    });
    if (this.isFormNotValid) {
      return this.isLoading = false;
    }

    try {
      await this.args.onSubmit(schoolingRegistration);
      this.isLoading = false;
    } catch (errorResponse) {
      schoolingRegistration.unloadRecord();
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

  _executeFieldValidation(key, value, isValid) {
    const isInvalidInput = !isValid(value);
    const message = isInvalidInput ? ERROR_INPUT_MESSAGE_MAP[key] : null;
    this.validation[key] = message;
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
        const message = this._showErrorMessageByShortCode(error.meta);
        this.errorMessage = message;
        this.displayModal = true;
        return this.modalErrorMessage = message;
      }
      if (error.status === '404') {
        return this.errorMessage = 'Vous êtes un élève ? <br/> Vérifiez vos informations (prénom, nom et date de naissance) ou contactez un enseignant.<br/> <br/> Vous êtes un enseignant ? <br/> L‘accès à un parcours n‘est pas disponible pour le moment.';
      }
      return this.errorMessage = error.detail;
    });
  }

  _showErrorMessageByShortCode(meta) {
    const defaultMessage = this.intl.t(ENV.APP.API_ERROR_MESSAGES.INTERNAL_SERVER_ERROR.MESSAGE);

    const errors = [
      { code: 'ACCOUNT_WITH_EMAIL_ALREADY_EXIST_FOR_ANOTHER_ORGANIZATION', shortCode:'R11', message: `Vous possédez déjà un compte Pix avec l’adresse e-mail <br>${meta.value}<br>Pour continuer, connectez-vous à ce compte ou demandez de l’aide à un enseignant.<br>(Code R11)` },
      { code: 'ACCOUNT_WITH_USERNAME_ALREADY_EXIST_FOR_ANOTHER_ORGANIZATION', shortCode:'R12', message:`Vous possédez déjà un compte Pix utilisé avec l’identifiant <br>${meta.value}<br>Pour continuer, connectez-vous à ce compte ou demandez de l’aide à un enseignant.<br>(Code R12)` },
      { code: 'ACCOUNT_WITH_GAR_ALREADY_EXIST_FOR_ANOTHER_ORGANIZATION', shortCode:'R13', message: 'Vous possédez déjà un compte Pix via l‘ENT dans un autre établissement scolaire.<br>Pour continuer, contactez un enseignant qui pourra vous donner l’accès à ce compte à l‘aide de Pix Orga.' },
      { code: 'ACCOUNT_WITH_EMAIL_ALREADY_EXIST_FOR_SAME_ORGANIZATION', shortCode:'R31', message:`Vous possédez déjà un compte Pix utilisé dans votre établissement scolaire, avec l‘adresse mail <br>${meta.value}.<br>Pour continuer, connectez-vous à ce compte ou demandez de l’aide à un enseignant.<br> (Code R31)` },
      { code: 'ACCOUNT_WITH_USERNAME_ALREADY_EXIST_FOR_THE_SAME_ORGANIZATION', shortCode:'R32', message:`Vous possédez déjà un compte Pix utilisé dans votre établissement scolaire, avec l‘identifiant<br>${meta.value}.<br>Pour continuer, connectez-vous à ce compte ou demandez de l‘aide à un enseignant.<br> (Code R32)` },
      { code: 'ACCOUNT_WITH_GAR_ALREADY_EXIST_FOR_THE_SAME_ORGANIZATION', shortCode:'R33', message:'Vous possédez déjà un compte Pix via l’ENT. Utilisez-le pour rejoindre le parcours.' }
    ];

    return  _.find(errors, ['shortCode', meta.shortCode]).message || defaultMessage;
  }
}
