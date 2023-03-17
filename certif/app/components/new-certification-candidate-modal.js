import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

const FRANCE_INSEE_CODE = '99100';
const INSEE_CODE_OPTION = 'insee';
const POSTAL_CODE_OPTION = 'postal';

export default class NewCertificationCandidateModal extends Component {
  @service currentUser;
  @service intl;

  @tracked selectedBirthGeoCodeOption = INSEE_CODE_OPTION;
  @tracked selectedCountryInseeCode = FRANCE_INSEE_CODE;
  @tracked maskedBirthdate;

  @tracked isLoading = false;

  focus(element) {
    element.focus();
  }

  get complementaryCertifications() {
    return this.currentUser.currentAllowedCertificationCenterAccess?.habilitations;
  }

  get billingMenuPlaceholder() {
    const labelTranslation = this.intl.t('common.actions.choose');
    return `-- ${labelTranslation} --`;
  }

  @action
  selectBirthGeoCodeOption(option) {
    this.selectedBirthGeoCodeOption = option;

    if (this.isInseeCodeOptionSelected) {
      this.args.updateCandidateDataFromValue(this.args.candidateData, 'birthCity', '');
      this.args.updateCandidateDataFromValue(this.args.candidateData, 'birthPostalCode', '');
    } else if (this.isPostalCodeOptionSelected) {
      this.args.updateCandidateDataFromValue(this.args.candidateData, 'birthInseeCode', '');
    }
  }

  @action
  updateBirthdate(_, masked) {
    this.maskedBirthdate = masked;
    this.args.updateCandidateDataFromValue(this.args.candidateData, 'birthdate', this._formatDate(masked));
  }

  @action
  selectBirthCountry(option) {
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
  }

  @action
  updateComplementaryCertification(complementaryCertification) {
    this.args.candidateData.complementaryCertifications = [];

    const complementaryCertifications = this.args.candidateData.complementaryCertifications;

    if (complementaryCertification?.target?.value !== 'none') {
      complementaryCertifications.addObject(complementaryCertification);
    }
  }

  @action
  async onFormSubmit(event) {
    event.preventDefault();
    this.isLoading = true;
    try {
      await this.args.saveCandidate(this.args.candidateData);
    } finally {
      this.isLoading = false;
    }
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
    const freeLabel = this.intl.t('common.forms.certification-labels.billing-mode.free');
    const paidLabel = this.intl.t('common.forms.certification-labels.billing-mode.paid');
    const prepaidLabel = this.intl.t('common.forms.certification-labels.billing-mode.prepaid');

    return [
      { label: freeLabel, value: 'FREE' },
      { label: paidLabel, value: 'PAID' },
      { label: prepaidLabel, value: 'PREPAID' },
    ];
  }

  get query() {
    return {
      inputFormat: 'dd/mm/yyyy',
      outputFormat: 'dd/mm/yyyy',
    };
  }

  _isFranceSelected() {
    return this.selectedCountryInseeCode === FRANCE_INSEE_CODE;
  }

  _formatDate(date) {
    const [day, month, year] = date.split('/');
    return `${year}-${month}-${day}`;
  }

  _getCountryName() {
    const country = this.args.countries.find((country) => country.code === this.selectedCountryInseeCode);
    return country.name;
  }
}
