import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixCheckbox from '@1024pix/pix-ui/components/pix-checkbox';
import PixCode from '@1024pix/pix-ui/components/pix-code';
import PixIcon from '@1024pix/pix-ui/components/pix-icon';
import PixLabel from '@1024pix/pix-ui/components/pix-label';
import PixNotificationAlert from '@1024pix/pix-ui/components/pix-notification-alert';
import PixSelect from '@1024pix/pix-ui/components/pix-select';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import t from 'ember-intl/helpers/t';

const CODE_LENGTH = 6;

const VALID_CERTIFICATION_LOCALES = {
  FRENCH_FRANCE: 'fr-fr',
  FRENCH: 'fr',
  ENGLISH: 'en',
};

export default class CertificationStarter extends Component {
  @service store;
  @service router;
  @service currentDomain;
  @service currentUser;
  @service intl;
  @service focusedCertificationChallengeWarningManager;
  @service pixCompanion;

  @tracked inputAccessCode = '';
  @tracked apiErrorMessage = null;
  @tracked validationErrorMessage = null;
  @tracked technicalErrorInformation = null;
  @tracked classNames = [];
  @tracked certificationCourse = null;
  @tracked validationStatus = 'default';
  @tracked isFormLoading = false;
  @tracked selectedLanguage = this._isOrgDomain
    ? VALID_CERTIFICATION_LOCALES.FRENCH
    : VALID_CERTIFICATION_LOCALES.FRENCH_FRANCE;
  @tracked hasCandidateConfirmedLanguage = !this._isOrgDomain;

  get accessCode() {
    return this.inputAccessCode.toUpperCase();
  }

  get isAccessCodeFullyFilled() {
    return this.accessCode.length === CODE_LENGTH;
  }

  get shouldDisplayLanguageSelector() {
    return this._isOrgDomain && !this.args.model.certificationCandidate.hasStartedTest;
  }

  get isSubmitButtonDisabled() {
    return (
      (!this.args.model.certificationCandidate.hasStartedTest &&
        (!this.isAccessCodeFullyFilled || !this.hasCandidateConfirmedLanguage)) ||
      (!this.isAccessCodeFullyFilled && this.args.model.certificationCandidate.hasStartedTest)
    );
  }

  get _isOrgDomain() {
    return !this.currentDomain.isFranceDomain;
  }

  get languageOptions() {
    return [
      {
        value: VALID_CERTIFICATION_LOCALES.FRENCH,
        label: this.intl.t('pages.certification-start.language-selector.options.french'),
      },
    ];
  }

  get subscriptionLabel() {
    return this.intl.t(`pages.certification-frameworks.${this.args.model.certificationCandidate.subscription}`);
  }

  get eligibilityState() {
    return this.args.model.certificationCandidate.isEligibleToDoubleCertification ? 'eligible' : 'non-eligible';
  }

  @action
  setLanguage(value) {
    this.selectedLanguage = value;
  }

  @action
  onFormCheckToggle(event) {
    this.hasCandidateConfirmedLanguage = event.target.checked;
  }

  @action
  handleAccessCodeInput(event) {
    this.inputAccessCode = event.target.value;
  }

  @action
  clearErrorMessage() {
    this.apiErrorMessage = null;
    this.validationStatus = 'default';
    this.validationErrorMessage = null;
    this.technicalErrorInformation = null;
  }

  @action
  async submit(e) {
    e.preventDefault();

    if (this.isFormLoading) return;

    this.isFormLoading = true;
    this.clearErrorMessage();

    if (!this.accessCode) {
      this.validationStatus = 'error';
      this.validationErrorMessage = this.intl.t('pages.certification-start.error-messages.missing-code');
      this.isFormLoading = false;
      return;
    }

    const newCertificationCourse = this.store.createRecord('certification-course', {
      accessCode: this.accessCode,
      sessionId: this.args.model.certificationCandidate.sessionId,
      locale: this.selectedLanguage,
    });
    try {
      await newCertificationCourse.save();
      this.focusedCertificationChallengeWarningManager.reset();
      this.router.replaceWith('authenticated.certifications.resume', newCertificationCourse.id);
      this.pixCompanion.startCertification();
    } catch (error) {
      newCertificationCourse.deleteRecord();
      this.#handleSubmitError(error);
    } finally {
      this.isFormLoading = false;
    }
  }

  #handleSubmitError(error) {
    const statusCode = error.errors?.[0]?.status;
    const errorCode = error.errors?.[0]?.code;

    const ERROR_MESSAGE_KEYS = {
      404: 'pages.certification-start.error-messages.access-code-error',
      412: 'pages.certification-start.error-messages.session-not-accessible',
    };

    const FORBIDDEN_ERROR_MESSAGE_KEYS = {
      CANDIDATE_NOT_AUTHORIZED_TO_JOIN_SESSION:
        'pages.certification-start.error-messages.candidate-not-authorized-to-start',
      CANDIDATE_NOT_AUTHORIZED_TO_RESUME_SESSION:
        'pages.certification-start.error-messages.candidate-not-authorized-to-resume',
      CENTER_HABILITATION_ERROR: 'pages.certification-joiner.error-messages.missing-center-habilitation',
    };

