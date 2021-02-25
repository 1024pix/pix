/* eslint-disable ember/no-computed-properties-in-native-classes*/

import Controller from '@ember/controller';
import { alias } from '@ember/object/computed';
import every from 'lodash/every';
import { computed } from '@ember/object';
import { action } from '@ember/object';

export default class CertificationCandidatesController extends Controller {

  @alias('model.session') currentSession;
  @alias('model.certificationCandidates') certificationCandidates;
  @alias('model.reloadCertificationCandidate') reloadCertificationCandidate;
  @alias('model.shouldDisplayPrescriptionScoStudentRegistrationFeature') shouldDisplayPrescriptionScoStudentRegistrationFeature;

  @computed('certificationCandidates', 'certificationCandidates.@each.isLinked')
  get importAllowed() {
    return every(this.certificationCandidates.toArray(), (certificationCandidate) => {
      return !certificationCandidate.isLinked;
    });
  }

  @computed('model.certificationCandidates.length')
  get hasOneOrMoreCandidates() {
    const certificationCandidatesCount = this.model.certificationCandidates.length;
    return certificationCandidatesCount > 0;
  }

  @action
  async reloadCertificationCandidateInController() {
    await this.reloadCertificationCandidate();
  }
}
