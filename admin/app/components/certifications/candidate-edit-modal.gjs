import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

const FRANCE_INSEE_CODE = '99100';
const INSEE_CODE_OPTION = 'insee';
const POSTAL_CODE_OPTION = 'postal';

import { PixButton, PixInput, PixModal, PixRadioButton, PixSelect } from '@1024pix/nebulix-ember';
import { fn } from '@ember/helper';
import { on } from '@ember/modifier';
import { service } from '@ember/service';
import { eq, or } from 'ember-truth-helpers';

export default class CandidateEditModal extends Component {
  @service store;

  @tracked firstName;
  @tracked lastName;
  @tracked birthdate;
  @tracked birthCity;
  @tracked sex;
  @tracked birthInseeCode;
  @tracked birthPostalCode;
  @tracked birthCountry;
  @tracked countries = [];

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
    return this.countries.map((country) => {
      return { label: country.name, value: country.code };
    });
  }

  get selectedCountryOption() {
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
  onChangeFirstName(event) {
    this.firstName = event.target.value;
  }

  @action
  onChangeLastName(event) {
    this.lastName = event.target.value;
  }

  @action
  onChangeBirthInseeCode(event) {
    this.birthInseeCode = event.target.value;
  }

  @action
  onChangeBirthPostalCode(event) {
    this.birthPostalCode = event.target.value;
  }

  @action
  onChangeBirthCity(event) {
    this.birthCity = event.target.value;
  }

  @action
  onChangeBirthdate(event) {
    this.birthdate = event.target.value;
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
    } catch {
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

  async _initForm() {
    const candidate = this.args.candidate;
    this.firstName = candidate.firstName;
    this.lastName = candidate.lastName;
    this.birthdate = candidate.birthdate;
    this.sex = candidate.sex;
    this.birthCountry = candidate.birthCountry;
    this._initBirthInformation(candidate);
    this.countries = this.store.peekAll('country').length
      ? this.store.peekAll('country')
      : await this.store.findAll('country');
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
    const country = this.countries.find((country) => country.code === this.selectedCountryInseeCode);
    return country.name;
  }

  <template>
    <PixModal
      @title="Modifier les informations du candidat"
      @onCloseButtonClick={{this.onCancelButtonsClicked}}
      @showModal={{@isDisplayed}}
    >
      <:content>
        <form id="candidate-edit-form" {{on "submit" this.onFormSubmit}}>
          <p class="candidate-edit-modal--content__required-fields-mention">
            Tous les champs sont obligatoires.
          </p>

          <div class="candidate-edit-modal--content__field">
            <PixInput class="input" @value={{this.lastName}} {{on "input" this.onChangeLastName}} required>
              <:label>Nom de famille</:label>
            </PixInput>
          </div>

          <div class="candidate-edit-modal--content__field">
            <PixInput class="input" @value={{this.firstName}} {{on "input" this.onChangeFirstName}} required>
              <:label>Prénom</:label>
            </PixInput>
          </div>

          <div class="candidate-edit-modal--content__field-radio-button">
            Sexe
            <div class="radio-button-container">
              <PixRadioButton
                name="sex"
                checked={{if (eq this.sex "F") true}}
                {{on "change" (fn this.updateSexValue "F")}}
                required
              >
                <:label>Femme</:label>
              </PixRadioButton>
              <PixRadioButton
                name="sex"
                checked={{if (eq this.sex "M") true}}
                {{on "change" (fn this.updateSexValue "M")}}
                required
              >
                <:label>Homme</:label>
              </PixRadioButton>
            </div>
          </div>

          <div class="candidate-edit-modal--content__field">
            <PixInput class="input" type="date" @value={{or this.birthdate ""}} {{on "input" this.onChangeBirthdate}}>
              <:label>Date de naissance</:label>
            </PixInput>
          </div>

          <div class="candidate-edit-modal--content__field">
            <PixSelect
              @label="Pays de naissance"
              @options={{this.countryOptions}}
              @onChange={{this.selectBirthCountry}}
              @value={{this.selectedCountryOption}}
              required
            >
              <:label>Pays de naissance</:label>
            </PixSelect>
          </div>

          {{#if this.isBirthGeoCodeRequired}}
            <div class="candidate-edit-modal--content__field-radio-button">
              Code géographique de naissance
              <div class="radio-button-container">
                <PixRadioButton
                  name="birth-geo-code-option"
                  checked={{if (eq this.selectedBirthGeoCodeOption "insee") true}}
                  {{on "change" (fn this.selectBirthGeoCodeOption "insee")}}
                  required
                >
                  <:label>Code INSEE</:label>
                </PixRadioButton>
                <PixRadioButton
                  name="birth-geo-code-option"
                  checked={{if (eq this.selectedBirthGeoCodeOption "postal") true}}
                  {{on "change" (fn this.selectBirthGeoCodeOption "postal")}}
                  required
                >
                  <:label>Code postal</:label>
                </PixRadioButton>
              </div>
            </div>
          {{/if}}

          {{#if this.isBirthInseeCodeRequired}}
            <div class="candidate-edit-modal--content__field">
              <PixInput
                class="input"
                @value={{this.birthInseeCode}}
                required
                {{on "input" this.onChangeBirthInseeCode}}
              >
                <:label>
                  Code Insee de naissance
                </:label>
              </PixInput>
            </div>
          {{/if}}

          {{#if this.isBirthPostalCodeRequired}}
            <div class="candidate-edit-modal--content__field">
              <PixInput
                class="input"
                @value={{this.birthPostalCode}}
                required
                {{on "input" this.onChangeBirthPostalCode}}
              >
                <:label>
                  Code postal de naissance
                </:label>
              </PixInput>
            </div>
          {{/if}}

          {{#if this.isBirthCityRequired}}
            <div class="candidate-edit-modal--content__field">
              <PixInput class="input" @value={{this.birthCity}} {{on "input" this.onChangeBirthCity}} required>
                <:label>
                  Commune de naissance
                </:label>
              </PixInput>
            </div>
          {{/if}}
        </form>
      </:content>

      <:footer>
        <PixButton @size="small" @variant="secondary" @triggerAction={{this.onCancelButtonsClicked}}>
          Annuler
        </PixButton>
        <PixButton form="candidate-edit-form" @size="small" @type="submit">
          Enregistrer
        </PixButton>
      </:footer>
    </PixModal>
  </template>
}
