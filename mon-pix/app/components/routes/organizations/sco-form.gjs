import { PixButton, PixInput } from '@1024pix/nebulix-ember';
import { fn } from '@ember/helper';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import t from 'ember-intl/helpers/t';
import { standardizeNumberInTwoDigitFormat } from 'mon-pix/utils/standardize-number';

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

export default class ScoForm extends Component {
  <template>
    {{! template-lint-disable require-input-label }}
    <h1 class="join-restricted-campaign__sco-title">{{t
        "pages.join.sco.first-title"
        organizationName=@organizationName
      }}</h1>
    <div class="join-restricted-campaign__subtitle">{{t "pages.join.sco.subtitle"}}</div>
    <form onSubmit={{this.validateForm}}>
      <PixInput
        @id="firstName"
        type="text"
        @value={{this.firstName}}
        placeholder={{t "pages.join.fields.firstname.label"}}
        readonly={{@areNamesDisabled}}
        @validationStatus={{if this.validation.firstName "error" "default"}}
        @errorMessage={{this.validation.firstName}}
        {{on "focusout" (fn this.triggerInputStringValidation "firstName" this.firstName)}}
        {{on "input" this.handleFirstNameInput}}
      >
        <:label>{{t "pages.join.fields.firstname.label"}}</:label>
      </PixInput>

      <PixInput
        @id="lastName"
        type="text"
        @value={{this.lastName}}
        placeholder={{t "pages.join.fields.lastname.label"}}
        readonly={{@areNamesDisabled}}
        @validationStatus={{if this.validation.lastName "error" "default"}}
        @errorMessage={{this.validation.lastName}}
        {{on "focusout" (fn this.triggerInputStringValidation "lastName" this.lastName)}}
        {{on "input" this.handleLastNameInput}}
      >
        <:label>{{t "pages.join.fields.lastname.label"}}</:label>
      </PixInput>

      <div>
        <p class="join-restricted-campaign__label">{{t "pages.join.fields.birthdate.label"}}</p>
        <div class="join-restricted-campaign__birthdate">
          <PixInput
            @id="dayOfBirth"
            min="1"
            max="31"
            type="number"
            placeholder={{t "pages.join.fields.birthdate.day-format"}}
            @value={{this.dayOfBirth}}
            @validationStatus={{if this.validation.dayOfBirth "error" "default"}}
            @screenReaderOnly={{true}}
            {{on "focusout" (fn this.triggerInputDayValidation "dayOfBirth" this.dayOfBirth)}}
            {{on "input" this.handleDayOfBirthInput}}
          >
            <:label>{{t "pages.join.fields.birthdate.day-label"}}</:label>
          </PixInput>
          <PixInput
            @id="monthOfBirth"
            type="number"
            min="1"
            max="12"
            placeholder={{t "pages.join.fields.birthdate.month-format"}}
            @value={{this.monthOfBirth}}
            @validationStatus={{if this.validation.monthOfBirth "error" "default"}}
            @screenReaderOnly={{true}}
            {{on "focusout" (fn this.triggerInputMonthValidation "monthOfBirth" this.monthOfBirth)}}
            {{on "input" this.handleMonthOfBirthInput}}
          >
            <:label>{{t "pages.join.fields.birthdate.month-label"}}</:label>
          </PixInput>
          <PixInput
            min="1900"
            @id="yearOfBirth"
            type="number"
            placeholder={{t "pages.join.fields.birthdate.year-format"}}
            @value={{this.yearOfBirth}}
            @validationStatus={{if this.validation.yearOfBirth "error" "default"}}
            @screenReaderOnly={{true}}
            {{on "focusout" (fn this.triggerInputYearValidation "yearOfBirth" this.yearOfBirth)}}
            {{on "input" this.handleYearOfBirthInput}}
          >
            <:label>{{t "pages.join.fields.birthdate.year-label"}}</:label>
          </PixInput>
        </div>
        <div class={{if this.validation.dayOfBirth "join-restricted-campaign__field-error"}} role="alert">
          {{this.validation.dayOfBirth}}
        </div>
        <div class={{if this.validation.monthOfBirth "join-restricted-campaign__field-error"}} role="alert">
          {{this.validation.monthOfBirth}}
        </div>
        <div class={{if this.validation.yearOfBirth "join-restricted-campaign__field-error"}} role="alert">
          {{this.validation.yearOfBirth}}
        </div>
      </div>

      {{#if @errorMessage}}
        <div class="join-restricted-campaign__error" aria-live="polite">{{@errorMessage}}</div>
      {{/if}}
      <div class="join-restricted-campaign__actions">
        <PixButton @type="submit" @isLoading={{this.isLoading}}>{{t "pages.join.button"}}</PixButton>
      </div>

      <p class="legal-notice">
        {{t "pages.join.rgpd-legal-notice"}}
        <a
          href="{{t 'pages.join.rgpd-legal-notice-url'}}"
          target="_blank"
          rel="noopener noreferrer"
          class="link--underline"
        >
          {{t "pages.join.rgpd-legal-notice-link"}}
        </a>
      </p>

    </form>
  </template>
  @service intl;

  @tracked firstName;
  @tracked lastName;
  @tracked dayOfBirth;
  @tracked monthOfBirth;
  @tracked yearOfBirth;
  @tracked isLoading = false;

  validation = new Validation();

  constructor() {
    super(...arguments);
    this.firstName = this.args.firstName || '';
    this.lastName = this.args.lastName || '';
    this.dayOfBirth = '';
    this.monthOfBirth = '';
    this.yearOfBirth = '';
  }

  get birthdate() {
    const dayOfBirth = standardizeNumberInTwoDigitFormat(this.dayOfBirth.trim());
    const monthOfBirth = standardizeNumberInTwoDigitFormat(this.monthOfBirth.trim());
    const yearOfBirth = this.yearOfBirth.trim();
    return [yearOfBirth, monthOfBirth, dayOfBirth].join('-');
  }

  get isFormNotValid() {
    return (
      !isStringValid(this.firstName) ||
      !isStringValid(this.lastName) ||
      !isDayValid(this.dayOfBirth) ||
      !isMonthValid(this.monthOfBirth) ||
      !isYearValid(this.yearOfBirth)
    );
  }

  @action
  async validateForm(event) {
    event.preventDefault();

    this._validateForm();
    if (this.isFormNotValid) {
      return;
    }
    this.isLoading = true;

    await this.args.onSubmit({ firstName: this.firstName, lastName: this.lastName, birthdate: this.birthdate });
    this.isLoading = false;
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

  _validateForm() {
    this._validateInputName('firstName', this.firstName);
    this._validateInputName('lastName', this.lastName);
    this._validateInputDay('dayOfBirth', this.dayOfBirth);
    this._validateInputMonth('monthOfBirth', this.monthOfBirth);
    this._validateInputYear('yearOfBirth', this.yearOfBirth);
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
}
