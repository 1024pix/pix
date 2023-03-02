import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
/* eslint-disable ember/no-computed-properties-in-native-classes*/
import { computed } from '@ember/object';
import { alias } from '@ember/object/computed';
/* eslint-enable ember/no-computed-properties-in-native-classes*/

export default class SessionsDetailsController extends Controller {
  @service currentUser;
  @service intl;

  @alias('model.session') session;
  @alias('model.certificationCandidates') certificationCandidates;

  get pageTitle() {
    return `${this.intl.t('pages.sessions.detail.page-title')} | Session ${this.session.id} | Pix Certif`;
  }

  @computed('certificationCandidates.length')
  get certificationCandidatesCount() {
    const certificationCandidatesCount = this.certificationCandidates.length;
    return certificationCandidatesCount > 0 ? `(${certificationCandidatesCount})` : '';
  }

  @computed('certificationCandidates.length')
  get hasOneOrMoreCandidates() {
    const certificationCandidatesCount = this.certificationCandidates.length;
    return certificationCandidatesCount > 0;
  }

  @computed('hasOneOrMoreCandidates')
  get shouldDisplayDownloadButton() {
    return this.hasOneOrMoreCandidates;
  }

  get shouldDisplayPrescriptionScoStudentRegistrationFeature() {
    return this.currentUser.currentAllowedCertificationCenterAccess.isScoManagingStudents;
  }
}
