import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

export default class CertificationCenterForm extends Component {

  certificationCenterTypes = [
    { value: 'PRO', label: 'Organisation professionnelle' },
    { value: 'SCO', label: 'Établissement scolaire' },
    { value: 'SUP', label: 'Établissement supérieur' },
  ];

  @tracked selectedCertificationCenterType;

  @action
  selectCertificationCenterType(certificationCenterType) {
    this.selectedCertificationCenterType = certificationCenterType;
    this.args.certificationCenter.type = certificationCenterType.value;
  }
}