    if (ERROR_MESSAGE_KEYS[statusCode]) {
      this.apiErrorMessage = this.intl.t(ERROR_MESSAGE_KEYS[statusCode]);
    } else if (statusCode === '403' && FORBIDDEN_ERROR_MESSAGE_KEYS[errorCode]) {
      this.apiErrorMessage = this.intl.t(FORBIDDEN_ERROR_MESSAGE_KEYS[errorCode]);
    } else {
      this.technicalErrorInformation = `${error.message} ${error.stack}`;
      this.apiErrorMessage = this.intl.t('pages.certification-start.error-messages.generic');
    }
  }

  <template>
    <section class="certification-starter">
      <h1 class="certification-start-page__title">{{t "pages.certification-start.first-title"}}</h1>

      {{#if @model.certificationCandidate.isRegisteredToDoubleCertification}}
        <div class="certification-starter-subscriptions">
          <div class="certification-starter-subscriptions-container">
            <p class="certification-starter-subscriptions-container-title">
              {{t "pages.certification-start.core-and-complementary-subscriptions"}}
            </p>
            <span class="certification-starter-subscriptions-container-items__{{this.eligibilityState}}">
              <PixIcon
                @name="checkCircle"
                @plainIcon={{true}}
                @ariaHidden={{true}}
                class="certification-starter-subscriptions-container-items__{{this.eligibilityState}}-icon"
              />
              {{this.subscriptionLabel}}
            </span>
          </div>
          {{#unless @model.certificationCandidate.isEligibleToDoubleCertification}}
            <PixNotificationAlert @type="warning" @withIcon={{true}}>
              {{t "pages.certification-start.non-eligible-subscription" subscriptionLabel=this.subscriptionLabel}}
            </PixNotificationAlert>
          {{/unless}}
        </div>
      {{/if}}

      <form class="certification-start__form" onSubmit={{this.submit}} autocomplete="off">
        {{#if this.shouldDisplayLanguageSelector}}
          <PixSelect
            @onChange={{this.setLanguage}}
            @value={{this.selectedLanguage}}
            @options={{this.languageOptions}}
            @hideDefaultOption={{true}}
            @iconName="language"
            @isDisabled={{true}}
          >
            <:label>{{t "pages.certification-start.language-selector.label"}}</:label>
            <:default as |language|>{{language.label}}</:default>
          </PixSelect>

          <PixNotificationAlert @withIcon={{true}} @type="error" class="create-attestations__errors">
            <p>{{t "pages.certification-start.language-selector.warning-message"}}</p>
          </PixNotificationAlert>

          <PixCheckbox
            @class="certification-start-form__lang-confirm-checkbox"
            @type="checkbox"
            @variant="modulix"
            @checked={{this.hasCandidateConfirmedLanguage}}
            {{on "change" this.onFormCheckToggle}}
          >
            <:label>
              {{t "pages.certification-start.language-selector.confirmation-label" htmlSafe=true}}
            </:label>
          </PixCheckbox>
        {{/if}}

        <div class="certification-start-form__code">
          <PixLabel class="label" for="certificationStarterSessionCode" @requiredLabel={{t "common.form.mandatory"}}>
            {{t "pages.certification-start.access-code"}}
          </PixLabel>

          <PixCode
            class="input"
            @id="certificationStarterSessionCode"
            @length={{CODE_LENGTH}}
            @value={{this.inputAccessCode}}
            @validationStatus={{this.validationStatus}}
            @errorMessage={{this.validationErrorMessage}}
            {{on "keyup" this.clearErrorMessage}}
            {{on "input" this.handleAccessCodeInput}}
          />
        </div>

        {{#if this.apiErrorMessage}}
          <PixNotificationAlert @type="error" class="certification-start-form__error-message">
            {{this.apiErrorMessage}}
          </PixNotificationAlert>
        {{/if}}
        {{#if this.technicalErrorInformation}}
          <details class="certification-start-page__information">
            <summary>{{t "pages.certification-start.error-messages.unknown.summary-label"}}</summary>
            <p>{{this.technicalErrorInformation}}</p>
          </details>
        {{/if}}

        <PixButton
          @type="submit"
          @isLoading={{this.isFormLoading}}
          class="certification-start-form__submit-button"
          @isDisabled={{this.isSubmitButtonDisabled}}
        >
          {{t "pages.certification-start.actions.submit"}}
        </PixButton>
      </form>

      <div class="certification-start-page__cgu">
        <p>
          {{t "pages.certification-start.cgu.info"}}
        </p>
        <p>
          {{t "pages.certification-start.cgu.contact.info"}}
          <a href="mailto:{{t 'pages.certification-start.cgu.contact.email'}}">{{t
              "pages.certification-start.cgu.contact.email"
            }}</a>.
        </p>
      </div>
    </section>
  </template>
}
