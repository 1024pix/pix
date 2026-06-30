import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixIcon from '@1024pix/pix-ui/components/pix-icon';
import PixInput from '@1024pix/pix-ui/components/pix-input';
import PixLabel from '@1024pix/pix-ui/components/pix-label';
import PixNotificationAlert from '@1024pix/pix-ui/components/pix-notification-alert';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import t from 'ember-intl/helpers/t';

export default class CertificationJoiner extends Component {
  @service store;
  @service intl;

  SESSION_ID_VALIDATION_PATTERN = '^[0-9]*$';

  @tracked isFormLoading = false;
  @tracked errorMessage = null;
  @tracked errorDetailList = [];
  @tracked errorMessageLink = null;
  @tracked sessionIdIsNotANumberMessage = null;
  @tracked sessionIdStatus = 'default';
  @tracked sessionId = null;
  @tracked firstName = null;
  @tracked lastName = null;
  @tracked dayOfBirth = null;
  @tracked monthOfBirth = null;
  @tracked yearOfBirth = null;

  get birthdate() {
    const monthOfBirth = String(this.monthOfBirth).padStart(2, '0');
    const dayOfBirth = String(this.dayOfBirth).padStart(2, '0');
    return [this.yearOfBirth, monthOfBirth, dayOfBirth].join('-');
  }

  _isANumber(value) {
    return new RegExp(this.SESSION_ID_VALIDATION_PATTERN).test(value);
  }

  _resetErrorMessages() {
    this.errorMessage = null;
    this.errorDetailList = [];
    this.errorMessageLink = null;
  }

  _handleSaveError(error) {
    const errorDetails = error.errors?.[0];
    if (!errorDetails) return;

    const handler = ERROR_HANDLERS.find(({ match }) => match(errorDetails));

    if (handler) {
      handler.handle(this, errorDetails);
    } else {
      this.errorMessage = this.intl.t('pages.certification-joiner.error-messages.generic.disclaimer');
      this.errorDetailList = [
        this.intl.t('pages.certification-joiner.error-messages.generic.check-session-number'),
        this.intl.t('pages.certification-joiner.error-messages.generic.check-personal-info'),
      ];
    }
  }

  @action
  checkSessionIdIsValid(event) {
    const { value } = event.target;

    this.sessionIdIsNotANumberMessage = null;
    this.sessionIdStatus = 'default';

    if (value && !this._isANumber(value)) {
      this.sessionIdIsNotANumberMessage = this.intl.t(
        'pages.certification-joiner.form.fields-validation.session-number-error',
      );
      this.sessionIdStatus = 'error';
    }
  }

  @action
  setSessionId(event) {
    this.sessionId = event.target.value;
  }

  @action
  setFirstName(event) {
    this.firstName = event.target.value;
  }

  @action
  setLastName(event) {
    this.lastName = event.target.value;
  }

  @action
  setDayOfBirth(event) {
    this.dayOfBirth = event.target.value;
  }

  @action
  setMonthOfBirth(event) {
    this.monthOfBirth = event.target.value;
  }

  @action
  setYearOfBirth(event) {
    this.yearOfBirth = event.target.value;
  }

  @action
  async handleSubmit(e) {
    e.preventDefault();

    if (this.isFormLoading) return;

    this._resetErrorMessages();

    if (this.sessionId && !this._isANumber(this.sessionId)) {
      this.sessionIdIsNotANumberMessage = this.intl.t(
        'pages.certification-joiner.form.fields-validation.session-number-error',
      );
      document.querySelector('#certificationJoinerSessionId').focus();
      return;
    }

    let currentCertificationCandidate = null;
    try {
      this.isFormLoading = true;

      currentCertificationCandidate = this.store.createRecord('certification-candidate', {
        sessionId: this.sessionId,
        birthdate: this.birthdate,
        firstName: this.firstName?.trim() ?? null,
        lastName: this.lastName?.trim() ?? null,
      });
      await currentCertificationCandidate.save({ adapterOptions: { joinSession: true, sessionId: this.sessionId } });
      this.args.onStepChange(currentCertificationCandidate.id);
    } catch (error) {
      currentCertificationCandidate?.deleteRecord();
      this._handleSaveError(error);
    } finally {
      this.isFormLoading = false;
    }
  }

