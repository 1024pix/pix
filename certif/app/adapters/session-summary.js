import ApplicationAdapter from './application';
import { inject as service } from '@ember/service';

export default class SessionSummary extends ApplicationAdapter {
  @service currentUser;

  urlForQuery(_) {
    const certificationCenterId = this.currentUser.currentAllowedCertificationCenterAccess.id;
    return `${this.host}/${this.namespace}/certification-centers/${certificationCenterId}/session-summaries`;
  }
}
