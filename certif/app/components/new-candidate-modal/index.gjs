import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixInput from '@1024pix/pix-ui/components/pix-input';
import PixMessage from '@1024pix/pix-ui/components/pix-message';
import PixModal from '@1024pix/pix-ui/components/pix-modal';
import PixRadioButton from '@1024pix/pix-ui/components/pix-radio-button';
import PixSelect from '@1024pix/pix-ui/components/pix-select';
import PixTooltip from '@1024pix/pix-ui/components/pix-tooltip';
import { fn } from '@ember/helper';
import { on } from '@ember/modifier';
import { service } from '@ember/service';
import FaIcon from '@fortawesome/ember-fontawesome/components/fa-icon';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import inputmask from 'ember-inputmask5/modifiers/inputmask';
import { t } from 'ember-intl';

import ComplementaryList from './complementary-list';
import ComplementaryWithReferential from './complementary-with-referential';

const FRANCE_INSEE_CODE = '99100';
const INSEE_CODE_OPTION = 'insee';
const POSTAL_CODE_OPTION = 'postal';

export default class NewCandidateModal extends Component {
  @service currentUser;
  @service intl;

  @tracked selectedBirthGeoCodeOption = INSEE_CODE_OPTION;
  @tracked selectedCountryInseeCode = FRANCE_INSEE_CODE;

  @tracked isLoading = false;
  @tracked selectedComplementaryCertification;
  @tracked selectedBillingMode;

  // GETTERS
  get complementaryCertificationsHabilitations() {
    return this.currentUser.currentAllowedCertificationCenterAccess?.habilitations;
  }

