import { PixButton, PixIcon, PixInput, PixNotificationAlert, PixTooltip } from '@1024pix/nebulix-ember';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { LinkTo } from '@ember/routing';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import dayjs from 'dayjs';
import t from 'ember-intl/helpers/t';
import not from 'ember-truth-helpers/helpers/not';
import isEmpty from 'lodash/isEmpty';

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
  <template>
    {{! template-lint-disable require-input-label  no-unknown-arguments-for-builtin-components }}
    <h1 class="account-recovery__content--title">
      {{t "pages.account-recovery.find-sco-record.student-information.title"}}
    </h1>

    <div class="account-recovery__content--step--content">
      <p class="account-recovery__content--information-text--details">
        {{t "pages.account-recovery.find-sco-record.student-information.subtitle.text"}}
        <LinkTo @route="password-reset-demand">
          {{t "pages.account-recovery.find-sco-record.student-information.subtitle.link"}}
        </LinkTo>
      </p>

      <p class="account-recovery__content--information-text--details">
        {{t "pages.account-recovery.find-sco-record.student-information.mandatory-all-fields"}}
      </p>

      <form {{on "submit" this.submit}} class="account-recovery__form">
        <PixInput
          @id="ineIna"
          type="text"
          placeholder="123456789XX"
          @value={{this.ineIna}}
          {{on "focusout" this.validateIneIna}}
          {{on "input" this.handleIneInaInput}}
          @validationStatus={{this.ineInaValidation.status}}
          @errorMessage={{this.ineInaValidation.message}}
          autocomplete="off"
        >
          <:label>
            {{t "pages.account-recovery.find-sco-record.student-information.form.ine-ina"}}

            <div class="student-information-form__tooltip">
              <PixTooltip
                @position="top-left"
                @isLight={{true}}
                @isWide={{true}}
                aria-label={{t "pages.account-recovery.find-sco-record.student-information.form.tooltip" htmlSafe=true}}
              >
                <:triggerElement>
                  <PixIcon @name="help" @plainIcon={{true}} @ariaHidden={{true}} tabindex="0" />
                </:triggerElement>
                <:tooltip>
                  {{t "pages.account-recovery.find-sco-record.student-information.form.tooltip" htmlSafe=true}}
                </:tooltip>
              </PixTooltip>
            </div>
          </:label>
        </PixInput>

        <PixInput
          @id="firstName"
          @value={{this.firstName}}
          {{on "focusout" this.validateFirstName}}
          {{on "input" this.handleFirstNameInput}}
          @validationStatus={{this.firstNameValidation.status}}
          @errorMessage={{this.firstNameValidation.message}}
          autocomplete="off"
          type="text"
        >
          <:label>{{t "pages.account-recovery.find-sco-record.student-information.form.first-name"}}</:label>
        </PixInput>

        <PixInput
          @id="lastName"
          @value={{this.lastName}}
          {{on "focusout" this.validateLastName}}
          {{on "input" this.handleLastNameInput}}
          @validationStatus={{this.lastNameValidation.status}}
          @errorMessage={{this.lastNameValidation.message}}
          autocomplete="off"
          type="text"
        >
          <:label>{{t "pages.account-recovery.find-sco-record.student-information.form.last-name"}}</:label>
        </PixInput>

        <div class="form-textfield">
          <p class="form-textfield__label student-information-form__birthdate-label">
            {{t "pages.account-recovery.find-sco-record.student-information.form.birthdate"}}
          </p>
          <div class="student-information-form__birthdate-fields">
            <PixInput
              min="1"
              max="31"
              type="number"
              @value={{this.dayOfBirth}}
              placeholder={{t "pages.account-recovery.find-sco-record.student-information.form.placeholder.birth-day"}}
              @id="dayOfBirth"
              {{on "input" this.handleDayInput}}
              autocomplete="off"
              @screenReaderOnly={{true}}
            >
              <:label>{{t "pages.account-recovery.find-sco-record.student-information.form.label.birth-day"}}</:label>
            </PixInput>

            <PixInput
              min="1"
              max="12"
              type="number"
              @value={{this.monthOfBirth}}
              placeholder={{t
                "pages.account-recovery.find-sco-record.student-information.form.placeholder.birth-month"
              }}
              @id="monthOfBirth"
              {{on "input" this.handleMonthInput}}
              autocomplete="off"
              @screenReaderOnly={{true}}
            >
              <:label>{{t "pages.account-recovery.find-sco-record.student-information.form.label.birth-month"}}</:label>
            </PixInput>

            <PixInput
              min="1900"
              type="number"
              @value={{this.yearOfBirth}}
              placeholder={{t "pages.account-recovery.find-sco-record.student-information.form.placeholder.birth-year"}}
              @id="yearOfBirth"
              autocomplete="off"
              {{on "input" this.handleYearInput}}
              @screenReaderOnly={{true}}
            >
              <:label>{{t "pages.account-recovery.find-sco-record.student-information.form.label.birth-year"}}</:label>
            </PixInput>
          </div>
        </div>

        {{#if @showAccountNotFoundError}}
          <PixNotificationAlert
            @type="error"
            class="account-recovery__content--not-found-error"
            id="student-information-error-message"
          >
            {{t "pages.account-recovery.find-sco-record.student-information.errors.not-found"}}
            <a
              href="{{t 'pages.account-recovery.find-sco-record.contact-support.link-url'}}"
              target="_blank"
              rel="noopener noreferrer"
            >
              {{t "pages.account-recovery.find-sco-record.contact-support.link-text"}}
            </a>
          </PixNotificationAlert>
        {{/if}}

        <PixButton @type="submit" @isDisabled={{not this.isFormValid}}>
          {{t "pages.account-recovery.find-sco-record.student-information.form.submit"}}
        </PixButton>
      </form>
    </div>
  </template>
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
  handleIneInaInput(event) {
    this.ineIna = event.target.value;
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
  handleDayInput(event) {
    const { value } = event.target;
    this.dayOfBirth = value;
    if (value.length === 2) {
      document.getElementById('monthOfBirth').focus();
    }
  }

  @action
  handleMonthInput(event) {
    const { value } = event.target;
    this.monthOfBirth = value;
    if (value.length === 2) {
      document.getElementById('yearOfBirth').focus();
    }
  }

  @action
  handleYearInput(event) {
    const { value } = event.target;
    this.yearOfBirth = value;
  }
}
