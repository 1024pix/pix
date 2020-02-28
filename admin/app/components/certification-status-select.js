import { action } from '@ember/object';
import CertificationInfoField from './certification-info-field';

export default class CertificationStatusSelect extends CertificationInfoField {
  @action
  selectOption(value) {
    this.set('value', value);
  }
}
