import CertificationInfoField from './certification-info-field';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import find from 'lodash/find';

export default class CertificationStatusSelect extends CertificationInfoField {

  @tracked selectedOption = null;

  constructor() {
    super(...arguments);
    this.options = [
      { value: 'started', label: 'Démarrée' },
      { value: 'error', label: 'En erreur' },
      { value: 'validated', label: 'Validée' },
      { value: 'rejected', label: 'Rejetée' },
    ];
    this.selectedOption = this.getOptionByValue(this.args.certification.status);
  }

  @action
  selectOption(event) {
    const selectedOptionValue = event.target.value || null;
    this.args.certification.status = selectedOptionValue;
    this.selectedOption = this.getOptionByValue(selectedOptionValue);
  }

  getOptionByValue(value) {
    return find(this.options, { value });
  }
}
