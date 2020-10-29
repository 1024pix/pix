import Controller from '@ember/controller';
import { computed } from '@ember/object';
import { alias } from '@ember/object/computed';
import config from 'pix-certif/config/environment';

export default class SessionsDetailsController extends Controller {

  isResultRecipientEmailVisible = config.APP.FT_IS_RESULT_RECIPIENT_EMAIL_VISIBLE;

  @alias('model.session') session;
  @alias('model.certificationCandidates') certificationCandidates;

  @computed('certificationCandidates.length')
  get certificationCandidatesCount() {
    const certificationCandidatesCount = this.certificationCandidates.length;
    return certificationCandidatesCount > 0 ? `(${certificationCandidatesCount})`  : '';
  }

  @computed('certificationCandidates.length')
  get hasOneOrMoreCandidates() {
    const certificationCandidatesCount = this.certificationCandidates.length;
    return certificationCandidatesCount > 0;
  }
}
