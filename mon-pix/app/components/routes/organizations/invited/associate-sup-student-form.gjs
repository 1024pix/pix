import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixInput from '@1024pix/pix-ui/components/pix-input';
import { fn } from '@ember/helper';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import t from 'ember-intl/helpers/t';
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

export default class AssociateSupStudentForm extends Component {
  <template>
    <div class="join-restricted-campaign__title">{{t "pages.join.sup.title" organizationName=@organizationName}}</div>
    <div class="join-restricted-campaign__subtitle">{{t
        "pages.join.sup.message"
        organizationName=@organizationName
      }}</div>
    <form>
      <PixInput
        @id="studentNumber"
        type="text"
        @value={{this.studentNumber}}
        @errorMessage={{this.errors.studentNumber}}
        @validationStatus={{if this.errors.studentNumber "error" "default"}}
        class={{if this.errors.studentNumber "input--error"}}
        {{on "focusout" (fn this.triggerInputStringValidation "studentNumber" this.studentNumber)}}
        {{on "input" this.handleStudentNumberInput}}
      >
        <:label>{{t "pages.join.sup.fields.student-number.label"}}</:label>
      </PixInput>

      <PixInput
        @id="firstName"
        type="text"
        @value={{this.firstName}}
        @errorMessage={{this.errors.firstName}}
        @validationStatus={{if this.errors.firstName "error" "default"}}
        class={{if this.errors.firstName "input--error"}}
        {{on "focusout" (fn this.triggerInputStringValidation "firstName" this.firstName)}}
        {{on "input" this.handleFirstNameInput}}
      >
        <:label>
          {{t "pages.join.fields.firstname.label"}}
        </:label>
      </PixInput>

      <PixInput
        @id="lastName"
        type="text"
        @value={{this.lastName}}
        class={{if this.errors.lastName "input--error"}}
        @errorMessage={{this.errors.lastName}}
        @validationStatus={{if this.errors.lastName "error" "default"}}
        {{on "focusout" (fn this.triggerInputStringValidation "lastName" this.lastName)}}
        {{on "input" this.handleLastNameInput}}
      >
        <:label>
          {{t "pages.join.fields.lastname.label"}}
        </:label>
      </PixInput>

      <div class="join-restricted-campaign__row">
        <label class="join-restricted-campaign__label">
          {{t "pages.join.fields.birthdate.label"}}
        </label>
        <div class="join-restricted-campaign__birthdate">
          <PixInput
            type="number"
            min="1"
            max="31"
            @value={{this.dayOfBirth}}
            placeholder={{t "pages.join.fields.birthdate.day-format"}}
            @screenReaderOnly={{true}}
            @validationStatus={{if this.errors.dayOfBirth "error" "default"}}
            {{on "focusout" (fn this.triggerInputDayValidation "dayOfBirth" this.dayOfBirth)}}
            {{on "input" this.handleDayOfBirthInput}}
          >
            <:label>{{t "pages.join.fields.birthdate.day-label"}}</:label>
          </PixInput>

          <PixInput
            type="number"
            min="1"
            max="12"
            @value={{this.monthOfBirth}}
            placeholder={{t "pages.join.fields.birthdate.month-format"}}
            @screenReaderOnly={{true}}
            @validationStatus={{if this.errors.monthOfBirth "error" "default"}}
            {{on "focusout" (fn this.triggerInputMonthValidation "monthOfBirth" this.monthOfBirth)}}
            {{on "input" this.handleMonthOfBirthInput}}
          >
            <:label>{{t "pages.join.fields.birthdate.month-label"}}</:label>
          </PixInput>

          <PixInput
            type="number"
            min="1900"
            @value={{this.yearOfBirth}}
            placeholder={{t "pages.join.fields.birthdate.year-format"}}
            @screenReaderOnly={{true}}
            @validationStatus={{if this.errors.yearOfBirth "error" "default"}}
            {{on "focusout" (fn this.triggerInputYearValidation "yearOfBirth" this.yearOfBirth)}}
            {{on "input" this.handleYearOfBirthInput}}
          >
            <:label>{{t "pages.join.fields.birthdate.year-label"}}</:label>
          </PixInput>
        </div>
        {{#if this.errors.dayOfBirth}}
          <div class="join-restricted-campaign__field-error" role="alert">{{this.errors.dayOfBirth}}</div>
        {{/if}}
        {{#if this.errors.monthOfBirth}}
          <div class="join-restricted-campaign__field-error" role="alert">{{this.errors.monthOfBirth}}</div>
        {{/if}}
        {{#if this.errors.yearOfBirth}}
          <div class="join-restricted-campaign__field-error" role="alert">{{this.errors.yearOfBirth}}</div>
        {{/if}}
      </div>

      {{#if this.errors.global}}
        <div class="join-restricted-campaign__error" aria-live="polite">{{this.errors.global}}</div>
      {{/if}}

      <PixButton @type="submit" @triggerAction={{this.submit}} class="join-restricted-campaign__button">
        {{t "pages.join.button"}}
      </PixButton>
    </form>
  </template>
  @service store;
  @service intl;
  @service accessStorage;
  @service router;

  @tracked firstName = '';
  @tracked lastName = '';
  @tracked dayOfBirth = '';
  @tracked monthOfBirth = '';
  @tracked yearOfBirth = '';
  @tracked studentNumber = '';

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

    const hasError =
      this.errors.studentNumber ||
      this.errors.firstName ||
      this.errors.lastName ||
      this.errors.dayOfBirth ||
      this.errors.monthOfBirth ||
      this.errors.yearOfBirth;

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
  handleStudentNumberInput(event) {
    this.studentNumber = event.target.value;
  }

  @action
  handleFirstNameInput(event) {
    this.firstName = event.target.value;
  }

  @action
  handleLastNameInput(event) {
    this.lastName = event.target.value;
  }

  @action
  handleDayOfBirthInput(event) {
    this.dayOfBirth = event.target.value;
  }

  @action
  handleMonthOfBirthInput(event) {
    this.monthOfBirth = event.target.value;
  }

  @action
  handleYearOfBirthInput(event) {
    this.yearOfBirth = event.target.value;
  }

  @action
  async submit(event) {
    event.preventDefault();

    if (!this.isValidForm) return;

    const supOrganizationLearner = this.store.createRecord('sup-organization-learner', {
      id: `${this.args.campaignCode}_${this.lastName}`,
      studentNumber: this.studentNumber,
      firstName: this.firstName,
      lastName: this.lastName,
      birthdate: this.birthdate,
      campaignCode: this.args.campaignCode,
    });

    try {
      await supOrganizationLearner.save();
      this.accessStorage.setAssociationDone(this.args.organizationId);
      const verifiedCode = await this.store.findRecord('verified-code', this.args.campaignCode);

      if (verifiedCode.type === 'campaign') {
        this.router.transitionTo('campaigns.fill-in-participant-external-id', verifiedCode.id);
      } else {
        this.router.transitionTo('combined-courses.programme', verifiedCode.id);
      }
      return;
    } catch (errorResponse) {
      supOrganizationLearner.unloadRecord();
      this._setErrorMessage(errorResponse);
    }
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