  @action
  handleDayInputChange(event) {
    const { value } = event.target;

    if (value.length === 2) {
      document.getElementById('certificationJoinerMonthOfBirth').focus();
    }
  }

  @action
  handleMonthInputChange(event) {
    const { value } = event.target;

    if (value.length === 2) {
      document.getElementById('certificationJoinerYearOfBirth').focus();
    }
  }

  @action
  handleInputFocus(value, event) {
    event.target.select();
  }

  <template>
    <section class="certification-joiner">
      <h1 class="certification-joiner__title">{{t "pages.certification-joiner.first-title"}}</h1>
      <form {{on "submit" this.handleSubmit}}>
        <p class="certification-joiner__mandatory">{{t "common.form.mandatory-all-fields"}}</p>

        <PixInput
          @id="certificationJoinerSessionId"
          @errorMessage={{this.sessionIdIsNotANumberMessage}}
          @validationStatus={{this.sessionIdStatus}}
          title={{t "pages.certification-joiner.form.fields-validation.session-number-error"}}
          {{on "input" this.checkSessionIdIsValid}}
          {{on "change" this.setSessionId}}
          type="number"
          inputmode="numeric"
          min="0"
          step="1"
          pattern={{this.SESSION_ID_VALIDATION_PATTERN}}
          required="true"
          @subLabel={{t "pages.certification-joiner.form.fields.session-number-information"}}
          placeholder={{t "pages.certification-joiner.form.placeholders.session-number"}}
          autocomplete="organization"
        >
          <:label>{{t "pages.certification-joiner.form.fields.session-number"}}</:label>
        </PixInput>
        <PixInput
          @id="certificationJoinerFirstName"
          required="true"
          {{on "change" this.setFirstName}}
          placeholder={{t "pages.certification-joiner.form.placeholders.first-name"}}
          autocomplete="given-name"
        >
          <:label>{{t "pages.certification-joiner.form.fields.first-name"}}</:label>
        </PixInput>
        <PixInput
          @id="certificationJoinerLastName"
          required="true"
          {{on "change" this.setLastName}}
          placeholder={{t "pages.certification-joiner.form.placeholders.birth-name"}}
          autocomplete="family-name"
        >
          <:label>{{t "pages.certification-joiner.form.fields.birth-name"}}</:label>
        </PixInput>
        <div>
          <PixLabel class="certification-joiner__label" for="certificationJoinerDayOfBirth">{{t
              "pages.certification-joiner.form.fields.birth-date"
            }}</PixLabel>
          <div class="certification-joiner__birthdate" id="certificationJoinerBirthDate">
            <PixInput
              @id="certificationJoinerDayOfBirth"
              min="1"
              max="31"
              type="number"
              placeholder={{t "pages.certification-joiner.form.placeholders.birth-day"}}
              {{on "change" this.setDayOfBirth}}
              {{on "input" this.handleDayInputChange}}
              {{on "focus-in" this.handleInputFocus}}
              @screenReaderOnly="true"
              required="true"
              autocomplete="bday-day"
            >
              <:label>{{t "pages.certification-joiner.form.fields.birth-day"}}</:label>
            </PixInput>
            <PixInput
              @id="certificationJoinerMonthOfBirth"
              min="1"
              max="12"
              type="number"
              placeholder={{t "pages.certification-joiner.form.placeholders.birth-month"}}
              {{on "change" this.setMonthOfBirth}}
              {{on "input" this.handleMonthInputChange}}
              {{on "focus-in" this.handleInputFocus}}
              @screenReaderOnly="true"
              required="true"
              autocomplete="bday-month"
            >
              <:label>{{t "pages.certification-joiner.form.fields.birth-month"}}</:label>
            </PixInput>
            <PixInput
              @id="certificationJoinerYearOfBirth"
              min="1900"
              max="2100"
              type="number"
              placeholder={{t "pages.certification-joiner.form.placeholders.birth-year"}}
              {{on "change" this.setYearOfBirth}}
              {{on "focus-in" this.handleInputFocus}}
              @screenReaderOnly="true"
              required="true"
              autocomplete="bday-year"
            >
              <:label>{{t "pages.certification-joiner.form.fields.birth-year"}}</:label>
            </PixInput>
          </div>
        </div>

