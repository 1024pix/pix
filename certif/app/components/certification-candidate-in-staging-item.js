import Component from '@glimmer/component';
import { action } from '@ember/object';

export default class CertificationCandidateInStagingItem extends Component {

  @action
  updateCandidateDataBirthdate(value) {
    this.args.updateCandidateBirthdate(this.args.candidateData, value);
  }
}
