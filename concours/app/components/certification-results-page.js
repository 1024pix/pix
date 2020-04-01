import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class CertificationResultsPage extends Component {
  @tracked validSupervisor = false;
  @tracked notFinishedYet = true;

  @action
  validateBySupervisor() {
    if (this.validSupervisor) {
      this.notFinishedYet = false;
    }
  }
}