        {{#if this.errorMessage}}
          <div class="certification-course-page__errors">
            <PixNotificationAlert @type="error">
              {{this.errorMessage}}
              {{#if this.errorDetailList}}
                <ul class="certification-course-page__errors__list">
                  {{#each this.errorDetailList as |errorDetailElement|}}
                    <li>{{errorDetailElement}}</li>
                  {{/each}}
                </ul>
              {{/if}}
              {{#if this.errorMessageLink}}
                <a rel="noopener noreferrer" target="_blank" href={{this.errorMessageLink.url}}>
                  {{this.errorMessageLink.label}}
                  <PixIcon @name="openNew" @title={{t "navigation.external-link-title"}} />
                </a>
              {{/if}}
            </PixNotificationAlert>
          </div>
        {{/if}}
        <PixButton @id="certificationJoinerSubmitButton" @type="submit" @isLoading={{this.isFormLoading}}>
          {{t "pages.certification-joiner.form.actions.submit"}}
        </PixButton>
      </form>
    </section>
  </template>
}

const ERROR_HANDLERS = [
  {
    match: (error) => error.code === 'LANGUAGE_NOT_SUPPORTED',
    handle(component, error) {
      const { languageCode } = error.meta;
      const userLanguage = component.intl.t(`common.languages.${languageCode}`);
      const NO_BREAK_SPACE = String.fromCharCode(160);
      const availableLanguages = ['en', 'fr']
        .map((code) => component.intl.t(`common.languages.${code}`))
        .join(`, ${NO_BREAK_SPACE}`);

      component.errorMessage = component.intl.t('pages.certification-joiner.error-messages.language-not-supported', {
        userLanguage,
        availableLanguages,
        htmlSafe: true,
      });
      component.errorMessageLink = {
        label: component.intl.t('pages.certification-joiner.error-messages.language-not-supported-link'),
        url: 'https://app.pix.org/mon-compte/langue',
      };
    },
  },
  {
    match: (error) => error.code === 'MATCHING_RECONCILED_STUDENT_NOT_FOUND',
    handle(component) {
      component.errorMessage = component.intl.t('pages.certification-joiner.error-messages.wrong-account-sco');
      component.errorMessageLink = {
        label: component.intl.t('pages.certification-joiner.error-messages.wrong-account-sco-link.label'),
        url: component.intl.t('pages.certification-joiner.error-messages.wrong-account-sco-link.url'),
      };
    },
  },
  {
    match: (error) => error.status === '409' && error.code === 'UNEXPECTED_USER_ACCOUNT',
    handle(component) {
      component.errorMessage = component.intl.t('pages.certification-joiner.error-messages.wrong-account');
    },
  },
  {
    match: (error) => error.status === '412',
    handle(component) {
      component.errorMessage = component.intl.t('pages.certification-joiner.error-messages.session-not-accessible');
    },
  },
  {
    match: (error) => error.status === '403' && error.code === 'CENTER_HABILITATION_ERROR',
    handle(component, error) {
      const subscription = component.intl.t(`pages.certification-frameworks.${error.meta?.framework}`);
      component.errorMessage = component.intl.t(
        'pages.certification-joiner.error-messages.missing-center-habilitation',
        { subscription, htmlSafe: true },
      );
    },
  },
  {
    match: (error) => error.code === 'WRONG_PIX_PLUS_CANDIDATE_DOMAIN',
    handle(component) {
      component.errorMessage = component.intl.t('pages.certification-joiner.error-messages.wrong-domain-for-pix-plus', {
        htmlSafe: true,
      });
    },
  },
];
