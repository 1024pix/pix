import classic from 'ember-classic-decorator';
import { action, computed } from '@ember/object';
import { inject as service } from '@ember/service';
import Controller from '@ember/controller';
import { standardizeNumberInTwoDigitFormat } from 'mon-pix/utils/standardize-number';
import ENV from 'mon-pix/config/environment';

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
  @service intl;

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

    const campaignCode = this.model.code;
    const schoolingRegistration = this.store.createRecord('schooling-registration-user-association', {
      id: campaignCode + '_' + this.lastName,
      firstName: this.firstName,
      lastName: this.lastName,
      birthdate: this.birthdate,
      campaignCode,
    });

    return schoolingRegistration.save().then(() => {
      this.set('isLoading', false);
      this.transitionToRoute('campaigns.start-or-resume', this.model.code, {
        queryParams: { associationDone: true, participantExternalId: this.participantExternalId }
      });
    }, (errorResponse) => {
      schoolingRegistration.unloadRecord();
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
        const message = this._showErrorMessageByCode(error.meta);
        this.set('messageTryReconciliation', 'Se déconnecter');
        return this.set('errorMessage', message);
      }
      if (error.status === '404') {
        return this.set('errorMessage', 'Vous êtes un élève ? <br/> Vérifiez vos informations (prénom, nom et date de naissance) ou contactez un enseignant.<br/> <br/> Vous êtes un enseignant ? <br/> L‘accès à un parcours n‘est pas disponible pour le moment.');
      }
      return this.set('errorMessage', error.detail);
    });
  }

  _showErrorMessageByCode(meta) {
    const ACCOUNT_WITH_EMAIL_ALREADY_EXIST_FOR_ANOTHER_ORGANIZATION = `Vous possédez déjà un compte Pix avec l’adresse e-mail ${meta.value}<br> Pour continuer, connectez-vous à ce compte ou demandez de l’aide à un enseignant.<br>(Code R11)`;
    const ACCOUNT_WITH_USERNAME_ALREADY_EXIST_FOR_ANOTHER_ORGANIZATION = `Vous possédez déjà un compte Pix utilisé avec l’identifiant ${meta.value}<br> Pour continuer, connectez-vous à ce compte ou demandez de l'aide à un enseignant.<br>(Code R12)`;
    const ACCOUNT_WITH_GAR_ALREADY_EXIST_FOR_ANOTHER_ORGANIZATION = 'Vous possédez déjà un compte Pix via l\'ENT dans un autre établissement scolaire.<br> Pour continuer, contactez un enseignant qui pourra vous donner l’accès à ce compte à l\'aide de Pix Orga.';
    const ACCOUNT_WITH_EMAIL_ALREADY_EXIST_FOR_SAME_ORGANIZATION = `Vous possédez déjà un compte Pix utilisé dans votre établissement scolaire, avec l'adresse mail ${meta.value}.<br> Connectez-vous à ce compte sinon demandez de l'aide à un enseignant. (Code R31)`;
    const ACCOUNT_WITH_USERNAME_ALREADY_EXIST_FOR_THE_SAME_ORGANIZATION = `Vous possédez déjà un compte Pix utilisé dans votre établissement scolaire, avec un identifiant sous la forme ${meta.value}.<br> Connectez-vous à ce compte sinon demandez de l'aide à un enseignant. (Code R32)`;
    const ACCOUNT_WITH_GAR_ALREADY_EXIST_FOR_THE_SAME_ORGANIZATION = 'Vous possédez déjà un compte Pix via l\'ENT dans votre établissement scolaire.<br> Connectez-vous à ce compte sinon demandez de l\'aide à un enseignant. (Code R33)';

    const errorsMessagesByCodes = {
      'R11': ACCOUNT_WITH_EMAIL_ALREADY_EXIST_FOR_ANOTHER_ORGANIZATION,
      'R12': ACCOUNT_WITH_USERNAME_ALREADY_EXIST_FOR_ANOTHER_ORGANIZATION,
      'R13': ACCOUNT_WITH_GAR_ALREADY_EXIST_FOR_ANOTHER_ORGANIZATION,
      'R31': ACCOUNT_WITH_EMAIL_ALREADY_EXIST_FOR_SAME_ORGANIZATION,
      'R32': ACCOUNT_WITH_USERNAME_ALREADY_EXIST_FOR_THE_SAME_ORGANIZATION,
      'R33': ACCOUNT_WITH_GAR_ALREADY_EXIST_FOR_THE_SAME_ORGANIZATION,
      'default': this.intl.t(ENV.APP.API_ERROR_MESSAGES.INTERNAL_SERVER_ERROR.MESSAGE),
    };
    return (errorsMessagesByCodes[meta.displayShortCode] || errorsMessagesByCodes['default']);
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
