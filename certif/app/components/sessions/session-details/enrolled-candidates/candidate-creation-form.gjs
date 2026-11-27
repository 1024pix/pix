import {
  PixButton,
  PixButtonLink,
  PixCheckbox,
  PixIcon,
  PixInput,
  PixLabel,
  PixRadioButton,
  PixSelect,
  PixTooltip,
} from '@1024pix/nebulix-ember';
import { fn, hash } from '@ember/helper';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';

const FRANCE_INSEE_CODE = '99100';
const INSEE_CODE_OPTION = 'insee';
const POSTAL_CODE_OPTION = 'postal';

export default class CandidateCreationForm extends Component {
  @service currentUser;
  @service intl;
  @service router;

  @tracked selectedBirthGeoCodeOption = INSEE_CODE_OPTION;
  @tracked selectedCountryInseeCode = FRANCE_INSEE_CODE;
  @tracked isLoading = false;
  @tracked selectedBillingMode;
  @tracked selectedSubscriptionType = 'CORE';
  @tracked isAccessibilityCheked = false;
  @tracked hasAttemptedSubmit = false;
  @tracked candidateData;

  constructor() {
    super(...arguments);

    const billingFields = this.shouldDisplayPaymentOptions ? { billingMode: '', prepaymentCode: '' } : {};

    this.candidateData = {
      firstName: '',
      lastName: '',
      birthdate: '',
      birthCity: '',
      birthCountry: 'FRANCE',
      birthPostalCode: '',
      birthInseeCode: '',
      sex: '',
      email: '',
      externalId: '',
      resultRecipientEmail: '',
      extraTimePercentage: '',
      subscription: '',
      accessibilityAdjustmentNeeded: false,
      ...billingFields,
    };
  }

  get complementaryCertificationsHabilitations() {
    return this.currentUser.currentAllowedCertificationCenterAccess?.habilitations;
  }

  get billingMenuPlaceholder() {
    const labelTranslation = this.intl.t('common.actions.choose');
    return `-- ${labelTranslation} --`;
  }

  get isBirthGeoCodeRequired() {
    return this._isFranceSelected();
  }

  get isInseeCodeOptionSelected() {
    return this.selectedBirthGeoCodeOption === INSEE_CODE_OPTION;
  }

  get isPostalCodeOptionSelected() {
    return this.selectedBirthGeoCodeOption === POSTAL_CODE_OPTION;
  }

  get isBirthInseeCodeRequired() {
    if (!this._isFranceSelected()) {
      return false;
    }

    if (this.isInseeCodeOptionSelected) {
      return true;
    }

    return false;
  }

  get isBirthPostalCodeRequired() {
    if (!this._isFranceSelected()) {
      return false;
    }

    if (this.isPostalCodeOptionSelected) {
      return true;
    }

    return false;
  }

  get isBirthCityRequired() {
    if (!this._isFranceSelected()) {
      return true;
    }

    if (this.isPostalCodeOptionSelected) {
      return true;
    }

    return false;
  }

  get isPrepaidBillingMode() {
    return this.selectedBillingMode === 'PREPAID';
  }

  get countryOptions() {
    return this.args.countries?.map((country) => {
      return { label: country.name, value: country.code };
    });
  }

  get shouldDisplayPaymentOptions() {
    return this.currentUser.currentAllowedCertificationCenterAccess.hasBillingMode;
  }

  get billingModeError() {
    if (!this.hasAttemptedSubmit || !this.shouldDisplayPaymentOptions || this.selectedBillingMode) {
      return null;
    }

    return this.intl.t('common.api-error-messages.certification-candidate.CANDIDATE_BILLING_MODE_REQUIRED');
  }

  get subscriptionTypeError() {
    if (!this.hasAttemptedSubmit || this.selectedSubscriptionType) {
      return null;
    }

    return this.intl.t('common.api-error-messages.certification-candidate.CANDIDATE_BILLING_MODE_REQUIRED');
  }

  get billingModeOptions() {
    const freeLabel = this.intl.t('common.labels.billing-mode.free');
    const paidLabel = this.intl.t('common.labels.billing-mode.paid');
    const prepaidLabel = this.intl.t('common.labels.billing-mode.prepaid');

    return [
      { label: freeLabel, value: 'FREE' },
      { label: paidLabel, value: 'PAID' },
      { label: prepaidLabel, value: 'PREPAID' },
    ];
  }

  get subscriptionTypeOptions() {
    const options = this.currentUser.currentAllowedCertificationCenterAccess?.habilitations?.map((scope) => {
      const label = this.intl.t(`common.forms.certification-labels.subscriptions.${scope.key}`);
      return { label, value: scope.key };
    });
    return [...options, { label: this.intl.t(`common.forms.certification-labels.subscriptions.CORE`), value: 'CORE' }];
  }

