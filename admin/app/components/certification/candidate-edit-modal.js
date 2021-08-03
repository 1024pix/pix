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
    return this.birthInseeCode;
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
    const { firstName, lastName, birthdate, birthplace, sex, birthInseeCode, birthPostalCode, birthCountry } = this.args.candidate;
    this.args.candidate.firstName = this.firstName;
    this.args.candidate.lastName = this.lastName;
    this.args.candidate.birthdate = this.birthdate;
    this.args.candidate.birthplace = this.birthCity;
    this.args.candidate.sex = this.sex;
    this.args.candidate.birthInseeCode = this.birthInseeCode;
    this.args.candidate.birthPostalCode = this.birthPostalCode;
    this.args.candidate.birthCountry = this.birthCountry;
    try {
      await this.args.onFormSubmit();
      this._initForm();
    } catch (_) {
      this.args.candidate.firstName = firstName;
      this.args.candidate.lastName = lastName;
      this.args.candidate.birthdate = birthdate;
      this.args.candidate.birthplace = birthplace;
      this.args.candidate.sex = sex;
      this.args.candidate.birthInseeCode = birthInseeCode;
      this.args.candidate.birthPostalCode = birthPostalCode;
      this.args.candidate.birthCountry = birthCountry;
    }
  }

  @action
  onCancelButtonsClicked() {
    this._initForm();
    this.args.onCancelButtonsClicked();
  }

  @action
  selectBirthCountry(event) {
    this.selectedCountryInseeCode = event.target.value;
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
    this.selectBirthGeoCodeOption(this.args.candidate.birthInseeCode ? INSEE_CODE_OPTION : POSTAL_CODE_OPTION);
    this.selectedCountryInseeCode = this.args.candidate.birthCountry === 'FRANCE' ? FRANCE_INSEE_CODE : this.args.candidate.birthInseeCode;

    this.firstName = this.args.candidate.firstName;
    this.lastName = this.args.candidate.lastName;
    this.birthdate = this.args.candidate.birthdate;
    this.birthCity = this.args.candidate.birthplace;
    this.sex = this.args.candidate.sex;
    this.selectedSex = this.args.candidate.sex;
    this.birthInseeCode = this.args.candidate.birthInseeCode;
    this.birthPostalCode = this.args.candidate.birthPostalCode;
    this.birthCountry = this.args.candidate.birthCountry;
  }

  _isFranceSelected() {
    return this.selectedCountryInseeCode === FRANCE_INSEE_CODE;
  }

  _getCountryName() {
    const country = this.args.countries.find((country) => country.code === this.selectedCountryInseeCode);
    return country.name;
  }
}
