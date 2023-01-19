import CertificationInfoField from './info-field';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { certificationStatuses } from 'pix-admin/models/certification';

export default class CertificationStatusSelect extends CertificationInfoField {
  @tracked selectedOption = null;

  constructor() {
    super(...arguments);
    this.options = certificationStatuses.filter((certificationStatus) => certificationStatus.value !== 'cancelled');

    this.selectedOption = this.args.certification.statusLabelAndValue;
  }

  @action
  selectOption(selectedOptionValue) {
    this.args.certification.status = selectedOptionValue;
    this.selectedOption = selectedOptionValue;
  }
}
