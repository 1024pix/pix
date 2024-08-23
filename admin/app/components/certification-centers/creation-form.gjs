import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixCheckbox from '@1024pix/pix-ui/components/pix-checkbox';
import PixInput from '@1024pix/pix-ui/components/pix-input';
import PixSelect from '@1024pix/pix-ui/components/pix-select';
import { concat, fn } from '@ember/helper';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';

import { types } from '../../models/certification-center';

export default class CertificationCenterForm extends Component {
  @tracked habilitations = [];
  certificationCenterTypes = types;

  constructor() {
    super(...arguments);
    Promise.resolve(this.args.certificationCenter.habilitations).then((habilitations) => {
      this.habilitations = habilitations;
    });
  }
  @action
  handleCenterNameChange(event) {
    this.args.certificationCenter.name = event.target.value;
  }

  @action
  handleExternalIdChange(event) {
    this.args.certificationCenter.externalId = event.target.value;
  }

  @action
  handleIsV3PilotChange(event) {
    this.args.certificationCenter.isV3Pilot = event.target.checked;
  }

  @action
  handleDataProtectionOfficerFirstNameChange(event) {
    this.args.certificationCenter.dataProtectionOfficerFirstName = event.target.value;
  }

  @action
  handleDataProtectionOfficerLastNameChange(event) {
    this.args.certificationCenter.dataProtectionOfficerLastName = event.target.value;
  }

  @action
  handleDataProtectionOfficerEmailChange(event) {
    this.args.certificationCenter.dataProtectionOfficerEmail = event.target.value;
  }

  @action
  selectCertificationCenterType(value) {
    this.args.certificationCenter.type = value;
  }

  @action
  updateGrantedHabilitation(habilitation) {
    const habilitations = this.habilitations;
    if (habilitations.includes(habilitation)) {
      habilitations.removeObject(habilitation);
    } else {
      habilitations.addObject(habilitation);
    }
  }

  <template>
    <form class="form certification-center-form" {{on "submit" @onSubmit}}>

      <PixInput
        @id="certificationCenterName"
        onchange={{this.handleCenterNameChange}}
        class="form-field"
        required={{true}}
        aria-required={{true}}
      >
        <:label>Nom du centre</:label>
      </PixInput>

      <div class="form-field">
        <PixSelect
          @options={{this.certificationCenterTypes}}
          @placeholder="-- Choisissez --"
          @hideDefaultOption={{true}}
          @onChange={{this.selectCertificationCenterType}}
          @value={{@certificationCenter.type}}
          required={{true}}
          aria-required={{true}}
        >
          <:label>Type d'établissement</:label>
          <:default as |certificationCenterType|>{{certificationCenterType.label}}</:default>
        </PixSelect>
      </div>

      <PixInput @id="certificationCenterExternalId" onchange={{this.handleExternalIdChange}} class="form-field">
        <:label>Identifiant externe</:label>
      </PixInput>

      <PixInput
        @id="dataProtectionOfficerFirstName"
        {{on "change" this.handleDataProtectionOfficerFirstNameChange}}
        class="form-field"
      >
        <:label>Prénom du DPO</:label>
      </PixInput>

      <PixInput
        @id="dataProtectionOfficerLastName"
        {{on "change" this.handleDataProtectionOfficerLastNameChange}}
        class="form-field"
      >
        <:label>Nom du DPO</:label>
      </PixInput>

      <PixInput
        @id="dataProtectionOfficerEmail"
        {{on "change" this.handleDataProtectionOfficerEmailChange}}
        class="form-field"
      >
        <:label>Adresse e-mail du DPO</:label>
      </PixInput>

      <div class="form-field">
        <PixCheckbox @id="isV3Pilot" @size="small" onChange={{this.handleIsV3PilotChange}}>
          <:label>{{t "components.certification-centers.is-v3-pilot-label"}}</:label>
        </PixCheckbox>
      </div>

      <section>
        <h2 class="habilitations-title">Habilitations aux certifications complémentaires</h2>
        <ul class="form-field habilitations-checkbox-list">
          {{#each @habilitations as |habilitation index|}}
            <li class="habilitation-entry">
              <PixCheckbox
                @id={{concat "habilitation_" index}}
                @size="small"
                onChange={{fn this.updateGrantedHabilitation habilitation}}
              >
                <:label>{{habilitation.label}}</:label>
              </PixCheckbox>
            </li>
          {{/each}}
        </ul>
      </section>

      <ul class="form-actions">
        <li>
          <PixButton @size="small" @variant="secondary" @triggerAction={{@onCancel}}>
            {{t "common.actions.cancel"}}
          </PixButton>
        </li>
        <li>
          <PixButton @type="submit" @size="small">
            {{t "common.actions.add"}}
          </PixButton>
        </li>
      </ul>
    </form>
  </template>
}
