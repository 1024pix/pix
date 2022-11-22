import { action } from '@ember/object';
import Component from '@glimmer/component';
import { types } from '../../models/certification-center';

export default class CertificationCenterForm extends Component {
  certificationCenterTypes = types;

  @action
  handleCenterNameChange(event) {
    this.args.certificationCenter.name = event.target.value;
  }

  @action
  handleExternalIdChange(event) {
    this.args.certificationCenter.externalId = event.target.value;
  }

  @action
  toggleSupervisorAccess() {
    this.args.certificationCenter.isSupervisorAccessEnabled = !this.args.certificationCenter.isSupervisorAccessEnabled;
  }

  @action
  selectCertificationCenterType(event) {
    this.args.certificationCenter.type = event.target.value;
  }

  @action
  updateGrantedHabilitation(habilitation) {
    const habilitations = this.args.certificationCenter.habilitations;
    if (habilitations.includes(habilitation)) {
      habilitations.removeObject(habilitation);
    } else {
      habilitations.addObject(habilitation);
    }
  }
}
