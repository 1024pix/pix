/* eslint-disable ember/no-computed-properties-in-native-classes*/

import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import { alias } from '@ember/object/computed';

export default class SessionsDetailsController extends Controller {
  @service currentUser;

  @alias('model.session') session;
  @alias('model.certificationCandidates') certificationCandidates;
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

  @computed('hasOneOrMoreCandidates')
  get shouldDisplayDownloadButton() {
    return this.hasOneOrMoreCandidates;
  }

  @computed('shouldDisplayPrescriptionScoStudentRegistrationFeature')
  get shouldDisplayResultRecipientInfoMessage() {
    return !this.shouldDisplayPrescriptionScoStudentRegistrationFeature;
  }
}
