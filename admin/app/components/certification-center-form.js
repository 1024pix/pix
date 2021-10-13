import { action } from '@ember/object';
import Component from '@glimmer/component';
import { types } from '../models/certification-center';

export default class CertificationCenterForm extends Component {
  certificationCenterTypes = types;

  @action
  selectCertificationCenterType(event) {
    this.args.certificationCenter.type = event.target.value;
  }

  @action
  updateGrantedAccreditation(accreditation) {
    const accreditations = this.args.certificationCenter.accreditations;
    if (accreditations.includes(accreditation)) {
      accreditations.removeObject(accreditation);
    } else {
      accreditations.addObject(accreditation);
    }
  }
}