  @action
  subscritionTypeChange(value) {
    this.selectedSubscriptionType = value;
    this.updateField('subscription', value);
  }

  @action
  toggleAccessibilityOption() {
    this.isAccessibilityCheked = !this.isAccessibilityCheked;
    this.updateField('accessibilityAdjustmentNeeded', this.isAccessibilityCheked);
  }

  @action
  updateFieldFromEvent(field, event) {
    this.updateField(field, event.target.value);
  }

  @action
  updateField(field, value) {
    this.candidateData = { ...this.candidateData, [field]: value };
  }

  @action
  selectBirthGeoCodeOption(option) {
    this.selectedBirthGeoCodeOption = option;

    if (this.isInseeCodeOptionSelected) {
      this.updateField('birthCity', '');
      this.updateField('birthPostalCode', '');
    } else if (this.isPostalCodeOptionSelected) {
      this.updateField('birthInseeCode', '');
    }
  }

  @action
  updateBillingMode(billingMode) {
    this.selectedBillingMode = billingMode;
    this.updateField('billingMode', billingMode);

    if (!this.isPrepaidBillingMode) {
      this.updateField('prepaymentCode', '');
    }
  }

  @action
  selectBirthCountry(option) {
    this.selectedCountryInseeCode = option;
    this.updateField('birthCountry', this._getCountryName());
    this.updateField('birthCity', '');
    this.updateField('birthPostalCode', '');

    if (this._isFranceSelected()) {
      this.updateField('birthInseeCode', '');
    } else {
      this.selectBirthGeoCodeOption(INSEE_CODE_OPTION);
      this.updateField('birthInseeCode', '99');
    }
  }

  @action
  async onFormSubmit(event) {
    event.preventDefault();
    this.hasAttemptedSubmit = true;

    if (this.billingModeError) {
      return;
    }

    if (this.subscriptionTypeError) {
      return;
    }

    this.isLoading = true;

    try {
      const result = await this.args.saveCandidate(this.candidateData);

      if (result) {
        this.router.transitionTo('authenticated.sessions.details.certification-candidates', this.args.sessionId);
      }
    } finally {
      this.isLoading = false;
    }
  }

  _isFranceSelected() {
    return this.selectedCountryInseeCode === FRANCE_INSEE_CODE;
  }

  _getCountryName() {
    const country = this.args.countries.find((country) => country.code === this.selectedCountryInseeCode);
    return country.name;
  }

  <template>
    <PixButtonLink
      @route='authenticated.sessions.details.certification-candidates'
      @model={{@sessionId}}
      @variant='tertiary'
      @iconBefore='arrowLeft'
      class='previous-button'
    >
      {{t 'pages.sessions.detail.candidates.add-form.actions.back'}}
    </PixButtonLink>

    <h1 class='page-title'>{{t 'pages.sessions.detail.candidates.add-form.title'}}</h1>

    <form class='new-candidate-form' {{on 'submit' this.onFormSubmit}}>
      <p class='new-candidate-form__required-fields-mention'>
        {{t 'common.forms.mandatory-fields' htmlSafe=true}}
      </p>

      <fieldset class='new-candidate-form__fields-group'>
        <h2 class='new-candidate-form__fields-group__title'>
          {{t 'common.forms.section-labels.personal-data'}}
        </h2>
        <PixInput
          @id='lastname'
          {{on 'input' (fn this.updateFieldFromEvent 'lastName')}}
          required
          aria-required={{true}}
          autocomplete='off'
          @requiredLabel={{t 'common.forms.required'}}
        >
          <:label>{{t 'common.labels.candidate.birth-name'}}</:label>
        </PixInput>
        <PixInput
          @id='firstname'
          {{on 'input' (fn this.updateFieldFromEvent 'firstName')}}
          required
          aria-required={{true}}
          autocomplete='off'
          @requiredLabel={{t 'common.forms.required'}}
        >
          <:label>{{t 'common.labels.candidate.firstname'}}</:label>
        </PixInput>

        <fieldset class='new-candidate-form__fields-group--inline'>
          <legend class='label'>
            <PixLabel @requiredLabel={{t 'common.forms.required'}}>
              {{t 'common.labels.candidate.gender.title'}}
            </PixLabel>
          </legend>
          <PixRadioButton @value='F' name='sex' required {{on 'change' (fn this.updateFieldFromEvent 'sex')}}>
            <:label>{{t 'common.labels.candidate.gender.woman'}}</:label>
          </PixRadioButton>
          <PixRadioButton @value='M' name='sex' required {{on 'change' (fn this.updateFieldFromEvent 'sex')}}>
            <:label>{{t 'common.labels.candidate.gender.man'}}</:label>
          </PixRadioButton>
        </fieldset>