  get isComplementaryAlonePilot() {
    return !!this.currentUser.currentAllowedCertificationCenterAccess?.isComplementaryAlonePilot;
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

  get countryOptions() {
    return this.args.countries?.map((country) => {
      return { label: country.name, value: country.code };
    });
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

  get couldHaveComplementaryCertificationOnly() {
    return this._hasComplementaryReferential() && this.isComplementaryAlonePilot;
  }

  // ACTIONS
  closeModal = () => {
    this.args.closeModal();
    document.getElementById('new-candidate-form').reset();
    this.selectedComplementaryCertification = undefined;
    this.selectedBillingMode = undefined;
  };

  selectBirthGeoCodeOption = (option) => {
    this.selectedBirthGeoCodeOption = option;

    if (this.isInseeCodeOptionSelected) {
      this.args.updateCandidateDataFromValue(this.args.candidateData, 'birthCity', '');
      this.args.updateCandidateDataFromValue(this.args.candidateData, 'birthPostalCode', '');
    } else if (this.isPostalCodeOptionSelected) {
      this.args.updateCandidateDataFromValue(this.args.candidateData, 'birthInseeCode', '');
    }
  };

  saveApi = ({ inputmask }) => {
    this.inputmask = inputmask;
  };

  updateBirthdate = () => {
    const birthdate = this.inputmask.unmaskedvalue();
    this.args.updateCandidateDataFromValue(this.args.candidateData, 'birthdate', birthdate);
  };

  updateBillingMode = (billingMode) => {
    this.selectedBillingMode = billingMode;
    this.args.updateCandidateDataFromValue(this.args.candidateData, 'billingMode', billingMode);
  };

  selectBirthCountry = (option) => {
    this.selectedCountryInseeCode = option;
    const countryName = this._getCountryName();
    this.args.updateCandidateDataFromValue(this.args.candidateData, 'birthCountry', countryName);
    this.args.updateCandidateDataFromValue(this.args.candidateData, 'birthCity', '');
    this.args.updateCandidateDataFromValue(this.args.candidateData, 'birthPostalCode', '');
    if (this._isFranceSelected()) {
      this.args.updateCandidateDataFromValue(this.args.candidateData, 'birthInseeCode', '');
    } else {
      this.selectBirthGeoCodeOption(INSEE_CODE_OPTION);
      this.args.updateCandidateDataFromValue(this.args.candidateData, 'birthInseeCode', '99');
    }
  };

  updateComplementaryCertification = (complementaryCertification) => {
    if (complementaryCertification?.key) {
      // The complementary certification parameter is passed by reference to the certification candidate
      // Creating a copy of this complementary certification prevents the original object to be mutated in the CertificationCandidateSerializer file
      // when the API call is being done and therefore prevents the hasComplementaryReferential property to be removed from the object
      // TODO Send only the id of the complementary certification
      const copiedComplementaryCertification = { ...complementaryCertification };
      this.selectedComplementaryCertification = copiedComplementaryCertification;
      this.args.candidateData.complementaryCertification = copiedComplementaryCertification;
    } else {
      this.selectedComplementaryCertification = undefined;
      this.args.candidateData.complementaryCertification = undefined;
    }
  };

  onFormSubmit = async (event) => {
    event.preventDefault();
    this.isLoading = true;

    try {
      const result = await this.args.saveCandidate(this.args.candidateData);

      if (result) {
        this._resetForm();
      }
    } finally {
      this.isLoading = false;
    }
  };

  // PRIVATE METHODS
  _isFranceSelected() {
    return this.selectedCountryInseeCode === FRANCE_INSEE_CODE;
  }

  _getCountryName() {
    const country = this.args.countries.find((country) => country.code === this.selectedCountryInseeCode);
    return country.name;
  }

  _resetForm() {
    document.getElementById('new-candidate-form').reset();
    this.selectedCountryInseeCode = FRANCE_INSEE_CODE;
    this.selectedBirthGeoCodeOption = INSEE_CODE_OPTION;
    this.selectedComplementaryCertification = undefined;
  }

  _hasComplementaryReferential() {
    return !!this.selectedComplementaryCertification?.hasComplementaryReferential;
  }

  <template>
    <PixModal
      @title={{t 'pages.sessions.detail.candidates.detail-modal.title'}}
      @onCloseButtonClick={{this.closeModal}}
      class='new-candidate-modal'
      @showModal={{@showModal}}
    >
      <:content>
        <form id='new-candidate-form' class='new-candidate-modal__form' {{on 'submit' this.onFormSubmit}}>

          <p class='new-candidate-modal-form__required-fields-mention'>
            {{t 'common.forms.mandatory-fields' htmlSafe=true}}
          </p>

          <div class='new-candidate-modal-form__field'>
            <PixInput
              @id='last-name'
              {{on 'input' (fn @updateCandidateData @candidateData 'lastName')}}
              required
              aria-required={{true}}
              autocomplete='off'
              @requiredLabel={{t 'common.forms.required'}}
            >
              <:label>{{t 'common.labels.candidate.birth-name'}}</:label>
            </PixInput>
            <PixInput
              @id='first-name'
              {{on 'input' (fn @updateCandidateData @candidateData 'firstName')}}
              required
              aria-required={{true}}
              autocomplete='off'
              @requiredLabel={{t 'common.forms.required'}}
            >
              <:label>{{t 'common.labels.candidate.firstname'}}</:label>
            </PixInput>
          </div>

          <div class='new-candidate-modal-form__field'>
            <fieldset>
              <legend class='label'>
                <abbr title={{t 'common.forms.required'}} class='mandatory-mark' aria-hidden='true'>*</abbr>
                {{t 'common.labels.candidate.gender.title'}}
              </legend>
              <div class='radio-button-container'>
                <PixRadioButton
                  @value='F'
                  name='sex'
                  required
                  {{on 'change' (fn @updateCandidateData @candidateData 'sex')}}
                >
                  <:label>{{t 'common.labels.candidate.gender.woman'}}</:label>
                </PixRadioButton>
                <PixRadioButton
                  @value='M'
                  name='sex'
                  required
                  {{on 'change' (fn @updateCandidateData @candidateData 'sex')}}
                >
                  <:label>{{t 'common.labels.candidate.gender.man'}}</:label>
                </PixRadioButton>
              </div>
            </fieldset>
          </div>

          <div class='new-candidate-modal-form__field'>
            <PixInput
              @id='birth-name'
              placeholder={{t 'common.labels.candidate.birth-date-example'}}
              class='ember-text-field ember-view input'
              {{on 'change' this.updateBirthdate}}
              {{inputmask
                alias='datetime'
                inputFormat='dd/mm/yyyy'
                outputFormat='yyyy-mm-dd'
                placeholder='_'
                registerAPI=this.saveApi
              }}
              required
              aria-required={{true}}
              autocomplete='off'
              @requiredLabel={{t 'common.forms.required'}}
            >
              <:label>{{t 'common.labels.candidate.birth-date'}}</:label>
            </PixInput>
          </div>

          <div class='new-candidate-modal-form__field'>
            <PixSelect
              @id='birth-country'
              @options={{this.countryOptions}}
              @onChange={{this.selectBirthCountry}}
              @value={{this.selectedCountryInseeCode}}
              @hideDefaultOption={{true}}
              @requiredLabel={{t 'common.forms.required'}}
              required
            >
              <:label>{{t 'common.labels.candidate.birth-country'}}</:label>
            </PixSelect>
          </div>

          {{#if this.isBirthGeoCodeRequired}}
            <div class='new-candidate-modal-form__field'>
              <fieldset>
                <legend class='label'>
                  <abbr title={{t 'common.forms.required'}} class='mandatory-mark' aria-hidden='true'>*</abbr>
                  {{t 'common.labels.candidate.birth-geographical-code'}}
                </legend>
                <div class='radio-button-container'>
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
                </div>
              </fieldset>
            </div>
          {{/if}}

          {{#if this.isBirthInseeCodeRequired}}
            <div class='new-candidate-modal-form__field'>
              <PixInput
                @id='birth-insee-code'
                {{on 'input' (fn @updateCandidateData @candidateData 'birthInseeCode')}}
                required
                aria-required={{true}}
                autocomplete='off'
                maxlength='5'
                @requiredLabel={{t 'common.forms.required'}}
              >
                <:label>{{t 'common.labels.candidate.birth-city-insee-code'}}</:label>
              </PixInput>
            </div>
          {{/if}}

          {{#if this.isBirthPostalCodeRequired}}
            <div class='new-candidate-modal-form__field'>
              <PixInput
                @id='birth-postal-code'
                {{on 'input' (fn @updateCandidateData @candidateData 'birthPostalCode')}}
                required
                aria-required={{true}}
                autocomplete='off'
                maxlength='5'
                @requiredLabel={{t 'common.forms.required'}}
              >
                <:label>{{t 'common.labels.candidate.birth-city-postcode'}}</:label>
              </PixInput>
            </div>
          {{/if}}

          {{#if this.isBirthCityRequired}}
            <div class='new-candidate-modal-form__field'>
              <PixInput
                @id='birth-city'
                {{on 'input' (fn @updateCandidateData @candidateData 'birthCity')}}
                required
                aria-required={{true}}
                autocomplete='off'
                @requiredLabel={{t 'common.forms.required'}}
              >
                <:label>{{t 'common.labels.candidate.birth-city'}}</:label>
              </PixInput>
            </div>
          {{/if}}

          <div class='new-candidate-modal-form__field'>
            <PixInput
              @id='external-id'
              {{on 'input' (fn @updateCandidateData @candidateData 'externalId')}}
              autocomplete='off'
            >
              <:label>{{t 'common.forms.certification-labels.external-id'}}</:label>
            </PixInput>
          </div>

          <div class='new-candidate-modal-form__field'>
            <PixInput
              @id='extra-time-percentage'
              class='input {{if this.validation.email.hasError "input--error"}}'
              {{on 'input' (fn @updateCandidateData @candidateData 'extraTimePercentage')}}
              autocomplete='off'
            >
              <:label>{{t 'common.forms.certification-labels.extratime-percentage'}}</:label>
            </PixInput>
          </div>

          <div class='new-candidate-modal-form__field'>
            <PixInput
              @id='result-recipient-email'
              {{on 'input' (fn @updateCandidateData @candidateData 'resultRecipientEmail')}}
              type='email'
              autocomplete='off'
            >
              <:label>{{t 'common.forms.certification-labels.email-results'}}</:label>
            </PixInput>
          </div>

          <PixMessage class='new-candidate-modal-form__info-panel' @withIcon={{true}}>
            {{t 'pages.sessions.detail.candidates.add-modal.info-panel' htmlSafe=true}}
          </PixMessage>

          <div class='new-candidate-modal-form__field'>
            <PixInput
              @id='email'
              {{on 'input' (fn @updateCandidateData @candidateData 'email')}}
              type='email'
              autocomplete='off'
            >
              <:label>{{t 'common.forms.certification-labels.email-convocation'}}</:label>
            </PixInput>
          </div>

          {{#if @shouldDisplayPaymentOptions}}
            <div class='new-candidate-modal-form__field'>
              <PixSelect
                @id='billing-mode'
                @options={{this.billingModeOptions}}
                @onChange={{this.updateBillingMode}}
                @value={{this.selectedBillingMode}}
                @placeholder={{this.billingMenuPlaceholder}}
                @hideDefaultOption={{true}}
                @requiredLabel={{t 'common.forms.required'}}
              >
                <:label>{{t 'common.forms.certification-labels.pricing'}}</:label>
              </PixSelect>

              <div class='new-candidate-modal-form__tooltip'>
                <label for='prepayment-code' class='label'>
                  {{t 'common.forms.certification-labels.prepayment-code'}}
                </label>
                <PixTooltip @id='tooltip-prepayment-code' @position='left'>
                  <:triggerElement>
                    <FaIcon
                      @icon='info-circle'
                      tabindex='0'
                      aria-describedby='tooltip-prepayment-code'
                      aria-label={{t 'pages.sessions.detail.candidates.add-modal.prepayment-information'}}
                    />
                  </:triggerElement>
                  <:tooltip>
                    {{t 'pages.sessions.detail.candidates.add-modal.prepayment-tooltip' htmlSafe=true}}
                  </:tooltip>
                </PixTooltip>

                <PixInput
                  @id='prepayment-code'
                  type='text'
                  {{on 'input' (fn @updateCandidateData @candidateData 'prepaymentCode')}}
                  autocomplete='off'
                />
              </div>
            </div>
          {{/if}}

          {{#if this.complementaryCertificationsHabilitations.length}}
            <ComplementaryList
              @complementaryCertificationsHabilitations={{this.complementaryCertificationsHabilitations}}
              @updateComplementaryCertification={{this.updateComplementaryCertification}}
            />
            {{#if this.couldHaveComplementaryCertificationOnly}}
              <ComplementaryWithReferential />
            {{/if}}
          {{/if}}
        </form>
      </:content>
      <:footer>
        <PixButton
          aria-label={{t 'pages.sessions.detail.candidates.add-modal.actions.close-extra-information'}}
          @triggerAction={{this.closeModal}}
          @variant='secondary'
          @isBorderVisible='true'
        >
          {{t 'common.actions.close'}}
        </PixButton>
        <PixButton
          @type='submit'
          @isLoading={{this.isLoading}}
          @isDisabled={{this.isLoading}}
          form='new-candidate-form'
        >
          {{t 'pages.sessions.detail.candidates.add-modal.actions.enrol-the-candidate'}}
        </PixButton>
      </:footer>
    </PixModal>
  </template>
}
