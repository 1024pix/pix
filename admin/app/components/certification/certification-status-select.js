import CertificationInfoField from './certification-info-field';
import { action } from '@ember/object';

export default class CertificationStatusSelect extends CertificationInfoField {

  @action
  selectOption(value) {
    this.args.certification.status = value;
  }
}
