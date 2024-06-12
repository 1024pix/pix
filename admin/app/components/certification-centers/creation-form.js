import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

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
}
