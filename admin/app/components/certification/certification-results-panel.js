import { action } from '@ember/object';
import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class CertificationCertificationResultsPanelComponent extends Component {

  @service store;

  @tracked displayScoringSimulator = false;
  @tracked certificationDetails = null;

  @action
  async openScoringSimulator() {
    this.certificationDetails = await this.store.findRecord('certificationDetails', this.args.certification.id);
    this.displayScoringSimulator = true;
  }

  @action
  closeScoringSimulator() {
    this.displayScoringSimulator = false;
    this.certificationDetails = null;
  }
}
