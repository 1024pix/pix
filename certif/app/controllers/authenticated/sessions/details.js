/* eslint-disable ember/no-computed-properties-in-native-classes*/

import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import { alias } from '@ember/object/computed';
import config from 'pix-certif/config/environment';

export default class SessionsDetailsController extends Controller {
  @service currentUser;

  isResultRecipientEmailVisible = config.APP.FT_IS_AUTO_SENDING_OF_CERTIF_RESULTS;

  @alias('model.session') session;
  @alias('model.certificationCandidates') certificationCandidates;
  @alias('model.isReportsCategorizationFeatureToggleEnabled') isReportsCategorizationFeatureToggleEnabled;
  @alias('model.shouldDisplayPrescriptionScoStudentRegistrationFeature') shouldDisplayPrescriptionScoStudentRegistrationFeature;

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

  @computed('hasOneOrMoreCandidates', 'shouldDisplayPrescriptionScoStudentRegistrationFeature', 'isResultRecipientEmailVisible')
  get shouldDisplayDownloadButton() {
    return this.hasOneOrMoreCandidates && (this.shouldDisplayPrescriptionScoStudentRegistrationFeature || this.isResultRecipientEmailVisible);
  }

  @computed('isResultRecipientEmailVisible', 'currentUser.currentCertificationCenter.isScoManagingStudents')
  get shouldDisplayResultRecipientInfoMessage() {
    return this.isResultRecipientEmailVisible === true && this.currentUser.currentCertificationCenter.isScoManagingStudents === false;
  }
}
