import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

const FRANCE_INSEE_CODE = '99100';
const INSEE_CODE_OPTION = 'insee';
const POSTAL_CODE_OPTION = 'postal';

export default class CandidateEditModal extends Component {
  @tracked firstName;
  @tracked lastName;
  @tracked birthdate;
  @tracked birthCity;
  @tracked sex;
  @tracked birthInseeCode;
  @tracked birthPostalCode;
  @tracked birthCountry;

  @tracked selectedBirthGeoCodeOption;
  @tracked selectedCountryInseeCode;

  constructor() {
    super(...arguments);
    this._initForm();
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

    return this.isInseeCodeOptionSelected;
  }

  get isBirthPostalCodeRequired() {
    if (!this._isFranceSelected()) {
      return false;
    }

    return this.isPostalCodeOptionSelected;
  }

  get isBirthCityRequired() {
    if (!this._isFranceSelected()) {
      return true;
    }

    return this.isPostalCodeOptionSelected;
  }

  get countryOptions() {
    return this.args.countries.map((country) => {
      return { label: country.name, value: country.code };
    });
  }

  get selectedCountryOption() {
    if (this.birthCountry === 'FRANCE') return FRANCE_INSEE_CODE;
    return this.selectedCountryInseeCode;
  }

  @action
  updateSexValue(sex) {
    this.sex = sex;
  }

  @action
  selectBirthGeoCodeOption(option) {
    this.selectedBirthGeoCodeOption = option;

    if (this.isInseeCodeOptionSelected) {
      this.birthCity = '';
      this.birthPostalCode = '';
    } else if (this.isPostalCodeOptionSelected) {
      this.birthInseeCode = '';
    }
  }

  @action
  updateBirthdate(_, lastSelectedDateFormatted) {
    this.birthdate = lastSelectedDateFormatted;
  }

  @action
  async onFormSubmit(event) {
    event.preventDefault();
    const informationBeforeUpdate = this.args.candidate.getInformation();
    this.args.candidate.updateInformation({
      firstName: this.firstName,
      lastName: this.lastName,
      birthdate: this.birthdate,
      birthplace: this.birthCity,
      sex: this.sex,
      birthInseeCode: this.birthInseeCode,
      birthPostalCode: this.birthPostalCode,
      birthCountry: this.birthCountry,
    });
    try {
      await this.args.onFormSubmit();
      this._initForm();
    } catch (_) {
      this.args.candidate.updateInformation(informationBeforeUpdate);
    }
  }

  @action
  onCancelButtonsClicked() {
    this._initForm();
    this.args.onCancelButtonsClicked();
  }

  @action
  selectBirthCountry(value) {
    this.selectedCountryInseeCode = value;
    this.birthCountry = this._getCountryName();
    this.birthCity = '';
    this.birthPostalCode = '';
    if (this._isFranceSelected()) {
      this.birthInseeCode = '';
    } else {
      this.selectBirthGeoCodeOption(INSEE_CODE_OPTION);
      this.birthInseeCode = '99';
    }
  }

  focus(element) {
    element.focus();
  }

  _initForm() {
    const candidate = this.args.candidate;
    this.firstName = candidate.firstName;
    this.lastName = candidate.lastName;
    this.birthdate = candidate.birthdate;
    this.sex = candidate.sex;
    this.birthCountry = candidate.birthCountry;
    this._initBirthInformation(candidate);
  }

  _initBirthInformation(candidate) {
    this.selectedBirthGeoCodeOption = candidate.birthInseeCode ? INSEE_CODE_OPTION : POSTAL_CODE_OPTION;
    this.selectedCountryInseeCode = candidate.wasBornInFrance() ? FRANCE_INSEE_CODE : candidate.birthInseeCode;

    if (candidate.wasBornInFrance() && this.isInseeCodeOptionSelected) {
      this.birthCity = '';
    } else {
      this.birthCity = candidate.birthplace;
    }

    if (this.isPostalCodeOptionSelected) {
      this.birthInseeCode = '';
    } else if (this._isFranceSelected()) {
      this.birthInseeCode = candidate.birthInseeCode;
    } else {
      this.birthInseeCode = '99';
    }

    if (this.isPostalCodeOptionSelected) {
      this.birthPostalCode = candidate.birthPostalCode;
    } else {
      this.birthPostalCode = '';
    }
  }

  _isFranceSelected() {
    return this.selectedCountryInseeCode === FRANCE_INSEE_CODE;
  }

  _getCountryName() {
    const country = this.args.countries.find((country) => country.code === this.selectedCountryInseeCode);
    return country.name;
  }
}
