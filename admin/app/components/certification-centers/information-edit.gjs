import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixCheckbox from '@1024pix/pix-ui/components/pix-checkbox';
import PixInput from '@1024pix/pix-ui/components/pix-input';
import PixSelect from '@1024pix/pix-ui/components/pix-select';
import { fn } from '@ember/helper';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import pick from 'ember-composable-helpers/helpers/pick';
import { t } from 'ember-intl';
import set from 'ember-set-helper/helpers/set';

import contains from '../../helpers/contains.js';
import { types } from '../../models/certification-center';

export default class InformationEdit extends Component {
  @service store;
  @tracked habilitations = [];
  certificationCenterTypes = types;

  constructor() {
    super(...arguments);
    this.form = this.store.createRecord('certification-center-form');
    Promise.resolve(this.args.certificationCenter.habilitations).then((habilitations) => {
      this.habilitations = habilitations;
    });

    this._initForm();
  }

  get availableHabilitations() {
    return this.args.availableHabilitations?.sortBy('id');
  }

  @action
  selectCertificationCenterType(value) {
    this.form.set('type', value ? value.trim() : value);
  }

  @action
  updateIsV3Pilot(event) {
    this.form.set('isV3Pilot', event.target.checked);
  }

  @action
  async updateGrantedHabilitation(habilitation) {
    const habilitations = await this.form.habilitations;
    if (habilitations.includes(habilitation)) {
      habilitations.removeObject(habilitation);
    } else {
      habilitations.addObject(habilitation);
    }
  }

  @action
  async updateCertificationCenter(event) {
    event.preventDefault();

    const { validations } = await this.form.validate();
    if (!validations.isValid) {
      return;
    }
    const habilitations = await this.form.habilitations;
    this.args.certificationCenter.set('name', this.form.name);
    this.args.certificationCenter.set('externalId', !this.form.externalId ? null : this.form.externalId);
    this.args.certificationCenter.set('type', this.form.type);
    this.args.certificationCenter.set('habilitations', habilitations);
    this.args.certificationCenter.set('dataProtectionOfficerFirstName', this.form.dataProtectionOfficerFirstName);
    this.args.certificationCenter.set('dataProtectionOfficerLastName', this.form.dataProtectionOfficerLastName);
    this.args.certificationCenter.set('dataProtectionOfficerEmail', this.form.dataProtectionOfficerEmail);
    this.args.certificationCenter.set('isV3Pilot', this.form.isV3Pilot);

    this.args.toggleEditMode();
    return this.args.onSubmit();
  }

  async _initForm() {
    const habilitations = await this.args.certificationCenter.habilitations;
    const properties = this.args.certificationCenter.getProperties(
      'name',
      'externalId',
      'type',
      'dataProtectionOfficerFirstName',
      'dataProtectionOfficerLastName',
      'dataProtectionOfficerEmail',
      'isV3Pilot',
    );
    this.form.setProperties({ ...properties, habilitations });
  }

  <template>
    <h2 class="certification-center-information__edit-title">Modifier un centre de certification</h2>
    <form class="form certification-center-information__edit-form" onsubmit={{this.updateCertificationCenter}}>

      <PixInput
        class={{if this.form.validations.attrs.name.isInValid "form-control is-invalid" "form-control"}}
        @value={{this.form.name}}
        @requiredLabel={{true}}
        {{on "input" (pick "target.value" (set this "form.name"))}}
      >
        <:label>Nom du centre</:label>
      </PixInput>

