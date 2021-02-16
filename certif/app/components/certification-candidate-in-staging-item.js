/* eslint-disable ember/no-computed-properties-in-native-classes*/

import Component from '@glimmer/component';
import { action } from '@ember/object';
import { computed } from '@ember/object';
import { tracked } from '@glimmer/tracking';

const firstOf20thCentury = -2206310961000;

export default class CertificationCandidateInStagingItem extends Component {

  birthProvinceCodePattern = '^[0-9][A,a,B,b,0-9][0-9]?$'

  @tracked
  lastNameFocused = false;

  @tracked
  firstNameFocused = false;

  @tracked
  birthdateFocused = false;

  @tracked
  birthCityFocused = false;

  @tracked
  maskedBirthdate = undefined;

  @tracked
  birthProvinceCodeFocused = false;

  @tracked
  birthCountryFocused = false;

  @computed(
    'args.candidateData.{birthCity,birthCountry,birthProvinceCode,birthdate,firstName,lastName}', 'birthProvinceCodePattern', 'isValidBirthdate',
  )
  get isDisabled() {
    return !(this.args.candidateData.lastName
      && this.args.candidateData.firstName
      && this.isValidBirthdate
      && this.args.candidateData.birthCity
      && new RegExp(this.birthProvinceCodePattern).test(this.args.candidateData.birthProvinceCode)
      && this.args.candidateData.birthCountry);
  }

  get isValidBirthdate() {
    const [year, month, day] = this.args.candidateData.birthdate.split('-');
    const inputDate = new Date(year, month, day).getTime();
    return inputDate > firstOf20thCentury;
  }

  @action
  focusLastName() {
    this.lastNameFocused = true;
  }

  @action
  focusFirstName() {
    this.firstNameFocused = true;
  }

  @action
  focusBirthdate() {
    this.birthdateFocused = true;
  }

  @action
  focusBirthCity() {
    this.birthCityFocused = true;
  }

  @action
  focusBirthProvinceCode() {
    this.birthProvinceCodeFocused = true;
  }

  @action
  focusBirthCountry() {
    this.birthCountryFocused = true;
  }

  @action
  updateCandidateDataBirthdate(unmasked, masked) {
    this.maskedBirthdate = masked;
    this.args.updateCandidateBirthdate(this.args.candidateData, unmasked);
  }

  @action
  cancel() {
    this.args.onClickCancel(this.args.candidateData);
  }
}