        <PixLabel @requiredLabel={{t 'common.forms.required'}} for='birth-date'>
          {{t 'common.labels.candidate.birth-date'}}
        </PixLabel>
        <input
          id='birth-date'
          type='date'
          placeholder={{t 'common.labels.candidate.birth-date-example'}}
          name='birth-date'
          class='input input--small'
          {{on 'change' (fn this.updateFieldFromEvent 'birthdate')}}
          required
          autocomplete='off'
        />

        <PixSelect
          @id='birth-country'
          @options={{this.countryOptions}}
          @onChange={{this.selectBirthCountry}}
          @value={{this.selectedCountryInseeCode}}
          @hideDefaultOption={{true}}
          @texts={{hash requiredLabel=(t 'common.forms.required')}}
          required
        >
          <:label>{{t 'common.labels.candidate.birth-country'}}</:label>
        </PixSelect>

        {{#if this.isBirthGeoCodeRequired}}
          <fieldset class='new-candidate-form__fields-group--inline'>
            <legend class='label'>
              <PixLabel @requiredLabel={{t 'common.forms.required'}}>
                {{t 'common.labels.candidate.birth-geographical-code'}}
              </PixLabel>
            </legend>
            <PixRadioButton
              name='birth-geo-code-option'
              @value='insee'
              checked='checked'
              {{on 'change' (fn this.selectBirthGeoCodeOption 'insee')}}
              required
            >
              <:label>{{t 'common.labels.candidate.insee-code'}}</:label>
            </PixRadioButton>
            <PixRadioButton
              name='birth-geo-code-option'
              @value='postal'
              {{on 'change' (fn this.selectBirthGeoCodeOption 'postal')}}
              required
            >
              <:label>{{t 'common.labels.candidate.postcode'}}</:label>
            </PixRadioButton>
          </fieldset>
        {{/if}}

        {{#if this.isBirthInseeCodeRequired}}
          <PixInput
            @id='birth-insee-code'
            @value={{this.candidateData.birthInseeCode}}
            {{on 'input' (fn this.updateFieldFromEvent 'birthInseeCode')}}
            required
            aria-required={{true}}
            autocomplete='off'
            maxlength='5'
            @requiredLabel={{t 'common.forms.required'}}
          >
            <:label>{{t 'common.labels.candidate.birth-city-insee-code'}}</:label>
          </PixInput>
        {{/if}}

        {{#if this.isBirthPostalCodeRequired}}
          <PixInput
            @id='birth-postal-code'
            @value={{this.candidateData.birthPostalCode}}
            {{on 'input' (fn this.updateFieldFromEvent 'birthPostalCode')}}
            required
            aria-required={{true}}
            autocomplete='off'
            maxlength='5'
            @requiredLabel={{t 'common.forms.required'}}
          >
            <:label>{{t 'common.labels.candidate.birth-city-postcode'}}</:label>
          </PixInput>
        {{/if}}

        {{#if this.isBirthCityRequired}}
          <PixInput
            @id='birth-city'
            @value={{this.candidateData.birthCity}}
            {{on 'input' (fn this.updateFieldFromEvent 'birthCity')}}
            required
            aria-required={{true}}
            autocomplete='off'
            @requiredLabel={{t 'common.forms.required'}}
          >
            <:label>{{t 'common.labels.candidate.birth-city'}}</:label>
          </PixInput>
        {{/if}}

        <PixInput @id='external-id' {{on 'input' (fn this.updateFieldFromEvent 'externalId')}} autocomplete='off'>
          <:label>{{t 'common.forms.certification-labels.local-id'}}</:label>
        </PixInput>

      </fieldset>

      <fieldset class='new-candidate-form__fields-group'>
        <h2 class='new-candidate-form__fields-group__title'>
          {{t 'common.forms.section-labels.accessibility'}}
        </h2>
        <PixInput
          @id='extra-time-percentage'
          {{on 'input' (fn this.updateFieldFromEvent 'extraTimePercentage')}}
          autocomplete='off'
        >
          <:label>{{t 'common.forms.certification-labels.extratime-percentage'}}</:label>
        </PixInput>

        <PixCheckbox
          @label='Aménagement d’accéssibilité numérique'
          @subLabel="L'aménagement consiste à retirer les questions non accessibles ainsi qu'à permettre l'oralisation de l'énoncé des épreuves."
          @checked={{this.isAccessibilityCheked}}
          {{on 'click' this.toggleAccessibilityOption}}
        >
          <:label>{{t 'common.forms.certification-labels.accessibility-adjustment-needed'}}</:label>
        </PixCheckbox>
      </fieldset>

      <fieldset class='new-candidate-form__fields-group'>
        <h2 class='new-candidate-form__fields-group__title'>
          {{t 'common.forms.section-labels.accessibility'}}
        </h2>
        <PixInput
          @id='result-recipient-email'
          {{on 'input' (fn this.updateFieldFromEvent 'resultRecipientEmail')}}
          type='email'
          autocomplete='nope'
          @subLabel={{t 'pages.sessions.detail.candidates.add-form.info-panel' htmlSafe=true}}
        >
          <:label>{{t 'common.forms.certification-labels.email-results'}}</:label>
        </PixInput>

        <PixInput
          @id='email'
          {{on 'input' (fn this.updateFieldFromEvent 'email')}}
          type='email'
          autocomplete='nope'
          @subLabel={{t 'pages.sessions.detail.candidates.add-form.email-convocation-info' htmlSafe=true}}
        >
          <:label>{{t 'common.forms.certification-labels.email-convocation'}}</:label>
        </PixInput>
      </fieldset>

      <fieldset class='new-candidate-form__fields-group'>
        <h2 class='new-candidate-form__fields-group__title'>
          {{t 'common.forms.section-labels.billings'}}
        </h2>
        {{#if this.shouldDisplayPaymentOptions}}
          <PixSelect
            @id='billing-mode'
            @options={{this.billingModeOptions}}
            @onChange={{this.updateBillingMode}}
            @value={{this.selectedBillingMode}}
            @placeholder={{this.billingMenuPlaceholder}}
            @hideDefaultOption={{true}}
            @texts={{hash requiredLabel=(t 'common.forms.required')}}
            @errorMessage={{this.billingModeError}}
            @validationStatus={{if this.billingModeError 'error'}}
          >
            <:label>{{t 'common.forms.certification-labels.pricing'}}</:label>
          </PixSelect>

          {{#if this.isPrepaidBillingMode}}
            <div>
              <div class='new-candidate-form__fields-group__tooltip-label'>
                <label for='prepayment-code' class='label'>
                  {{t 'common.forms.certification-labels.prepayment-code'}}
                </label>
                <PixTooltip @id='tooltip-prepayment-code' @position='left'>
                  <:triggerElement>
                    <PixIcon
                      @plainIcon={{true}}
                      @name='info'
                      @ariaHidden={{true}}
                      aria-label={{t 'pages.sessions.detail.candidates.add-form.prepayment-information'}}
                      tabindex='0'
                      aria-describedby='tooltip-prepayment-code'
                      class='new-candidate-tooltip__icon'
                    />
                  </:triggerElement>
                  <:tooltip>
                    {{t 'pages.sessions.detail.candidates.add-form.prepayment-tooltip' htmlSafe=true}}
                  </:tooltip>
                </PixTooltip>
              </div>
              <PixInput
                @id='prepayment-code'
                type='text'
                {{on 'input' (fn this.updateFieldFromEvent 'prepaymentCode')}}
                autocomplete='off'
              />
            </div>
          {{/if}}
        {{/if}}

        {{#if this.complementaryCertificationsHabilitations.length}}
          <PixSelect
            @id='subscription-type'
            @options={{this.subscriptionTypeOptions}}
            @onChange={{this.subscritionTypeChange}}
            @value={{this.selectedSubscriptionType}}
            @hideDefaultOption={{true}}
            @texts={{hash requiredLabel=(t 'common.forms.required')}}
            @errorMessage={{this.subscriptionTypeError}}
            @validationStatus={{if this.subscriptionTypeError 'error'}}
          >
            <:label>{{t 'common.forms.certification-labels.selected-subscriptions'}}</:label>
          </PixSelect>
        {{/if}}
      </fieldset>

      <div class='new-candidate-form__actions'>
        <PixButtonLink
          @route='authenticated.sessions.details.certification-candidates'
          @model={{@sessionId}}
          @variant='secondary'
          @isBorderVisible='true'
        >
          {{t 'common.actions.cancel'}}
        </PixButtonLink>

        <PixButton @type='submit' @isLoading={{this.isLoading}} @isDisabled={{this.isLoading}}>
          {{t 'pages.sessions.detail.candidates.add-form.actions.enrol-the-candidate'}}
        </PixButton>
      </div>
    </form>
  </template>
}