      {{#if this.form.validations.attrs.name.isInvalid}}
        <span class="error" aria-label="Message d'erreur du champ nom">
          {{this.form.validations.attrs.name.message}}
        </span>
      {{/if}}

      <PixSelect
        @options={{this.certificationCenterTypes}}
        @placeholder="-- Choisissez --"
        @value={{this.form.type}}
        @onChange={{this.selectCertificationCenterType}}
        @errorMessage={{this.form.validations.attrs.type.message}}
      >
        <:label>Type</:label>
        <:default as |certificationCenterType|>{{certificationCenterType.label}}</:default>
      </PixSelect>

      <PixInput
        class={{if this.form.validations.attrs.externalId.isInvalid "form-control is-invalid" "form-control"}}
        @value={{this.form.externalId}}
        {{on "input" (pick "target.value" (set this "form.externalId"))}}
      >
        <:label>Identifiant externe</:label>
      </PixInput>

      {{#if this.form.validations.attrs.externalId.isInvalid}}
        <span class="error" aria-label="Message d'erreur du champ ID externe">
          {{this.form.validations.attrs.externalId.message}}
        </span>
      {{/if}}

      <PixInput
        class={{if
          this.form.validations.attrs.dataProtectionOfficerFirstName.isInvalid
          "form-control is-invalid"
          "form-control"
        }}
        @value={{this.form.dataProtectionOfficerFirstName}}
        {{on "input" (pick "target.value" (set this "form.dataProtectionOfficerFirstName"))}}
      >
        <:label>Prénom du <abbr title="Délégué à la protection des données">DPO</abbr></:label>
      </PixInput>

      {{#if this.form.validations.attrs.dataProtectionOfficerFirstName.isInvalid}}
        <span class="error" aria-label="Message d'erreur du champ Prénom du DPO">
          {{this.form.validations.attrs.dataProtectionOfficerFirstName.message}}
        </span>
      {{/if}}

      <PixInput
        class={{if
          this.form.validations.attrs.dataProtectionOfficerLastName.isInvalid
          "form-control is-invalid"
          "form-control"
        }}
        @value={{this.form.dataProtectionOfficerLastName}}
        {{on "input" (pick "target.value" (set this "form.dataProtectionOfficerLastName"))}}
      ><:label>Nom du <abbr title="Délégué à la protection des données">DPO</abbr></:label></PixInput>

      {{#if this.form.validations.attrs.dataProtectionOfficerLastName.isInvalid}}
        <span class="error" aria-label="Message d'erreur du champ Nom du DPO">
          {{this.form.validations.attrs.dataProtectionOfficerLastName.message}}
        </span>
      {{/if}}

      <PixInput
        class={{if
          this.form.validations.attrs.dataProtectionOfficerEmail.isInvalid
          "form-control is-invalid"
          "form-control"
        }}
        @value={{this.form.dataProtectionOfficerEmail}}
        {{on "input" (pick "target.value" (set this "form.dataProtectionOfficerEmail"))}}
      ><:label>Adresse e-mail du <abbr title="Délégué à la protection des données">DPO</abbr></:label></PixInput>

      {{#if this.form.validations.attrs.dataProtectionOfficerEmail.isInvalid}}
        <span class="error" aria-label="Message d'erreur du champ Adresse e-mail du DPO">
          {{this.form.validations.attrs.dataProtectionOfficerEmail.message}}
        </span>
      {{/if}}

      <PixCheckbox @id="isV3Pilot" @size="small" onChange={{this.updateIsV3Pilot}} @checked={{this.form.isV3Pilot}}>
        <:label>{{t "components.certification-centers.is-v3-pilot-label"}}</:label>
      </PixCheckbox>

      <span class="field-label">Habilitations aux certifications complémentaires</span>
      <ul class="form-field certification-center-information__edit-form__habilitations-checkbox-list">
        {{#each this.availableHabilitations as |habilitation|}}
          <li class="habilitation-entry">
            <PixCheckbox
              @checked={{contains habilitation this.habilitations}}
              {{on "change" (fn this.updateGrantedHabilitation habilitation)}}
            >
              <:label>
                {{habilitation.label}}
              </:label>
            </PixCheckbox>
          </li>
        {{/each}}
      </ul>

      <div class="certification-center-information__action-buttons">
        <PixButton @size="small" @variant="secondary" @triggerAction={{@toggleEditMode}}>
          {{t "common.actions.cancel"}}
        </PixButton>
        <PixButton @type="submit" @size="small" @variant="primary" @triggerAction={{this.updateCertificationCenter}}>
          {{t "common.actions.save"}}
        </PixButton>
      </div>
    </form>
  </template>
}
