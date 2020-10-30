import CertificationInfoField from './certification-info-field';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { find } from 'lodash';

const options = [
  { value: 'started', label: 'Démarrée' },
  { value: 'error', label: 'En erreur' },
  { value: 'validated', label: 'Validée' },
  { value: 'rejected', label: 'Rejetée' },
];

export default class CertificationStatusSelect extends CertificationInfoField {

  @tracked selectedOption = null;

  constructor() {
    super(...arguments);
    this.statusOptions = options;
    this.selectedOption = this.getOption(this.args.certification.status);
  }

  getOption(optionValue) {
    return find(options, { value: optionValue });
  }

  @action
  selectOption(selected) {
    this.selectedOption = selected;
    this.args.certification.status = selected.value;
  }
}
