import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

const FRANCE_INSEE_CODE = '99100';
const INSEE_CODE_OPTION = 'insee';
const POSTAL_CODE_OPTION = 'postal';

import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixInput from '@1024pix/pix-ui/components/pix-input';
import PixModal from '@1024pix/pix-ui/components/pix-modal';
import PixRadioButton from '@1024pix/pix-ui/components/pix-radio-button';
import PixSelect from '@1024pix/pix-ui/components/pix-select';
import { fn } from '@ember/helper';
import { on } from '@ember/modifier';
import pick from 'ember-composable-helpers/helpers/pick';
import EmberFlatpickr from 'ember-flatpickr/components/ember-flatpickr';
import set from 'ember-set-helper/helpers/set';
import { eq } from 'ember-truth-helpers';

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
            <PixInput
              class="input"
              @value={{this.lastName}}
              {{on "input" (pick "target.value" (set this "lastName"))}}
              required
            ><:label>Nom de famille</:label></PixInput>
          </div>

          <div class="candidate-edit-modal--content__field">
            <PixInput
              class="input"
              @value={{this.firstName}}
              required
              {{on "input" (pick "target.value" (set this "firstName"))}}
            ><:label>Prénom</:label></PixInput>
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
            <label for="birthdate">
              Date de naissance
            </label>
            <EmberFlatpickr
              id="birthdate"
              @altFormat="d/m/Y"
              @altInput={{true}}
              @onChange={{this.updateBirthdate}}
              @dateFormat="Y-m-d"
              @locale="fr"
              @date={{this.birthdate}}
            />
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
                {{on "input" (pick "target.value" (set this "birthInseeCode"))}}
              ><:label>
                  Code Insee de naissance
                </:label></PixInput>
            </div>
          {{/if}}

          {{#if this.isBirthPostalCodeRequired}}
            <div class="candidate-edit-modal--content__field">
              <PixInput
                class="input"
                @value={{this.birthPostalCode}}
                required
                {{on "input" (pick "target.value" (set this "birthPostalCode"))}}
              ><:label>
                  Code postal de naissance
                </:label></PixInput>
            </div>
          {{/if}}

          {{#if this.isBirthCityRequired}}
            <div class="candidate-edit-modal--content__field">
              <PixInput
                class="input"
                @value={{this.birthCity}}
                required
                {{on "input" (pick "target.value" (set this "birthCity"))}}
              ><:label>
                  Commune de naissance
                </:label></PixInput>
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
