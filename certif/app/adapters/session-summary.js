import ApplicationAdapter from './application';
import { inject as service } from '@ember/service';

export default class CompetenceEvaluation extends ApplicationAdapter {

  @service currentUser;

  urlForQuery(_) {
    const certificationCenterId = this.currentUser.currentCertificationCenter.id;
    return `${this.host}/${this.namespace}/certification-centers/${certificationCenterId}/session-summaries`;
  }
}
