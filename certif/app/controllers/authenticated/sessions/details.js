import Controller from '@ember/controller';
import { computed } from '@ember/object';
import { alias } from '@ember/object/computed';

export default class SessionsDetailsController extends Controller {

  @alias('model') session;

  @computed('session.certificationCandidates.length')
  get certificationCandidatesCount() {
    const certificationCandidatesCount = this.session.certificationCandidates.length;
    return certificationCandidatesCount > 0 ? `(${certificationCandidatesCount})`  : '';
  }
}
